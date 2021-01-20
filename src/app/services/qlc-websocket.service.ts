import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import  uuid from 'uuid/v4';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class QLCWebSocketService {

  queuedCommands = [];

  queuedAwaitAnswers = [];

  reconnectTimeout = 5 * 1000;

  socket = {
    connected: false,
    ws: null,
  };

  subscribedAccounts = [];

  latestTransactions = [];
  latestBlocks = [];

  latestTransactionTimeStamp = 0;
  latestBlocksTimeStamp = 0;

  latest5Transactions = [];
  latest5Blocks = [];

  povLatestHeader = {
    basHdr: {
      height : 0
    }
  };

  ledger_subscription = [];
  pov_subscription = [];
  debug_subscription = [];
  
  debug = false;

  constructor(
    private walletService: WalletService
  ) {
    const now = new Date().getTime();
    this.latestTransactionTimeStamp = now;
    this.latestBlocksTimeStamp = now;
  }

  wsUrl = environment.wsUrl[environment.qlcChainNetwork];

  connect() {
    if (this.socket.connected && this.socket.ws) return;
    delete this.socket.ws; // Maybe this will erase old connections

    const ws = new WebSocket(this.wsUrl);
    this.socket.ws = ws;

    ws.onopen = event => {
      this.socket.connected = true;
      if (this.debug) {
        console.log('Socket open');
      }
      this.send('ledger_subscribe',['newBlock']);
      this.send('pov_getLatestHeader',[]);
      this.send('pov_subscribe',['newBlock']);
      this.send('ledger_blocks',[10, 0]);
      //this.send('debug_subscribe',['newBlock']);

      for (const account of this.walletService.wallet.accounts) {
        this.send('ledger_subscribe',['balanceChange',account.id]);
        this.send('ledger_subscribe',['newPending',account.id]);
      }
      this.queuedCommands.forEach(event => ws.send(JSON.stringify(event)));
      
      if (this.debug) {
        console.log(this.ledger_subscription);
      }
      // Resubscribe to accounts?
      if (this.subscribedAccounts.length) {
        //this.subscribeAccounts(this.subscribedAccounts);
      }
    };
    ws.onerror = event => {
      // this.socket.connected = false;
      console.log(`Socket error`, event);
    };
    ws.onclose = event => {
      this.socket.connected = false;
      console.log(`Socket close`, event);

      // Start attempting to recconect
      setTimeout(() => this.attemptReconnect(), this.reconnectTimeout);
    };
    ws.onmessage = async event => {
      try {
        const newEvent = JSON.parse(event.data);
        //console.log(newEvent);
        if (newEvent.method === 'debug_subscription') {
          
          if (this.debug) {
            console.log('debug_subscription found, checking subscription');
            console.log('sub ' + newEvent.params.subscription);
            console.log(this.debug_subscription);
          }
          const sub = this.debug_subscription.find(o => o.id === newEvent.params.subscription);
          if (sub) {
            if (this.debug) {
              console.log('debug sub found');
              console.log(sub);
            }
          }


          return;
        }
        if (newEvent.method === 'pov_subscription') {
          if (this.debug) {
            console.log('pov_subscription found, checking subscription');
            console.log('sub ' + newEvent.params.subscription);
            console.log(this.pov_subscription);
          }
          const sub = this.pov_subscription.find(o => o.id === newEvent.params.subscription);
          if (sub) {
            if (this.debug) {
              console.log('pov sub found');
              console.log(sub);
            }
            if (sub.method === 'newBlock') {
              this.pov_newBlock(newEvent.params.result)
            }
          }


          return;
        }
        if (newEvent.method === 'ledger_subscription') {
          //if (this.debug) {
          //}
          const sub = this.ledger_subscription.find(o => o.id === newEvent.params.subscription);
          if (sub) {
            if (this.debug) {
              if (sub.method != 'newBlock') {
                console.log(newEvent);
                console.log('ledger_subscription found, checking subscription');
                console.log('sub ' + newEvent.params.subscription);

                console.log('ledger sub found');
                console.log(sub);
              }
            }
            if (sub.method === 'newBlock') {
              if (this.debug) {
                console.log('block');
                console.log(newEvent.params.result);
              }
              this.ledger_blocks([newEvent.params.result]);
            }
            if (sub.method === 'balanceChange') {
              
              if (this.debug) {
                console.log('balanceChange');
                console.log(newEvent.params.result);
              }
                let wallet = this.walletService.wallet;
                let account = this.walletService.wallet.accounts.find(o => o.id === newEvent.params.result.account);

                await this.walletService.loadTokens();
                
                let newBalance = newEvent.params.result;

                let accountMeta = [];
                let otherTokens = [];
                if (newBalance.tokens && Array.isArray(newBalance.tokens)) {
                  newBalance.tokens.forEach(token => {
                    accountMeta[token.tokenName] = token;
                    if (this.walletService.tokenMap.hasOwnProperty(token.type)) {
                      token.tokenInfo = this.walletService.tokenMap[token.type];
                    }
                    if (token.tokenInfo.tokenSymbol != 'QLC' && token.tokenInfo.tokenSymbol != 'QGAS') {
                      otherTokens.push(token);
                    }
                  });
                }
                account.balances = accountMeta;
                account.otherTokens = otherTokens;
                


            }
            if (sub.method === 'newPending') {
              
              if (this.debug) {
                console.log('newPending');
                console.log(newEvent.params.result);
              }
              let wallet = this.walletService.wallet;
              let account = this.walletService.wallet.accounts.find(o => o.id === newEvent.params.result.account);


              await this.walletService.loadTokens();

              let newPending = newEvent.params.result;

              wallet.pendingCount += 1;
              account.pendingCount += 1;

              if (this.walletService.tokenMap.hasOwnProperty(newPending.type)) {
                newPending.tokenInfo = this.walletService.tokenMap[newPending.type];
              }
              account.pendingBlocks.push(newPending);
              if (newPending.tokenName != 'QLC' && newPending.tokenName != 'QGAS') {
                newPending.tokenName = 'OTHER';
              }
              if (!account.pendingPerTokenCount[newPending.tokenName])
                account.pendingPerTokenCount[newPending.tokenName] = 0;

              account.pendingPerTokenCount[newPending.tokenName] += 1;
              this.walletService.pendingBlocks.push({
                account: newPending.source,
                receiveAccount: account,
                amount: newPending.amount,
                token: newPending.type,
                tokenName: newPending.tokenName,
                tokenSymbol: newPending.tokenName,
                timestamp: newPending.timestamp,
                hash: newPending.hash
              });
              

              
              
            }
          }


          return;
        }
        const awaitMethod = this.queuedAwaitAnswers.find(o => o.id === newEvent.id); // find method by id
        if (awaitMethod) {
          for( var i = 0; i < this.queuedAwaitAnswers.length; i++){ // remove from awaiting
            if ( this.queuedAwaitAnswers[i].id === newEvent.id) {
              this.queuedAwaitAnswers.splice(i, 1); 
            }
          }
          if (awaitMethod.method === 'ledger_blocks') {
            
            if (this.debug) {
              console.log('latest transactions ...............................')
              console.log(newEvent.result)
            }
            this.ledger_blocks(newEvent.result, true);
          }
          if (awaitMethod.method === 'pov_getLatestHeader') {
            
            if (this.debug) {
              console.log('latest header transactions ...............................')
              console.log(newEvent.result)
            }
            this.povLatestHeader = newEvent.result;
            let count = 5;
            if (this.povLatestHeader.basHdr.height < count) {
              count = this.povLatestHeader.basHdr.height;
            }
            this.send('pov_batchGetHeadersByHeight',[this.povLatestHeader.basHdr.height, count, false]);
          }

          if (awaitMethod.method === 'pov_batchGetHeadersByHeight') {
            
            if (this.debug) {
              console.log('latest blocks transactions ...............................')
              console.log(newEvent.result.headers)
            }
            if (newEvent.result) {
              this.povBlocks(newEvent.result.headers, true);
            }
          }

          
          if (awaitMethod.method === 'ledger_subscribe') {
            if (awaitMethod.params[0] === 'newBlock') {
              
              if (this.debug) {
                console.log('newBlock ledger_subscribe')
              }
              this.ledger_subscription.push({ id:newEvent.result, method: 'newBlock'});
            }
            if (awaitMethod.params[0] === 'balanceChange') {
              
              if (this.debug) {
                console.log('balanceChange ledger_subscribe')
              }
              this.ledger_subscription.push({ id:newEvent.result, method: 'balanceChange', data: awaitMethod.params[1]});
            }
            if (awaitMethod.params[0] === 'newPending') {
              
              if (this.debug) {
                console.log('newPending ledger_subscribe')
              }
              this.ledger_subscription.push({ id:newEvent.result, method: 'newPending', data: awaitMethod.params[1]});
            }
          }
          if (awaitMethod.method === 'pov_subscribe') {
            if (awaitMethod.params[0] === 'newBlock') {
              
              if (this.debug) {
                console.log('newBlock pov_subscribe')
              }
              this.pov_subscription.push({ id:newEvent.result, method: 'newBlock'});
            }
          }
          if (awaitMethod.method === 'debug_subscribe') {
            if (awaitMethod.params[0] === 'newBlock') {
              
              if (this.debug) {
                console.log('newBlock debug_subscribe')
              }
              this.debug_subscription.push({ id:newEvent.result, method: 'newBlock'});
            }
          }

          
          if (this.debug) {
            console.log(this.queuedAwaitAnswers);
            console.log('Found method');
            console.log(awaitMethod);
          }

        }
        /*if (newEvent.event === 'newTransaction') {
          this.newTransactions$.next(newEvent.data);
        }*/
      } catch (err) {
        console.log(`Error parsing message`, err);
      }
    }
  }

  async povBlocks(results, skipTimeCheck = false) {
    const now = new Date().getTime();
    if (skipTimeCheck === false && now - this.latestBlocksTimeStamp < 1000 ) {
      return;
    }
    this.latestBlocksTimeStamp = now;
    results.sort( (a,b) => {
      return a.basHdr.height - b.basHdr.height 
    } );
    for (const block of results) {
      this.latestBlocks.unshift(block); 
    }
    //console.log(this.latestBlocks);
    this.latestBlocks.sort( (a,b) => {
      return b.basHdr.height - a.basHdr.height 
    } );
    this.latestBlocks = this.latestBlocks.filter((block, index, self) =>
    index === self.findIndex((t) => (
      t.basHdr.height === block.basHdr.height
    )));
    if (this.latestBlocks.length > 10) {
      this.latestBlocks = this.latestBlocks.slice(0,10);
    }
    this.latest5Blocks = this.latestBlocks.slice(0,5);
    
  }

  async pov_newBlock(result) {
    this.povLatestHeader = result;
    this.povBlocks([result]);
  }

  async ledger_blocks(results, skipTimeCheck = false) {
    const now = new Date().getTime();
    if (skipTimeCheck === false && now - this.latestTransactionTimeStamp < 1000 ) {
      return;
    }
    this.latestTransactionTimeStamp = now;
    results.sort( (a,b) => {
      return a.timestamp - b.timestamp 
    } );
    const blocks = await this.walletService.prepareQLCBlockView(results);
    for (const block of blocks) {
      if (block.hash != 'bd8ecb1b2be629a72b25d69ee28248ea49e6e0ce9b6ed681c05095b7f6fc683e' &&
          block.hash != 'b056061b7f6de192a0ad573cc4b62197eaad0b2073127bca373e2953837bd9a4' &&
          block.hash != '493c020917e7f7da154cbd24843ca66542dd62e46f9d3f032e986f812c60b5fb') {
        this.latestTransactions.unshift(block); 
      }
    }
    results.sort( (a,b) => {
      return b.timestamp - a.timestamp 
    } );
    if (this.latestTransactions.length > 10) {
      this.latestTransactions = this.latestTransactions.slice(0,10);
    }
    this.latest5Transactions = this.latestTransactions.slice(0,5);
  }

  attemptReconnect() {
    this.connect();
    if (this.reconnectTimeout < 30 * 1000) {
      this.reconnectTimeout += 5 * 1000; // Slowly increase the timeout up to 30 seconds
    }
  }

  forceReconnect() {
    if (this.socket.connected && this.socket.ws) {
      // Override the onclose event so it doesnt try to reconnect the old instance
      this.socket.ws.onclose = event => {
      };
      this.socket.ws.close();
      delete this.socket.ws;
      this.socket.connected = false;
    }

    setTimeout(() => this.connect(), 250);
  }

  async send(method, params): Promise<any> {
    const request = {
      "jsonrpc" : "2.0",
      "method"  : method,
      "id" : uuid(),
      "params" : params 
    }


    if (this.debug) {
      console.log(request);
    }

    if (this.socket.connected) {
      this.socket.ws.send(JSON.stringify(request));
      this.queuedAwaitAnswers.push(request);
    }

	}



}
