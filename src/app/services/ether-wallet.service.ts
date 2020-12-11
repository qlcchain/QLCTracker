import { Injectable } from '@angular/core';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { environment } from 'src/environments/environment';
// import { testContract } from 'src/constants/abi/testContract';
import { neo5toerc20swap } from 'src/constants/abi/neo5toerc20swap';
import axios from 'axios';
import { AnyARecord } from 'dns';
@Injectable({
  providedIn: 'root'
})
export class EtherWalletService {
web3: any;
accounts: any;
metamask: boolean;
address: any = environment.etherswapSmartContract[environment.neoNetwork];
private url: string = environment.neo5toerc20swapwrapperurl[environment.neoNetwork];
private neo5toerc20swapjwtauth = environment.neo5toerc20swapjwtauth[environment.neoNetwork];
abi = neo5toerc20swap;
  constructor() {
    if ((window as any).ethereum ||
    ((window as any).web3 && (window as any).web3.currentProvider)) {
      (window as any).ethereum.enable();
      this.web3 = new Web3((window as any).web3.currentProvider);
      this.metamask = true;
    } else {
      console.log('Please connect the metamask first!');
      this.metamask = false;
    }
  }
  // get erc20 account address
  async getAccounts() {
    // tslint:disable-next-line: new-parens
    return await new this.web3.eth.getAccounts().then(account => {
      console.log('ether-wallet.service.getAccounts.account', account);
      if (account) {
        localStorage.setItem('etheraccount', account[0]);
        return account;
      }
     }).catch(err =>{
       return err;
     });
  }
    // get erc20 account address
    async getEthAccounts() {
      // tslint:disable-next-line: new-parens
      return await new this.web3.eth.getAccounts().then(account => {
        console.log('ether-wallet.service.getEthAccounts.account', account);
        return account;
      });
    }
    // get erc20 account address
    async getEthBalance(address: any) {
      // tslint:disable-next-line: new-parens
      return await new this.web3.eth.getBalance(address).then(balance =>{
        console.log('ether-wallet.service.getEthBalance.balance', balance);
        return balance;
      });
    }
    // get erc20 three gasPrice
    async getThreeGasPrice() {
      // tslint:disable-next-line: new-parens
      // tslint:disable-next-line: max-line-length
      const getThreeGasPriceUrl = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=DJV72718MY7XV8EMXTUY6DM1KCV2C6X14T';
      return axios.get(getThreeGasPriceUrl).then(data => {
        console.log('ether-wallet.service.getThreeGasPrice.data', data);
        return data;
      }).catch(err => {
        return err;
      });
    }
  // depost start method:post
  // deposit/neoTransactionConfirmed
  async neoTransactionConfirmed(txid: any) {
    const data = await axios.post(this.url + '/deposit/neoTransactionConfirmed',
    {
      hash: txid},
  {
    headers: {
      authorization: this.neo5toerc20swapjwtauth.authorization
  }
    });
    return data;
  }
    // deposit/getEthOwnerSign
    async getEthOwnerSign(txid: any) {
      const data = await axios.post(this.url + '/deposit/getEthOwnerSign',  {
          hash: txid
      },
      {
        headers: {
          authorization: this.neo5toerc20swapjwtauth.authorization
      }
        }
      );
      return data;
    }
        // deposit/packNeoTransaction
        async packNeoTransaction(amount: any, nep5SenderAddr: any, erc20ReceiverAddr: any) {
          const data = await axios.post(this.url + '/deposit/packNeoTransaction', {
            amount,
            nep5SenderAddr,
            erc20ReceiverAddr
            },
            {
              headers: {
                authorization: this.neo5toerc20swapjwtauth.authorization
            }
              }
          );
          return data;
        }
        // deposit/sendNeoTransaction
        async sendNeoTransaction(signature: string, txHash: string, publicKey: string, nep5SenderAddr: string) {
          const data = await axios.post(this.url + '/deposit/sendNeoTransaction', {
            signature,
            txHash,
            publicKey,
            nep5SenderAddr
            },
            {
              headers: {
                authorization: this.neo5toerc20swapjwtauth.authorization
            }
              }
          );
          return data;
        }
        // deposit end

        // withdraw start method:post
        // withdraw/ethTransactionConfirmed
        async ethTransactionConfirmed(txid: any) {
          const data = await axios.post(this.url + '/withdraw/ethTransactionConfirmed', {
              hash: txid
          },
          {
            headers: {
              authorization: this.neo5toerc20swapjwtauth.authorization
          }
            }
          );
          return data;
        }
        // withdraw end

    // info start method:get
    // info/checkNeoTransaction
    async checkNeoTransaction(txid: any) {
      const data = await axios.get(this.url + '/info/checkNeoTransaction', {
      params: {
          hash: txid
      },
      headers: {
        authorization: this.neo5toerc20swapjwtauth.authorization
    }
      });
      return data;
    }
    // info/checkEthTransaction
    async checkEthTransaction(txid: any) {
      const data = await axios.get(this.url + '/info/checkEthTransaction', {
      params: {
          hash: txid
      },
      headers: {
        authorization: this.neo5toerc20swapjwtauth.authorization
    }
      });
      return data;
    }
    // info/swapInfoByTxHash
    async swapInfoByTxHash(txid: any) {
      try {
        const data: any = await axios.get(this.url + '/info/swapInfoByTxHash', {
          params: {
              hash: txid
          },
          headers: {
            authorization: this.neo5toerc20swapjwtauth.authorization
        }
          });
        return data;
      } catch (error) {
        return error;
      }
    }

    // info/swapInfoList
    async swapInfoList(page: any, pagesize: any) {
      const data = await axios.get(this.url + '/info/swapInfoList', {
      params: {
          page,
          pagesize
      },
      headers: {
        authorization: this.neo5toerc20swapjwtauth.authorization
    }
      });
      return data;
    }

    // info/swapInfosByAddress
    async swapInfosByAddress(address: any, page: any, pageSize: any) {
      const data = await axios.get(this.url + '/info/swapInfosByAddress', {
      params: {
          address,
          page,
          pageSize
      },
      headers: {
        authorization: this.neo5toerc20swapjwtauth.authorization
    }
      });
      return data;
    }

    // info/swapInfosByState
    async swapInfosByState(state: any, page: any, pagesize: any) {
      const data = await axios.get(this.url + '/info/swapInfosByState', {
      params: {
          state,
          page,
          pagesize
      },
      headers: {
        authorization: this.neo5toerc20swapjwtauth.authorization
    }
      });
      return data;
    }

  // get erc20 contract balance
  async getEthQLCBalance(account: any) {
    const Contract = await new this.web3.eth.Contract(this.abi, this.address);
    // console.log('getEthQLCBalance.account', account);
    Contract.methods.balanceOf(account).call().then(sum => {
      const balance = new BigNumber(sum)
      .dividedBy(Math.pow(10, 8))
      .toNumber();
      console.log('ether-wallet.service.getEthQLCBalance', balance);
      localStorage.setItem('qlcbalance', balance.toString());
      return balance;
  });
 }
  // mint erc20 token
  async getEthMint(amount: any, nep5Hash: any, signature: any, account: any, gasPrice?: any) {
    const Contract = await new this.web3.eth.Contract(this.abi, this.address);
    console.log('ether-wallet.service.getEthMint.amount', amount);
    console.log('ether-wallet.service.getEthMint.nep5Hash', nep5Hash);
    console.log('ether-wallet.service.getEthMint.signature', signature);
    console.log('ether-wallet.service.getEthMint.account', account);
    return await Contract.methods.mint(amount, '0x' + nep5Hash, '0x' + signature).send({
        from: account,
        gasPrice
    }).then(result => {
      console.log('result', result);
      return result;
    });
 }
 // burn erc20 token
 async getEthBurn(nep5Address: any, amount: any, account: any, gasPrice?: any): Promise<any> {
  const Contract = await new this.web3.eth.Contract(this.abi, this.address);
  console.log('ether-wallet.service.getEthBurn.amount', amount);
  console.log('ether-wallet.service.getEthBurn.nep5Hash', nep5Address);
  console.log('ether-wallet.service.account', account);
  return await Contract.methods.burn(nep5Address, amount).send({
      from: account,
      gasPrice
  }).then(result => {
    localStorage.setItem('txHash', result.transactionHash);
    console.log('getEthBurn.result', result);
    return result;
  });
}
}
