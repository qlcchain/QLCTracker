import { Injectable } from '@angular/core';
import Neon, { settings } from '@cityofzion/neon-js';
import { wallet } from '@cityofzion/neon-js';
import { wallet as walletCore } from '@cityofzion/neon-core';
import {rpc} from '@cityofzion/neon-js'
import { api } from '@cityofzion/neon-js';
import { u } from '@cityofzion/neon-js';
import { nep5 } from '@cityofzion/neon-js';
import { WalletService } from './wallet.service';
import { HttpClient } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { AddressBookService } from './address-book.service';
import { timer } from 'rxjs';
import { NotificationService } from './notification.service';
import { sc, tx } from '@cityofzion/neon-core';

import { environment } from 'src/environments/environment';
import { Provider,  
  filterHttpsOnly,
  findGoodNodesFromHeight,
  getBestUrl,
  PastTransaction,
  RpcNode } from '@cityofzion/neon-api/lib/provider/common';
import axios from "axios";

import {
  NeoscanBalance,
  NeoscanClaim,
  NeoscanPastTx,
  NeoscanTx,
  NeoscanV1GetBalanceResponse,
  NeoscanV1GetClaimableResponse,
  NeoscanV1GetHeightResponse,
  NeoscanV1GetUnclaimedResponse
} from "@cityofzion/neon-api/lib/provider/neoscan/responses";

@Injectable({
  providedIn: 'root'
})
export class NeoWalletService {

  MIN_PASSPHRASE_LEN = 4

  private apiAddress = environment.neoScanApi[environment.neoNetwork];
  private network = environment.neonNetwork[environment.neoNetwork];
  private neoscan = environment.neoScan[environment.neoNetwork];

  private smartContractScript = environment.neoSmartContract[environment.neoNetwork];
  
  tokenList = [];

  claimingTimer = null;

  selectedNode = '';

  constructor(
    private walletService: WalletService,
    private http: HttpClient,
    private addressBook: AddressBookService,
    private notificationService: NotificationService
  ) {
    const tokenList = require('../../assets/data/neoTokenList_'+environment.neoNetwork+'.json');
    this.tokenList = tokenList;
   }

  getNetwork() {
    return this.network;
  }

  getExplorer() {
    return this.neoscan;
  }

  private async request(data): Promise<any> {
    try {
		const returnData = await this.http
			.get(this.apiAddress + data)
			.toPromise()
			.then(res => {
				return res;
			})
			.catch((err) => {
				if (err.status === 500 || err.status === 0) {
					// Hard error
        }
        if (err.status === 404) {
          return err;
        }
				throw err;
      });
      
      return returnData;
    } catch (e) {
      return e;
    }
	}

  async checkPrivateKey(wif) {
    return wallet.isWIF(wif);
  }

  async checkAddress(address) {
    return wallet.isAddress(address);
  }

  async decrypt(encryptedKey,password) {
    try {
      const wif = await wallet.decrypt(encryptedKey, password);
      return wif;
    } catch (error) {
      console.log('Wrong NEO Wallet password.');
      return false;
    }
  }

  async encrypt(privateKey,password) {
    const encryptedWIF = await wallet.encrypt(privateKey, password);
    return encryptedWIF;
  }

  async account(wif) {
    const account = new wallet.Account(wif);
    return account;
  }

  async createWallet(wif,name='') {
    if (wif === 'new')
      wif = wallet.generatePrivateKey();
    const encryptedwif = await this.encrypt(wif,this.walletService.wallet.password);
    const neoAccount = await this.account(wif);
    if (name!='')
      this.addressBook.saveAddress(neoAccount.address, name);
    const neoWallet = {
      id: neoAccount.address,
      index: this.walletService.wallet.neowallets.length,
      balances: [],
      addressBookName: name,
      encryptedwif: encryptedwif
    }
    this.walletService.wallet.neowallets.push(neoWallet);
    this.walletService.saveWalletExport();
    return neoWallet;

  }

  async getBalance(address) {
    //const apiProvider = await new api.neoscan.instance(this.network);
    const apiProvider = new myProvider(this.selectedNode); 
    const balanceResults = await apiProvider.getBalance(address)
    .catch(e => {
      // indicates that neo scan is down and that api.sendAsset and api.doInvoke
      // will fail unless balances are supplied
      console.error(e);
      return e;
    });
    return balanceResults;
  }

  async getClaimAmount(address) {
    //const apiProvider = await new api.neoscan.instance(this.network);
    const apiProvider = new myProvider(this.selectedNode); 
    const claims = await apiProvider.getMaxClaimAmount(address);
    return new BigNumber(claims).toFixed();
  }

  async getClaims(address) {
    const apiProvider = new myProvider(this.selectedNode); 
    //const apiProvider = await new api.neoscan.instance(this.network);
    const claims = await apiProvider.getClaims(address);
    return claims;
  }


  async claimGasTimer(address) {
    if (this.claimingTimer != null) {
      return;
    }
    const source = timer(10000);
		this.claimingTimer = source.subscribe(async val => {
      this.notificationService.sendInfo('Claiming GAS.');
      const selectedWallet = this.walletService.wallet.neowallets.find(a => a.id === address);
      const wif = await this.decrypt(selectedWallet.encryptedwif,this.walletService.wallet.password);
      if (wif === false) {
        return false;
      }
      const account = await new wallet.Account(wif);
      //console.log("\n\n--- Claiming Address ---");
      //console.log(account);
      //const apiProvider = await new api.neoscan.instance(this.network);
      const apiProvider = new myProvider(this.selectedNode); 
  
      //console.log("\n\n--- API Provider ---");
      //console.log(apiProvider);

      const config = {
        api: apiProvider,
        account: account
      };

      const claimed = await Neon.claimGas(config)
      .then(config => {
        //console.log("\n\n--- Response ---");
        //console.log(config.response);
        this.notificationService.sendSuccess('GAS claimed. It should be visible soon.');
        return true;
      })
      .catch(config => {
        //console.log(config);
        return false;
      });
      
      this.claimingTimer = null;

      if (!claimed) {
        this.claimGasTimer(address);
      }
		});
  }

  async claimGas(address) {
    if (this.claimingTimer != null) {
      this.notificationService.sendInfo('Already claiming GAS, please wait.');
      return;
    }
    this.notificationService.sendInfo('Calculating GAS amount, please wait.');
    const maxClaimAmount = await this.getClaimAmount(address);
    if (Number(maxClaimAmount) == 0) {
      this.notificationService.sendError('No GAS to claim.');
      return;
    }

    // get NEO balance
    const balance = await this.getBalance(address);
    let neoBalance = 0;

    if (balance.assets['NEO'] != undefined)
      neoBalance = new BigNumber(balance.assets['NEO'].balance).toNumber();


    if (neoBalance > 0) { // send NEO to yourself, so you can claim GAS
      console.log('Sending ' + neoBalance + ' NEO from ' + address + ' to ' + address);
      const send = await this.send(address,address,this.tokenList['NEO'].networks[1].hash,neoBalance);
      this.claimGasTimer(address);
    } else { // check if NEO was already send and there is something to claim
      const claims = await this.getClaims(address);
      if (claims.claims.length > 0) {
        this.claimGasTimer(address);
      }
    }

    return;

  }

  async getNeoScanBalance(address) {    
    const balance = await this.request('/v1/get_balance/'+address);
    //console.log(balance.balance);
    return balance.balance;
  }

  async getLastTransactions(address) {
    const lastTransactionsResults = await this.request('/v1/get_address_abstracts/'+address+'/0');
    const tokens = Object.keys(this.tokenList);
    if (lastTransactionsResults.entries) {
      lastTransactionsResults.entries.forEach(entry => {
        if (entry.address_from == address) {
          entry.type = 'Send';
          entry.account = entry.address_to;
        } else {
          entry.type = 'Receive';
          entry.account = entry.address_from;
        }
        tokens.forEach(token => {
          const item = this.tokenList[token];
          if (item.networks[1].hash == entry.asset) {
            entry.tokenName = item.symbol;
          }
        });
      });
      return lastTransactionsResults;
    }
    return null;
  }

  async getTransaction(txid) {
    const transactionResult = await this.request('/v1/get_transaction/'+txid);
    return transactionResult;
  }

  async getSendHashScript(token) {
    const hash = this.tokenList[token].networks[1].hash;
    return hash;
  }

  async send(from,receivingAddress,asset_hash,amount) {
    //console.log(from);
    //console.log(receivingAddress);
    //console.log(asset_hash);
    //console.log(amount);

    const selectedWallet = this.walletService.wallet.neowallets.find(a => a.id === from);
    const wif = await this.decrypt(selectedWallet.encryptedwif,this.walletService.wallet.password);
    
    if (wif === false) {
      return false;
    }
    const account = await new wallet.Account(wif);
    //console.log("\n\n--- From Address ---");
    //console.log(account);
    
    //let apiProvider = await new api.neoscan.instance(this.network);
    const apiProvider = new myProvider(this.selectedNode); 
   
    const token = Object.values(this.tokenList).find( a => a.networks[1].hash == asset_hash);
    //console.log(token);
     
    if (token.symbol == 'NEO' || token.symbol == 'GAS') {
      let intent = null;
      if (token.symbol == 'NEO')
        intent = api.makeIntent({ NEO: new BigNumber(amount).toNumber() }, receivingAddress);
      else
        intent = api.makeIntent({ GAS: new BigNumber(amount).toNumber() }, receivingAddress);

      //console.log("\n\n--- Intents ---");
      intent.forEach(i => console.log(i));

      const config = {
        api: apiProvider, // The network to perform the action, MainNet or TestNet.
        account: account, // This is the address which the assets come from.
        intents: intent // This is where you want to send assets to.
      };
      console.log(config);
      const returnAsset = await Neon.sendAsset(config)
      .then(config => {
        console.log("\n\n--- Response ---");
        console.log(config.response);
        return config.response;
      })
      .catch(config => {
        console.log("\n\n--- Response error ---");
        console.log(config);
        return config;
      });
      return returnAsset;
    }

    //const hash = this.tokenList[token].networks[1].hash;
    //const contractScriptHash = this.tokenList[token].networks[1].hash;
    const contractScriptHash = asset_hash;
    let numOfDecimals = 8;
    if (token.networks[1].decimals) {
      numOfDecimals = token.networks[1].decimals;
    }
    //const numOfDecimals = this.tokenList[token].networks[1].decimals;
    const amtToSend = new BigNumber(amount).toFixed();
    const network = this.network;
    const additionalInvocationGas = 0;
    const additionalIntents = [];

    // We have to adjust the amount to send because this function bumps it up by 8 decimals places according to Fixed8 rules. For NEP5 tokens of 8 decimals places, no adjustments is needed.
    const generator = nep5.abi.transfer(
      contractScriptHash,
      account.address,
      receivingAddress,
      new u.Fixed8(amtToSend).div(Math.pow(10, 8 - numOfDecimals))
    );

    //console.log("\n\n--- Amount:  ---")
    //console.log(amtToSend);
    const builder = await generator();
    //console.log(builder);
    const script = builder.str;
    //console.log("\n\n--- Invocation Script ---");
    //console.log(script);
    const gas = additionalInvocationGas;
    const intent = additionalIntents;

    const config = {
      api: apiProvider, // The API Provider that we rely on for balance and rpc information
      account: account, // The sending Account
      intents: intent, // Additional intents to move assets
      script: script, // The Smart Contract invocation script
      gas: gas // Additional GAS for invocation.
    };

    console.log(config);

    const returnToken = await Neon.doInvoke(config)
    .then(config => {
      console.log("\n\n--- Response ---");
      console.log(config.response);
      return config.response;
    })
    .catch(config => {
      console.log("\n\n--- Response error ---");
      console.log(config);
      const errorConfig = {
        error: config
      }
      return errorConfig;
    });
    return returnToken;
  
  }

  async contractGetName(address) {
    //const apiProvider = await new api.neoscan.instance(this.network);
    const apiProvider = new myProvider(this.selectedNode); 
    //apiProvider.set({httpsOnly: true});
    //console.log("\n\n--- API Provider ---");
    //console.log(apiProvider);

    const props = {
      scriptHash: this.smartContractScript, // Scripthash for the contract
      operation: 'name', // name of operation to perform.
      args: [] // any optional arguments to pass in. If null, use empty array.
    }
    
    const script = Neon.create.script(props);
    //console.log("\n\n--- API Provider RPC Endpoint ---");
    //console.log(await apiProvider.getRPCEndpoint());

    await rpc.Query.invokeScript(script)
    .execute(await apiProvider.getRPCEndpoint())
    .then(res => {
      //console.log(res) // You should get a result with state: "HALT, BREAK"
      //console.log(res.result.stack);
      //console.log('string ' + u.hexstring2str(res.result.stack[0].value));
    });

  }

  async contractGetQlcContract(address) {
    //const apiProvider = await new api.neoscan.instance(this.network);
    const apiProvider = new myProvider(this.selectedNode); 
    //console.log("\n\n--- API Provider ---");
    //console.log(apiProvider);

    const props = {
      scriptHash: this.smartContractScript, // Scripthash for the contract
      operation: 'qlcContract', // name of operation to perform.
      args: [] // any optional arguments to pass in. If null, use empty array.
    }
    
    const script = Neon.create.script(props);
    //console.log("\n\n--- API Provider RPC Endpoint ---");
    //console.log(await apiProvider.getRPCEndpoint());

    await rpc.Query.invokeScript(script)
    .execute(await apiProvider.getRPCEndpoint())
    .then(res => {
      //console.log(res) // You should get a result with state: "HALT, BREAK"
      //console.log(res.result.stack);
      //console.log('string ' + u.hexstring2str(res.result.stack[0].value));
    });

  }  

  async contractLock(neoWalletAddress,qlcAmount,qlcWalletAddress,durationInDays) {
    //console.log('contractLock')
    /*console.log(neoWalletAddress)
    console.log(qlcAmount)
    console.log(qlcWalletAddress)
    console.log(durationInDays)*/
    const selectedWallet = this.walletService.wallet.neowallets.find(a => a.id === neoWalletAddress);
    const wif = await this.decrypt(selectedWallet.encryptedwif,this.walletService.wallet.password);

    const amountWithDecimals = new BigNumber(qlcAmount).multipliedBy(100000000);
    
    if (wif === false) {
      return false;
    }
    const account = await new wallet.Account(wif);
    //console.log("\n\n--- From Address ---");
    //console.log(account);

    // multisig
    const multisigAcct = wallet.Account.createMultiSig(2, [
      account.publicKey,
      environment.neoPublicKey[environment.neoNetwork]
    ]);

    //console.log("\n\n--- Multi-sig ---");
    //console.log(`My multi-sig address is ${multisigAcct.address}`);
    //console.log(`My multi-sig scriptHash is ${multisigAcct.scriptHash}`);
    //console.log(`My multi-sig verificationScript is ${multisigAcct.contract.script}`);
    //console.log(multisigAcct);
    //neonJS.settings.httpsOnly = true;
    //const apiProvider = await new api.neoscan.instance(this.network);
    const apiProvider = new myProvider(this.selectedNode); 
    
    //console.log("\n\n--- API Provider ---");
    //console.log(apiProvider);

    const invoke = {
      scriptHash: this.smartContractScript, // Scripthash for the contract
      operation: 'lock', // name of operation to perform.
      args: [
        sc.ContractParam.byteArray(neoWalletAddress,'address'), // neo address
        sc.ContractParam.byteArray(multisigAcct.address,'address'), // multisig neo address
        sc.ContractParam.byteArray(u.str2hexstring(qlcWalletAddress),'string'), // qlc address
        sc.ContractParam.integer(amountWithDecimals.toNumber()), // qlc amount // check integer limit for big numbers !! should be 2,147,483,647 that's max 21 qlc ?
        sc.ContractParam.integer(durationInDays), // lock time
      ] 
    }
    //console.log(invoke);

    
    const script = await Neon.create.script(invoke);
    //console.log(script);

    const invokeConfig = {
      api: apiProvider, // The API Provider that we rely on for balance and rpc information
      account: account, // The sending Account
      script: script // The Smart Contract invocation script
    };

    const returnTokeninvokeConfig = await Neon.doInvoke(invokeConfig)
    .then(config2 => {
      //console.log("\n\n--- Response ---");
      //console.log(config2);
      return config2.response;
    })
    .catch(err => {
      //console.log(err);
      return err;
    });
    const returnData = {
      beneficial: qlcWalletAddress,
      amount: amountWithDecimals.toNumber(),
      multiSigAddress: multisigAcct.address,
      publicKey: account.publicKey,
      lockTxId : returnTokeninvokeConfig.txid
    };
    return returnData;
    
    
  }  

 
 async contractGetLockInfo(txid) {
  //const apiProvider = await new api.neoscan.instance(this.network);
  const apiProvider = new myProvider(this.selectedNode); 
  const props = {
    scriptHash: this.smartContractScript, 
    operation: 'getLockInfo', 
    args: [
      sc.ContractParam.byteArray(txid,'string')
    ] 
  }
  
  const script = Neon.create.script(props);

  let sb = new sc.ScriptBuilder(script);
  //console.log(sb.toScriptParams());

  //await rpc.Query.invokeScript(script)
  let returnData = await rpc.Query.invokeFunction(
    this.smartContractScript,
    'getLockInfo',
    sc.ContractParam.byteArray(u.reverseHex(txid),'string')
    )
  .execute(await apiProvider.getRPCEndpoint())
  .then(res => {
    console.log(res) // You should get a result with state: "HALT, BREAK"
    if (res.result.state == 'HALT, BREAK' || res.result.state == 'HALT') {
      if (res.result.stack[0].value == '') {
        const returnData = {
          beneficial: 0,
          amount: 0,
          multiSigAddress: '',
          neoAddress: '',
          lockStart: '',
          lockEnd: '',
          publicKey: '',
          lockTxId: '',
          lockInfo: 'not_lock'
        };
        return returnData; 
      }
      const c = new wallet.Account(
        u.reverseHex(res.result.stack[0].value[0].value)
      );
      const c2 = new wallet.Account(
        u.reverseHex(res.result.stack[0].value[1].value)
      );

      //console.log('neo address ' + c.address);
      //console.log('neo multi address ' + c2.address);
      //console.log('qlc address ' + u.hexstring2str(res.result.stack[0].value[2].value));
      //console.log('start lock ' + new Date(res.result.stack[0].value[3].value*1000));
      //console.log('end lock ' + new Date(res.result.stack[0].value[4].value*1000));

      let amount;
      if (res.result.stack[0].value[5].type == 'Integer') {
        amount = new BigNumber(res.result.stack[0].value[4].value).dividedBy(100000000).toFixed();  
      } else if (res.result.stack[0].value[5].type == 'ByteArray') {
        amount = u.Fixed8.fromReverseHex(res.result.stack[0].value[5].value);
      }
      const returnData = {
        beneficial: u.hexstring2str(res.result.stack[0].value[2].value),
        amount: new BigNumber(amount).multipliedBy(100000000).toNumber(),
        multiSigAddress: c2.address,
        neoAddress: c.address,
        lockStart: new Date(res.result.stack[0].value[3].value*1000),
        lockEnd: new Date(res.result.stack[0].value[4].value*1000),
        publicKey: '',
        lockTxId: '',
        lockInfo: 'ok_lock'
      };
      return returnData;
    } 
    const returnData = {
      beneficial: 0,
      amount: 0,
      multiSigAddress: '',
      neoAddress: '',
      lockStart: '',
      lockEnd: '',
      publicKey: '',
      lockTxId: '',
      lockInfo: 'not_txid'
    };
    return returnData;
  });

  if(returnData.neoAddress != '')   {
    const selectedWallet = this.walletService.wallet.neowallets.find(a => a.id === returnData.neoAddress);
    if (selectedWallet) {
      const wif = await this.decrypt(selectedWallet.encryptedwif,this.walletService.wallet.password);
      
      if (wif === false) {
        return false;
      }
      const account = await new wallet.Account(wif);
      returnData.publicKey = account.publicKey;
    }
  }
  returnData.lockTxId = txid;
  return returnData;
}  

async contractUnlockPrepare(pledge) {
  // find the right neo wallet from multisig wallet
  const multiSigWallet = pledge.multiSigAddress;

  for (const neowallet of this.walletService.wallet.neowallets) {
    const wif = await this.decrypt(neowallet.encryptedwif,this.walletService.wallet.password);
    if (wif === false) {
      return false;
    }
    const account = await new wallet.Account(wif);

    // multisig
    const multisigAcct = wallet.Account.createMultiSig(2, [
      account.publicKey,
      environment.neoPublicKey[environment.neoNetwork]
    ]);

    if (multisigAcct.address == multiSigWallet) {
      const unlock = await this.contractUnlock(pledge,account);
      return unlock;
    }
  }

  return false;
    
}

async contractUnlock(pledge,account) {

  const multisigAcct = wallet.Account.createMultiSig(2, [
    account.publicKey,
    environment.neoPublicKey[environment.neoNetwork]
  ]);

 

  const props = {
    scriptHash: this.smartContractScript, 
    operation: 'unlock', 
    args: [
      sc.ContractParam.byteArray(u.reverseHex(pledge.nep5TxId),'string')
    ] 
  }
  
  const script = Neon.create.script(props);

  //let constructTx = await Neon.create.contractTx().addAttribute(32,script);

  let constructTx = Neon.create.invocationTx();
  constructTx.addAttribute(32,u.reverseHex(multisigAcct.scriptHash));
  constructTx.script = script;
  
  const txHex = await constructTx.serialize(false);

  const sig1 = await wallet.sign(txHex, account.privateKey);

  //console.log(constructTx);
  //console.log('unsignedRawTx');
  //console.log(txHex);
  //console.log('signature');
  //console.log(sig1);
  //console.log('txId ??');
  //console.log(constructTx.hash);

  return {
    'unsignedRawTx': txHex,
    'signature': sig1,
    'publicKey': account.publicKey,
    'unlockTxId': constructTx.hash
  }
 
}  



  
}

export class myProvider implements Provider {
  name: string;
  http: HttpClient;
  selectedNode: string = '';

  constructor(selectedNode:string = '') {
    this.selectedNode = selectedNode;
  }

  async getRPCEndpoint(noCache?: boolean): Promise<string> {
    //const seed:string = await apiProvider.getRPCEndpoint();
    //return seed ;
    if (this.selectedNode == '') {
      const url = environment.neoScanApi[environment.neoNetwork];
      const response = await axios.get(url + "/v1/get_all_nodes");
      let nodes = response.data as RpcNode[];
      nodes = filterHttpsOnly(nodes);
      
      const goodNodes = findGoodNodesFromHeight(nodes);
      const bestRPC = await getBestUrl(goodNodes);
      return bestRPC;
    } else {
      return this.selectedNode;
    }
  }
  async getGoodNodes(noCache?: boolean): Promise<any> {
    const url = environment.neoScanApi[environment.neoNetwork];
    const response = await axios.get(url + "/v1/get_all_nodes");
    let nodes = response.data as RpcNode[];
    nodes = filterHttpsOnly(nodes);
    const goodNodes = findGoodNodesFromHeight(nodes);
    return goodNodes;
  }
  async getBalance(address: string): Promise<import("@cityofzion/neon-core/lib/wallet").Balance> {
    const url = environment.neoScanApi[environment.neoNetwork];
    const response = await axios.get(url + "/v1/get_balance/" + address);

    const data = response.data as NeoscanV1GetBalanceResponse;
    if (data.address === "not found" && data.balance === null) {
      return new wallet.Balance({ net: url, address });
    }
    const bal = new wallet.Balance({
      net: url,
      address: data.address
    });
    const neoscanBalances = data.balance as NeoscanBalance[];
    for (const b of neoscanBalances) {
      if (b.amount > 0 && b.unspent.length > 0) {
        bal.addAsset(b.asset, {
          unspent: parseUnspent(b.unspent)
        } as Partial<walletCore.AssetBalanceLike>);
      } else {
        bal.addToken(b.asset, b.amount);
      }
    }
    console.log(`Retrieved Balance for ${address} from neoscan ${url}`);
    return bal;
  }
  async getClaims(address: string): Promise<import("@cityofzion/neon-core/lib/wallet").Claims> {
    const url = environment.neoScanApi[environment.neoNetwork];
    const response = await axios.get(url + "/v1/get_claimable/" + address);
    const data = response.data as NeoscanV1GetClaimableResponse;
    if (data.address === "not found" && data.claimable === null) {
      return new wallet.Claims({ address: data.address });
    }
    const claims = parseClaims(data.claimable as NeoscanClaim[]);
    console.log(`Retrieved Claims for ${address} from neoscan ${url}`);
    return new wallet.Claims({
      net: url,
      address: data.address,
      claims
    });
  }
  async getMaxClaimAmount(address: string): Promise<import("@cityofzion/neon-core/lib/u").Fixed8> {
    const url = environment.neoScanApi[environment.neoNetwork];
    const response = await axios.get(url + "/v1/get_unclaimed/" + address);
    const data = response.data as NeoscanV1GetUnclaimedResponse;
    console.info(
      `Retrieved maximum amount of gas claimable after spending all NEO for ${address} from neoscan ${url}`
    );
    return new u.Fixed8(data.unclaimed || 0);
  }
  getHeight(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getTransactionHistory(address: string): Promise<import("@cityofzion/neon-api/lib/provider/common").PastTransaction[]> {
    throw new Error("Method not implemented.");
  }


}

function parseUnspent(unspentArr: NeoscanTx[]): walletCore.CoinLike[] {
  return unspentArr.map(coin => {
    return {
      index: coin.n,
      txid: coin.txid,
      value: coin.value
    };
  });
}

function parseClaims(claimArr: NeoscanClaim[]): walletCore.ClaimItemLike[] {
  return claimArr.map(c => {
    return {
      start: c.start_height,
      end: c.end_height,
      index: c.n,
      claim: c.unclaimed,
      txid: c.txid,
      value: c.value
    };
  });
}
