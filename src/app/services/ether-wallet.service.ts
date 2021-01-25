import { Injectable } from '@angular/core';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { environment } from 'src/environments/environment';
// import { testContract } from 'src/constants/abi/testContract';
import { neo5toerc20swap } from 'src/constants/abi/neo5toerc20swap';
import axios from 'axios';
import WalletConnectProvider from "@walletconnect/web3-provider";

@Injectable({
  providedIn: 'root'
})
export class EtherWalletService {
swapHistory: any[];
web3: any;
accounts: any;
metamask: boolean;
address: any = environment.etherswapSmartContract[environment.neoNetwork];
private url: string = environment.neo5toerc20swapwrapperurl[environment.neoNetwork];
private neo5toerc20swapjwtauth = environment.neo5toerc20swapjwtauth[environment.neoNetwork];
abi = neo5toerc20swap;
selectedAddress: string = '';
balances = {
  ETH: 0,
  QLC: 0
};
transactions: any[];
erc20Transactions: any[];
internalTransactions: any[];

provider: any;

  constructor() {
    this.connect();
  }
  async connect() {
    if ((window as any).ethereum) {
      this.web3 = new Web3((window as any).ethereum);
      this.provider = await (window as any).ethereum;
      console.log(this.provider)
      //await (window as any).ethereum.enable();
      const accounts = await this.provider.request({ method: 'eth_requestAccounts'});
      console.log(accounts)
      const ethAddress = accounts[0];
      //this.provider.on('update', (data) => {
        //const ethAddress = (window as any).ethereum.currentProvider.selectedAddress;
        if (ethAddress) {
          this.metamask = true;
        } else {
          this.metamask = false;
        }
        if (this.selectedAddress !== ethAddress) {
          this.accounts = [ ethAddress ];
          this.selectedAddress = ethAddress;
          this.getBalances(ethAddress);
          this.getAllTransactions(ethAddress);
          this.getswapHistory(ethAddress);
          this.getAccounts();
        }
      //});
      //this.provider.on('connect', (connectInfo) => { console.log (connectInfo)})
      //this.provider.on('disconnect', (disconnect) => { console.log (disconnect)})
      //this.provider.on('chainChanged', (chainChanged) => { console.log (chainChanged)})
      this.provider.on('accountsChanged', (accounts) => { 
        //console.log ('accountsChanged', accounts)
        const ethAddress = accounts[0];
        if (this.selectedAddress !== ethAddress) {
          this.accounts = [ ethAddress ];
          this.selectedAddress = ethAddress;
          this.getBalances(ethAddress);
          this.getAllTransactions(ethAddress);
          this.getswapHistory(ethAddress);
          this.getAccounts();
        }
      })
      //this.provider.on('message', (message) => { console.log ('message', message)})
    } else {
      this.provider = new WalletConnectProvider({
        infuraId: environment.infuraId,
      });
      const getProvider = await this.provider.enable();
      if (this.provider) {
        // (window as any).ethereum.enable();
        this.web3 = new Web3(this.provider);
        const ethAddress = getProvider[0];
        if (ethAddress) {
          this.metamask = true;
        } else {
          this.metamask = false;
        }
        if (this.selectedAddress !== ethAddress) {
          this.accounts = [ ethAddress ];
          this.selectedAddress = ethAddress;
          this.getBalances(ethAddress);
          this.getAllTransactions(ethAddress);
          this.getswapHistory(ethAddress);
          this.getAccounts();
        }
        this.provider.on("accountsChanged", (accounts: string[]) => {
          console.log ('accountsChanged', accounts)
          const ethAddress = accounts[0];
          if (this.selectedAddress !== ethAddress) {
            this.accounts = [ ethAddress ];
            this.selectedAddress = ethAddress;
            this.getBalances(ethAddress);
            this.getAllTransactions(ethAddress);
            this.getswapHistory(ethAddress);
            this.getAccounts();
          }
        });
        /*
        // Subscribe to chainId change
        this.provider.on("chainChanged", (chainId: number) => {
          console.log(chainId);
        });
        
        // Subscribe to session disconnection
        this.provider.on("disconnect", (code: number, reason: string) => {
          console.log(code, reason);
        });
        
        // Subscribe to session connection
        this.provider.on("connect", (info: { chainId: number }) => {
          console.log(info);
        });
        */
      } else {
        console.log('Please connect first!');
        this.metamask = false;
      }
    }

    

    /*
    this.provider.on('update', (data) => {
      console.log('update')
    });
    */
  }

  async disconnectWallet() {
    if (typeof this.provider.disconnect == 'function') {
      this.provider.disconnect();
    };
    if (typeof this.provider.close == 'function') {
      this.provider.close();
    };
    this.metamask = false;
    this.selectedAddress = '';
    this.swapHistory = [];
  }

  async getswapHistory(address: any) {
    const swaptransactions: any = await this.swapInfosByAddress(
      address,
      1,
      20
    );
    this.swapHistory = swaptransactions.data.infos;
  }
  async getBalances(address) {
    if (address && address != '') {
      // const qlcBalance = await this.getTokenBalance(address, this.address);
      console.log('getBalances.address', address);
      const qlcBalance: any = await this.getEthQLCBalance(address);
      console.log('getBalances.qlcbalance', localStorage.getItem('qlcbalance'));
      const qlcBalanceNumber: any = localStorage.getItem('qlcbalance');
      this.balances.QLC = qlcBalanceNumber;
      // const ethBalance = await this.getEthBalanceApi(address);
      const ethBalance = await this.getEthBalance(address);
      const ethBalanceNumber = new BigNumber(ethBalance).dividedBy(Math.pow(10, 18)).toNumber();
      // const ethBalanceNumber = new BigNumber(ethBalance?.data?.result)
      // .dividedBy(Math.pow(10, 18))
      // .toNumber();
      console.log('getBalances.ethBalance', ethBalance);
      console.log('getBalances.ethBalanceNumber', ethBalanceNumber);
      this.balances.ETH = ethBalanceNumber;
      console.log('this.balances', this.balances);
    } else {
      this.balances = {
        QLC: 0,
        ETH: 0
      };
    }
  }

  async getAllTransactions(address) {
    this.transactions = [];
    this.erc20Transactions = [];
    this.internalTransactions = [];

    if (address && address != '') {
      const transactions:any = await this.getTransactions(address, 10);
      if (transactions.data.result) {
        this.transactions = transactions.data.result;
      }
      const erc20Transactions = await this.getERC20Transactions(address, 10);
      if (erc20Transactions.data.result) {
        this.erc20Transactions = erc20Transactions.data.result;
      }
      const internalTransactions = await this.getInternalTransactions(address, 10);
      if (internalTransactions.data.result) {
        this.internalTransactions = internalTransactions.data.result;
      }
    }
  }
  async getEthBalanceApi(address: string) {
    const balance = await axios
      .get(`${environment.ethEtherscanApi[environment.ethNetworkDefault]}/api?module=account&action=balance&address=${address}&tag=latest&apikey=${environment.ethEtherscanApiKey}`);
    return balance;
  }
  async getTokenBalance(address: string, contractaddress: string) {
    const balance = await axios
      .get(`${environment.ethEtherscanApi[environment.ethNetworkDefault]}/api?module=account&action=tokenbalance&address=${address}&contractaddress=${contractaddress}&tag=latest&apikey=${environment.ethEtherscanApiKey}`)
    return balance;
  }
  // getTransactionStatusByEthTxhash
  async getTransactionsStatusByEthTxhash(ethTxhash: string) {
    const transaction = await axios.get(`${environment.ethEtherscanApi[environment.ethNetworkDefault]}/api?module=transaction&action=gettxreceiptstatus&txhash=${ethTxhash}&apikey=${environment.ethEtherscanApiKey}`);
    return transaction;
  }
  async getTransactions(address: string, numOfTransactions: number = null) {
    const size = numOfTransactions ? `&page=1&offset=${numOfTransactions}` : '';
    const transactions = await axios
      .get(`${environment.ethEtherscanApi[environment.ethNetworkDefault]}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${environment.ethEtherscanApiKey}${size}`);
    return transactions;
  }

  async getERC20Transactions(address: string, numOfTransactions: number = null) {
    const size = numOfTransactions ? `&page=1&offset=${numOfTransactions}` : '';
    const transactions = await axios.get(`${environment.ethEtherscanApi[environment.ethNetworkDefault]}/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${environment.ethEtherscanApiKey}${size}`);
    return transactions;
  }

  async getInternalTransactions(address: string, numOfTransactions: number = null) {
    const size = numOfTransactions ? `&page=1&offset=${numOfTransactions}` : '';
    const transactions = await axios
    .get(`${environment.ethEtherscanApi[environment.ethNetworkDefault]}/api?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${environment.ethEtherscanApiKey}${size}`);
    return transactions;
  }

  getDefaultNetwork() {
    return environment.ethNetworkDefault;
  }

  getExplorer() {
    return environment.ethExplorer[environment.ethNetworkDefault];
  }

  async connectWallet() {
    try {
      const test = await (window as any).ethereum.enable();
    } catch (error) {
      console.log(error);
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
     }).catch(err => {
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
        // depositethTransactionConfirmed
        async depositethTransactionConfirmed(txid: any) {
          const data = await axios.post(this.url + '/deposit/ethTransactionConfirmed', {
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
        // deposit/ethTransactionSent
        async depositethTransactionSent(ethTxHash: any, neoTxHash: any) {
          const data = await axios.post(this.url + '/deposit/ethTransactionSent', {
            ethTxHash,
            neoTxHash
          },
          {
            headers: {
              authorization: this.neo5toerc20swapjwtauth.authorization
          }
            }
          );
          return data;
        }
        // deposit/ethTransactionID
        async ethTransactionID(txid: any) {
          try {
          const data = await axios.get(this.url + '/deposit/ethTransactionID', {
          params: {
              hash: txid
          },
          headers: {
            authorization: this.neo5toerc20swapjwtauth.authorization
        }
          });
          return data;
        } catch (error) {
            return 500;
          }
        }
        // deposit end

        // withdraw start method:post
        // withdrawethTransactionConfirmed
        async withdrawethTransactionConfirmed(txid: any) {
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
        // withdraw/ethTransactionSent
        async withdrawethTransactionSent(txid: any) {
          const data = await axios.post(this.url + '/withdraw/ethTransactionSent', {
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
        return 500;
      }
    }

    // info/swapInfoList
    async swapInfoList(page: any, pageSize: any) {
      const data = await axios.get(this.url + '/info/swapInfoList', {
      params: {
          page,
          pageSize
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

    checkIfWallet() {
      if ((window as any).ethereum) {
        return true;
      } else {
        return false;
      }
    }
  // get erc20 contract balance
  async getEthQLCBalance(account: any) {
    if (!this.checkIfWallet()) {
      return;
    }
    const Contract = await new this.web3.eth.Contract(this.abi, this.address);

    const balance = await Contract.methods.balanceOf(account).call().then(sum => {
      const balance = new BigNumber(sum)
      .dividedBy(Math.pow(10, 8))
      .toNumber();
      console.log('ether-wallet.service.getEthQLCBalance', balance);
      localStorage.setItem('qlcbalance', balance.toString());
      return balance;
    })
    .catch( (error) => {
      console.log(error);
    });
  }
  // mint erc20 token
  async getEthMint(amount: any, nep5Hash: any, signature: any, account: any, gasPrice?: any) {
    const Contract = await new this.web3.eth.Contract(this.abi, this.address);
    console.log('ether-wallet.service.getEthMint.amount', amount);
    console.log('ether-wallet.service.getEthMint.nep5Hash', nep5Hash);
    console.log('ether-wallet.service.getEthMint.signature', signature);
    console.log('ether-wallet.service.getEthMint.account', account);
    return await Contract.methods.mint(amount, nep5Hash, signature).send({
        from: account,
        gasPrice
    }).then(result => {
      localStorage.setItem('EthMinttxHash', result.transactionHash);
      // send ethTxHash,neoTxHash to hub
      this.depositethTransactionSent(result.transactionHash, nep5Hash);
      console.log('getEthMint', result);
      return result;
    })
    .catch( (error) => {
      console.log(error);
    });
 }

 async estimateGasEthMint(amount: any, nep5Hash: any, signature: any, account: any, gasPrice?: any) {
  const Contract = await new this.web3.eth.Contract(this.abi, this.address);
  console.log('getEthMint.amount', amount);
  console.log('getEthMint.nep5Hash', nep5Hash);
  console.log('getEthMint.signature', signature);
  console.log('getEthMint.account', account);

  return await Contract.methods.mint(amount, nep5Hash, signature).estimateGas({
      from: account,
      gasPrice
  })
  .then( (gasAmount) => {
    return gasAmount;
  })
  .catch( (error) => {
    console.log(error);
  });
 }

 // burn erc20 token
  async getEthBurn(nep5Address: any, amount: any, account: any, gasPrice?: any): Promise<any> {
    const Contract = await new this.web3.eth.Contract(this.abi, this.address);
    console.log('getEthBurn.amount', amount);
    console.log('getEthBurn.nep5Hash', nep5Address);
    console.log('account', account);
    return await Contract.methods.burn(nep5Address, amount).send({
        from: account,
        gasPrice
    }).then(result => {
      localStorage.setItem('txHash', result.transactionHash);
      // send ethTxHash to hub
      this.withdrawethTransactionSent(result.transactionHash);
      console.log('getEthBurn.result', result);
      return result;
    });
  }

  async estimateGasEthBurn(nep5Address: any, amount: any, account: any, gasPrice?: any): Promise<any> {
    const Contract = await new this.web3.eth.Contract(this.abi, this.address);
    console.log('getEthBurn.amount', amount);
    console.log('getEthBurn.nep5Hash', nep5Address);
    console.log('account', account);
    return await Contract.methods.burn(nep5Address, amount).estimateGas({
        from: account,
        gasPrice
    })
    .then( (gasAmount) => {
      return gasAmount;
    })
    .catch( (error) => {
      console.log(error);
    });
  }
}
