import * as CryptoJS from 'crypto-js';
import * as bip39 from 'bip39';
import Chainx, { Account, ApiBase, WsProvider } from 'chainx.js';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WalletService } from './wallet.service';
import { AddressBookService } from './address-book.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChainxAccountService {
  private chainxApi;
  private chainx;
  private apiUrl;

  divisor = 100000000;

  constructor(
    private http: HttpClient,
    private walletService: WalletService,
    private addressBook: AddressBookService
  ) {
    /*this.chainxApi = new ApiBase(new WsProvider(environment.chainxWs[environment.chainxNetworkDefault]));
    this.chainx = new Chainx(environment.chainxWs[environment.chainxNetworkDefault]);
    this.chainx.on('disconnected', () => {}); // websocket disconnected
    this.chainx.on('error', () => {}); // an error occurs
    this.chainx.on('connected', () => {}); // websocket connected
    this.chainx.on('ready', () => {}); // initialization is done

    this.apiUrl = environment.chainxApi[environment.chainxNetworkDefault];*/
  }

  private async signAndSend(extrinsic, accountFrom) {
    const account = this.walletService.wallet.chainxAccounts.find(e => e.id === accountFrom);
    let privateKey = this.decrypt(account.wif);

    if (account.mnemonic) {
      privateKey = (this.account(privateKey)).privateKey();
    }

    return new Promise((resolve, reject) => {
      extrinsic.signAndSend(privateKey, (error, response) => {
        if (error) {
          return reject(error);
        }

        if (response.status === 'Finalized') {
          if (response.result === 'ExtrinsicSuccess') {
            return resolve(response);
          }
          if (response.result === 'ExtrinsicFailed') {
            return reject(response);
          }
        }
      });
    });
  }

  async get(url) {
    return await this.http
      .get(`${this.apiUrl}${url}`)
      .toPromise()
      .then(res => {
        return res;
      })
      .catch(err => {
        if (err.status === 500 || err.status === 0) {
        }
        throw err;
      });
  }

  account(wif) {
    return Account.from(wif);
  }

  async getAssetsByAccount(address, pageIndex = 0, pageSize = 10) {
    await this.chainx.isRpcReady();

    return await this.chainx.asset.getAssetsByAccount(address, pageIndex, pageSize);
  }

  async getCandidates() {
    await this.chainx.isRpcReady();

    return this.chainx.stake.getIntentions();
  }

  async getNominationRecords(address) {
    await this.chainx.isRpcReady();

    return this.chainx.stake.getNominationRecords(address);
  }

  async getStakingDividendByAccount(account) {
    await this.chainxApi.isRpcReady;

    return await this.chainxApi.rpc.chainx.getStakingDividendByAccount(account);
  }

  async getTransfers(blockNumber) {
    await this.chainxApi.isReady;


    // timestamp found: [[entries]]->
    const blockHash = await this.chainxApi.rpc.chain.getBlockHash(blockNumber);
    const block = await this.chainxApi.rpc.chainx.getBlockByNumber(blockNumber);
    // console.log(`Block hash of block number: ${blockNumber}`);
    console.log(block);
    //
    // const extrinsic = block.block.extrinsics;
    // const header = block.block.header;
    // console.log(extrinsic[1]);
    // console.log(header.number);
    try {
      // const blockData = await this.chainxApi.rpc.chain.getBlock(header.number);
      const blockData = await this.chainxApi.rpc.chain.getBlock(blockHash);
      // console.log(blockData.block.extrinsics[0].args[0].raw); // get timestamp
      console.log(blockData.block.extrinsics[0].args[0].raw);
    }
    catch (e) {
      console.log(e.message);
    }

    // const extrinsic = this.chainxApi.rpc.chain.getBlock();
    // const extrinsic = this.chainx.chain.getInfo();

    // const a = await this.chainxApi.rpc.chain.getFinalizedHead();
    // console.log(a);
    // console.log(this.chainxApi.rpc);
    //
    // // console.log(this.chainxApi.rpc);
    // // this.chainxApi.rpc.subscribe.getFinalizedHead(e => console.log(e));
    // const extrinsic = this.chainxApi.rpc.chain.subscribeNewHead;
    //
    // // this.chainxApi.rpc.author.submitAndWatchExtrinsic(extrinsic).then(res => console.log(res)).catch(err => console.log(err));
    // this.chainxApi.rpc.author.submitAndWatchExtrinsic(a, (e, i) => {
    //   console.log(e.Description());
    //   console.log(i);
    // });
    // console.log(blockHash);
    // const block = await this.chainxApi.rpc.chain.getBlock(blockHash);
    // console.log(block);

    // await this.chainxApi.rpc.chain.subscribe;

    // let ws = new WebSocket('wss://w1.chainx.org/ws');
    //
    // var params = {
    //   type: 'subscribe',
    //   channels: [{
    //     method: 'chain_getBlock',
    //     product_ids: []
    //   }]
    // }
    //
    // ws.onmessage = (msg) => {
    //   console.log(msg);
    // }

    // let ws = new WebSocket('wss://w1.chainx.org/ws');
    //
    // ws.onopen = () => {
    //   ws.send(JSON.stringify({
    //     command: 'subscribe',
    //     identifier: {
    //       channel: 'ArticlesChannel'
    //     }}));
    // };
    //
    // ws.onmessage = (msg) => {
    //   console.log('here');
    //   console.log(JSON.parse(msg.data).message);
    // };
    // const blockHash = '0x55ac32e30d94f5dcbe33f5a85d800d779916ac855062bb7912cec5df7ff19add';
    // console.log('here');
    // const extrinic = this.chainx.asset.getWithdrawalListByAccount('0x47a35c82c81b566eae88984fde6c3bd27f3044d4ebe1435994e26bcb880a823a', 0, 10).then(a => console.log(a)).catch(e => console.log);
    // console.log(extrinic);


    // const a = await this.signAndSend(extrinic, '5DgdnWU2rbiphaq2eu5Hvyumu3PvQd6YtKfxPN4vETmRcx8k');
    // console.log(a);
    // const transferCallIndex = Buffer.from(this.chainxApi.tx.xAssets.transfer.callIndex).toString('hex');
    // console.log(transferCallIndex);
    // const estrinsics = block.block.extrinsics;
    // const transfers = [];
    //
    // for (let i = 0; i < estrinsics.length; i++) {
    //   const e = estrinsics[i];
    //   console.log(e);
    //   if (Buffer.from(e.method.callIndex).toString('hex') === transferCallIndex) {
    //     const allEvents = await this.chainxApi.query.system.events.at(blockHash);
    //     const events = allEvents
    //       .filter(({ phase }) => phase.type === 'ApplyExtrinsic' && phase.value.eqn(i))
    //       .map(event => {
    //         const o = event.toJSON();
    //         o.method = event.event.data.method;
    //         return o;
    //       });
    //     const result = events[events.length - 1].method;
    //
    //     transfers.push({
    //       index: i,
    //       blockHash: blockHash.toHex(),
    //       blockNumber: blockNumber,
    //       result,
    //       tx: {
    //         signature: e.signature.toJSON(),
    //         method: e.method.toJSON(),
    //       },
    //       events: events,
    //       txHash: e.hash.toHex(),
    //     });
    //   }
    // }
    //
    // return transfers;
  }

  async claim(data) {
    await this.chainx.isRpcReady();

    const extrinsic = this.chainx.stake.voteClaim(data.target);

    return await this.signAndSend(extrinsic, data.sender);
  }

  async nominate(data) {
    await this.chainx.isRpcReady();

    const extrinsic = this.chainx.stake.nominate(data.target, data.amount, data.memo);

    return await this.signAndSend(extrinsic, data.sender);
  }

  async unnominate(data) {
    await this.chainx.isRpcReady();

    const extrinsic = this.chainx.stake.unnominate(data.target, data.amount, data.memo);

    return await this.signAndSend(extrinsic, data.sender);
  }

  async transfer(data) {
    await this.chainx.isRpcReady();

    const extrinsic = this.chainx.asset.transfer(data.destination, 'PCX', data.amount, data.memo);

    return await this.signAndSend(extrinsic, data.sender);
  }

  async unfreeze(data) {
    await this.chainx.isRpcReady();

    const extrinsic = this.chainx.stake.unfreeze(data.target, data.revocationIndex);

    return await this.signAndSend(extrinsic, data.sender);
  }

  async checkPrivateKey(privateKey) {
    let valid = true;

    if (this.walletService.wallet.chainxAccounts.length === 0) {
      return valid;
    }

    for (const chainxAccount of this.walletService.wallet.chainxAccounts) {
      if (!chainxAccount.mnemonic) {
        if (privateKey === this.decrypt(chainxAccount.wif)) {
          valid = false;

          break;
        }
      }
    }

    return valid;
  }

  async checkMnemonic(mnemonic) {
    let valid = true;

    if (!bip39.validateMnemonic(mnemonic)) {
      return !valid;
    }

    if (this.walletService.wallet.chainxAccounts.length === 0) {
      return valid;
    }

    for (const chainxAccount of this.walletService.wallet.chainxAccounts) {
      if (chainxAccount.mnemonic) {
        if (mnemonic === this.decrypt(chainxAccount.wif)) {
          valid = false;

          break;
        }
      }
    }

    return valid;
  }

  getNetwork() {
    return environment.chainxNetwork[environment.chainxNetworkDefault];
  }

  getExplorer() {
    return environment.chainxExplorer[environment.chainxNetworkDefault];
  }

  getPublicKey(address) {
    return Account.decodeAddress(address);
  }

  getPublicAddress(publicKey) {
    return Account.encodeAddress(publicKey);
  }

  decrypt(data) {
    const decryptedData = CryptoJS.AES.decrypt(data.toString(), this.walletService.wallet.seed);
    return decryptedData.toString(CryptoJS.enc.Utf8);
  }

  encrypt(data) {
    return CryptoJS.AES.encrypt(data, this.walletService.wallet.seed).toString();
  }

  async createAccount(wif = null, name = '') {
    let mnemonic = wif === null;

    if (wif !== null && bip39.validateMnemonic(wif)) {
      mnemonic = true;
    }

    wif = !wif ? Account.newMnemonic() : wif;

    const account = await this.account(wif);

    Account.setNet(environment.chainxNetwork[environment.chainxNetworkDefault].toLowerCase());

    const address = Account.encodeAddress(account.publicKey());
    const chainxAccount = {
      id: address,
      index: this.walletService.wallet.chainxAccounts.length,
      balances: null,
      addressBookName: name,
      wif: this.encrypt(wif),
      mnemonic
    };

    if (name !== '') {
      await this.addressBook.saveAddress(address, name);
    }

    this.walletService.wallet.chainxAccounts.push(chainxAccount);
    this.walletService.saveWalletExport();

    return chainxAccount;
  }
}
