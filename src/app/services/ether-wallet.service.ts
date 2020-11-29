import { Injectable } from '@angular/core';
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
@Injectable({
  providedIn: 'root'
})
export class EtherWalletService {
web3:any;
address ='0x40E3dCC2EC0B8f7381332614630Aa9EF19b18cA2'
abi = [
{
"inputs": [
  {
    "internalType": "uint256",
    "name": "a",
    "type": "uint256"
  },
  {
    "internalType": "uint256",
    "name": "b",
    "type": "uint256"
  }
],
"name": "addFunc",
"outputs": [
  {
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }
],
"stateMutability": "pure",
"type": "function"
}
];  // 读取编译合约的abi文件。

  accounts:any[]=[];
  constructor() { 
      (window as any).ethereum.enable();
      this.web3 =new Web3((window as any).web3.currentProvider)
      console.log("Web3.version",Web3.version);
      console.log("this.web3.version",this.web3.version);
  }
  async initEther(){
    const Contract = await new this.web3.eth.Contract(this.abi,this.address);
    this.web3.eth.getAccounts().then(result=>console.log("promise Accounts:",result));
    const Accounts= await new this.web3.eth.getAccounts;
    console.log("Accounts",Accounts)
   // creation of contract object
 
 // initiate contract for an address
   // var result = Contract.addFunc([110,20]);
     const balance =await this.web3.eth.getBalance('0x38d3B5fE5AeC14176aA45767bD1f524eD93D98e4');
     console.log("balance",balance);
   // Contract.addFunc(110,20, function(err, result){ console.log(result) });
   Contract.methods.addFunc(110,20).call().then(result => {
   	const dataresult = result;
   	console.log('result',dataresult)
   })
 	Contract.methods.addFunc(110,20).send({
     from: '0x38d3B5fE5AeC14176aA45767bD1f524eD93D98e4'
 }).then(result => {
 		console.log('result',result)
 	})
 }
}
