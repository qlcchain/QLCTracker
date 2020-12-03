import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { environment } from 'src/environments/environment';
// import { testContract } from 'src/constants/abi/testContract';
import { neo5toerc20swap } from 'src/constants/abi/neo5toerc20swap';
import axios from 'axios';
@Injectable({
  providedIn: 'root'
})
export class EtherWalletService {
web3: any;
accounts: any;
address: any = environment.etherswapSmartContract[environment.neoNetwork];
private url: string = environment.neo5toerc20swapwrapperurl[environment.neoNetwork];
private neo5toerc20swapjwtauth = environment.neo5toerc20swapjwtauth[environment.neoNetwork];
abi = neo5toerc20swap;
  constructor() {
    if ((window as any).ethereum ||
    ((window as any).web3 && (window as any).web3.currentProvider)) {
      (window as any).ethereum.enable();
      this.web3 = new Web3((window as any).web3.currentProvider);
    } else {
      console.log('Please connect the metamask first!');
    }
  }
  // get erc20 account address
  async getAccounts() {
    // tslint:disable-next-line: new-parens
    const account: any[] = await new this.web3.eth.getAccounts;
    return account;
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
    // info/swapInfoByTxHash
    async swapInfoByTxHash(txid: any) {
      const data = await axios.get(this.url + '/info/swapInfoByTxHash', {
      params: {
          hash: txid
      },
      headers: {
        authorization: this.neo5toerc20swapjwtauth.authorization
    }
      });
      return data;
    }

    // https://raw.githubusercontent.com/info/swapInfoList
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

    // https://raw.githubusercontent.com/info/swapInfosByAddress
    async swapInfosByAddress(address: any, page: any, pagesize: any) {
      const data = await axios.get(this.url + '/info/swapInfosByAddress', {
      params: {
          address,
          page,
          pagesize
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

  // mint erc20 token
  async getEthMint(amount: any, nep5Hash: any, signature: any, account: any) {
    const Contract = await new this.web3.eth.Contract(this.abi, this.address);
    console.log('getEthMint.amount', amount);
    console.log('getEthMint.nep5Hash', nep5Hash);
    console.log('getEthMint.signature', signature);
    console.log('getEthMint.account', account);
    Contract.methods.mint(amount, nep5Hash, signature).send({
        from: account
    }).then(result => {
      console.log('result', result);
    });
 }
}
