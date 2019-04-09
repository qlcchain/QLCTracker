import { Injectable } from '@angular/core';
import Neon from '@cityofzion/neon-js';
import { wallet } from '@cityofzion/neon-js';
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

@Injectable({
  providedIn: 'root'
})
export class NeoWalletService {

  MIN_PASSPHRASE_LEN = 4

  private apiAddress = 'https://api.neoscan.io/api/main_net';
  private network = 'MainNet';
  tokenList = [];

  claimingTimer = null;

  constructor(
    private walletService: WalletService,
    private http: HttpClient,
    private addressBook: AddressBookService,
    private notificationService: NotificationService
  ) {
    const tokenList = require('../../assets/data/neoTokenList.json');
    this.tokenList = tokenList;
    console.log(tokenList);
   }

  getNetwork() {
    return this.network;
  }

  private async request(data): Promise<any> {
		return await this.http
			.get(this.apiAddress + data)
			.toPromise()
			.then(res => {
				return res;
			})
			.catch(err => {
				if (err.status === 500 || err.status === 0) {
					// Hard error
				}
				throw err;
			});
	}

  async checkPrivateKey(wif) {
    return wallet.isWIF(wif);
  }

  async checkAddress(address) {
    return wallet.isAddress(address);
  }

  async decrypt(encryptedKey,password) {
    const wif = await wallet.decrypt(encryptedKey, password);
    return wif;
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
    const apiProvider = await new api.neoscan.instance(this.network);
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
    const apiProvider = await new api.neoscan.instance(this.network);
    const claims = await apiProvider.getMaxClaimAmount(address);
    return new BigNumber(claims).toFixed();
  }

  async getClaims(address) {
    const apiProvider = await new api.neoscan.instance(this.network);
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
      const account = await new wallet.Account(wif);
      console.log("\n\n--- Claiming Address ---");
      console.log(account);
      const apiProvider = await new api.neoscan.instance(this.network);
  
      console.log("\n\n--- API Provider ---");
      console.log(apiProvider);

      const config = {
        api: apiProvider,
        account: account
      };

      const claimed = await Neon.claimGas(config)
      .then(config => {
        console.log("\n\n--- Response ---");
        console.log(config.response);
        this.notificationService.sendSuccess('GAS claimed. It should be visible soon.');
        return true;
      })
      .catch(config => {
        console.log(config);
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
      const send = await this.send(address,address,'NEO',neoBalance);
      this.claimGasTimer(address);
    } else { // check if NEO was already send and there is something to claim
      const claims = await this.getClaims(address);
      if (claims.claims.length > 0) {
        this.claimGasTimer(address);
      }
    }

    return;

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

  async getSendHashScript(token) {
    const hash = this.tokenList[token].networks[1].hash;
    return hash;
  }

  async send(from,receivingAddress,token,amount) {
    console.log(from);
    console.log(receivingAddress);
    console.log(token);
    console.log(amount);

    const selectedWallet = this.walletService.wallet.neowallets.find(a => a.id === from);
    const wif = await this.decrypt(selectedWallet.encryptedwif,this.walletService.wallet.password);
    
    const account = await new wallet.Account(wif);
    console.log("\n\n--- From Address ---");
    console.log(account);

    const apiProvider = await new api.neoscan.instance(this.network);
    console.log("\n\n--- API Provider ---");
    console.log(apiProvider);


    if (token == 'NEO' || token == 'GAS') {
      let intent = null;
      if (token == 'NEO')
        intent = api.makeIntent({ NEO: new BigNumber(amount).toNumber() }, receivingAddress);
      else
        intent = api.makeIntent({ GAS: new BigNumber(amount).toNumber() }, receivingAddress);

      console.log("\n\n--- Intents ---");
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
        console.log(config);
        return config;
      });
      return returnAsset;
    }



    const hash = this.tokenList[token].networks[1].hash;
    const contractScriptHash = this.tokenList[token].networks[1].hash;

    const numOfDecimals = this.tokenList[token].networks[1].decimals;
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
    console.log("\n\n--- Amount:  ---")
    console.log(amtToSend);
    const builder = await generator();
    console.log(builder);
    const script = builder.str;
    console.log("\n\n--- Invocation Script ---");
    console.log(script);
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
      console.log(config);
      return config;
    });
    return returnToken;
  
  }
  
}