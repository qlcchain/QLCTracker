import { Injectable } from '@angular/core';
import Web3 from 'web3'
import { environment } from 'src/environments/environment';
import { testContract } from 'src/constants/abi/testContract';
@Injectable({
  providedIn: 'root'
})
export class EtherWalletService {
web3:any;
accounts:any;
address = environment.testSmartContract;
abi = testContract;
  constructor() { 
    if((window as any).ethereum ||
    ((window as any).web3 && (window as any).web3.currentProvider)){
      (window as any).ethereum.enable();
      this.web3 =new Web3((window as any).web3.currentProvider);
    }else{
      console.log("Please connect the metamask first!")
    }
      
  }
  async getAccounts(){
    const account:any[] = await new this.web3.eth.getAccounts;
    return account;
  }
  async getBalance(){
    const Contract = await new this.web3.eth.Contract(this.abi,this.address);
    // this.web3.eth.getAccounts().then(result=>console.log("promise Accounts:",result));
    // const Accounts= ;
    this.accounts = await new this.web3.eth.getAccounts;
    console.log('this.accounts',this.accounts)
   // creation of contract object
     const balance =await this.web3.eth.getBalance(this.accounts[0]);
     console.log("balance",balance);
   // Contract.addFunc(110,20, function(err, result){ console.log(result) });
   Contract.methods.addFunc(110,20).call().then(result => {
   	const dataresult = result;
   	console.log('result',dataresult)
   })
//  	Contract.methods.addFunc(110,20).send({
//      from: '0x38d3B5fE5AeC14176aA45767bD1f524eD93D98e4'
//  }).then(result => {
//  		console.log('result',result)
//  	})
 }
}
