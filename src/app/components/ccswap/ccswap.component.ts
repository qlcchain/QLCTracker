import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WalletService } from 'src/app/services/wallet.service';
import { AddressBookService } from 'src/app/services/address-book.service';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import BigNumber from 'bignumber.js';
import { ApiNEP5Service } from 'src/app/services/api-nep5.service';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { WorkPoolService } from 'src/app/services/work-pool.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { timer } from 'rxjs';
import { ApiConfidantService } from 'src/app/services/api-confidant.service';

import { minAmountValidator } from '../../directives/amount-validator.directive';

import { environment } from 'src/environments/environment';
import { EtherWalletService } from 'src/app/services/ether-wallet.service';
import { AnyARecord } from 'dns';

const nacl = window['nacl'];

@Component({
  selector: 'app-ccswap',
  templateUrl: './ccswap.component.html',
  styleUrls: ['./ccswap.component.scss']
})
export class CcswapComponent implements OnInit {

  step = 1;
  recover = 0;
  zeroHash = '0000000000000000000000000000000000000000000000000000000000000000';
  checkingTxid = 0;
  recovering_txid = 0;
  continueInvoke = 0;
  continueInvokePledge:any;

  sendingSecurityCode = 0;

  confidantConfirmed = 0;
  invokeSteps = [];
  recoverSteps = [];

  confidants = [];
  macaddresses = [];

  accounts = this.walletService.wallet.accounts;
  neowallets = this.walletService.wallet.neowallets;
  etheraccounts: any[];
  stakingTypes;

  staking = {
    'main' : [{
      name: 'For Deposit',
      minAmount : 0,
      minTime: 10
    },
    {
      name: 'For Confidant',
      minAmount : 0,
      minTime: 90
    },
    {
      name: 'For Withdraw',
      minAmount : 0,
      minTime: 180
    }],
    'test' : [{
      name: 'For Deposit',
      minAmount : 0,
      minTime: 10
    },
    {
      name: 'For Confidant',
      minAmount : 0,
      minTime: 10
    },
    {
      name: 'For Withdraw',
      minAmount : 0,
      minTime: 10
    }]
  };

  msg3 = '';

  recoverForm = new FormGroup({
    recover_txid: new FormControl('',Validators.compose([
      Validators.required,
      Validators.pattern('^([a-zA-Z0-9])*'),
      Validators.maxLength(64),
      Validators.minLength(64)
    ])),
  });

  recover_validation_messages = {
    'recover_txid': [
      { type: 'required', message: 'Txid is required' },
      { type: 'minlength', message: 'Txid must be at least 64 characters long' },
      { type: 'maxlength', message: 'Txid cannot be more than 64 characters long' },
      { type: 'pattern', message: 'Txid must contain only letters and numbers' }
    ]
  }

  recoverErrorMsg = '';

  stakingForm = new FormGroup({
    stakingType: new FormControl('0'),
    fromNEOWallet: new FormControl('',Validators.required),
    toQLCWallet: new FormControl('',Validators.required),
    availableQLCBalance: new FormControl('0'),
    endDate: new FormControl(''),
    amounToStake: new FormControl(''),
    durationInDays: new FormControl(''),
    tokenName: new FormControl('',Validators.compose([
      Validators.required,
      Validators.pattern('^([a-zA-Z_]+[ ]?)*[a-zA-Z_]$'),
      Validators.maxLength(40),
      Validators.minLength(1)
    ])),
    tokenSymbol: new FormControl('',Validators.compose([
      Validators.required,
      Validators.pattern('^([a-zA-Z_]+[ ]?)*[a-zA-Z_]$'),
      Validators.maxLength(10),
      Validators.minLength(1)
    ])),
    tokenSupply: new FormControl('',Validators.compose([
      Validators.required,
      Validators.pattern('[1-9][0-9]*'),
      Validators.maxLength(20),
      Validators.minLength(3)
    ])),
    tokenDecimals: new FormControl('',Validators.compose([
      Validators.required,
      Validators.pattern('[0-9]+'),
      Validators.maxLength(2),
      Validators.minLength(1)
    ])),
    email_address: new FormControl(''),
    security_code: new FormControl(''),
  });

  staking_validation_messages = {
    'tokenName': [
      { type: 'required', message: 'Token Name is required' },
      { type: 'minlength', message: 'Token Name must be at least 1 characters long' },
      { type: 'maxlength', message: 'Token Name cannot be more than 40 characters long' },
      { type: 'pattern', message: 'Token Name must contain only letters, space or underscore' }
    ],
    'tokenSymbol': [
      { type: 'required', message: 'Token Symbol is required' },
      { type: 'minlength', message: 'Token Symbol must be at least 1 characters long' },
      { type: 'maxlength', message: 'Token Symbol cannot be more than 40 characters long' },
      { type: 'pattern', message: 'Token Symbol must contain only letters, space or underscore' }
    ],
    'tokenSupply': [
      { type: 'required', message: 'Token Supply is required' },
      { type: 'minlength', message: 'Token Supply must be at least 3 characters long' },
      { type: 'maxlength', message: 'Token Supply cannot be more than 20 characters long' },
      { type: 'pattern', message: 'Token Supply must contain only numbers and it must not start with 0' }
    ],
    'tokenDecimals': [
      { type: 'required', message: 'Token Decimals is required' },
      { type: 'minlength', message: 'Token Decimals must be at least 1 characters long' },
      { type: 'maxlength', message: 'Token Decimals cannot be more than 2 characters long' },
      { type: 'pattern', message: 'Token Decimals must contain only numbers and it must not start with 0' }
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions' }
    ]
  }

  invalidTokenSymbol = 0;
  invalidTokenName = 0;

  //testData:any;

  constructor(
    private walletService: WalletService,
    private addressBookService: AddressBookService,
    private neoService: NeoWalletService,
    private nep5api: ApiNEP5Service,
    private api: ApiService,
		private util: UtilService,
		private workPool: WorkPoolService,
		private notifications: NotificationService,
    private trans: TranslateService,
    private confidantApi: ApiConfidantService,
    private etherService: EtherWalletService
  ) {
    this.stakingTypes = this.staking[environment.neoNetwork];
  }

  ngOnInit() {
    this.loadBalances();
    this.etherService.getBalance();
    this.getEtherAccounts();


  }
  
  async getEtherAccounts(){
    const accounts: any[] = await this.etherService.getAccounts();
    console.log('ccswap.getEtherAccounts', accounts);
    this.etheraccounts = accounts;
    return accounts;
  }

  async checkTxid() {
    if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.continueInvokePledge = {};
    this.checkingTxid = 1;
    this.recoverErrorMsg = '';
    this.recoverSteps = [];

    // check if TXID is a lock
    const txData = await this.neoService.contractGetLockInfo(this.recoverForm.value.recover_txid);
    if (txData === false) {
      this.recoverSteps.push({ msg: 'Wrong NEO wallet password.'});
      return;
    }
    if (txData.neoAddress != '') {
      this.recoverSteps.push({ msg: 'TXID lock found.'});
      const walletAccount = await this.walletService.getWalletAccount(txData.beneficial);
      if (!walletAccount) {
        this.recoverSteps.push({ msg: 'ERROR - QLC address not found. Please add the connected QLC address and try again.'});
        this.checkingTxid = 0;
        return;
      }
      const neoWallet= await this.walletService.getNeoWallet(txData.neoAddress);
      if (!neoWallet) {
        this.recoverSteps.push({ msg: 'ERROR - NEO address not found. Please add the connected NEO address and try again.'});
        this.checkingTxid = 0;
        return;
      }

      this.recoverSteps.push({ msg: 'Checking pledge status.'});
      const pledgeInfoByTransactionID = await this.nep5api.pledgeInfoByTransactionID(this.recoverForm.value.recover_txid);
      if (pledgeInfoByTransactionID.result) {
        const pledgeInfo = pledgeInfoByTransactionID.result;
        if (pledgeInfo.state != 'PledgeStart' && pledgeInfo.state != 'PledgeProcess') {
          this.recoverSteps.push({ msg: 'ERROR - Pledge already proccessed.'});
          this.checkingTxid = 0;
          return;
        }
      }

      this.checkingTxid = 0;
      this.recovering_txid = 1;
      this.stakingForm.get('fromNEOWallet').setValue(txData.neoAddress);
      this.stakingForm.get('toQLCWallet').setValue(txData.beneficial);
      this.stakingForm.get('amounToStake').setValue(new BigNumber(txData.amount).dividedBy(Math.pow(10,8)).toNumber() );
      this.stakingForm.get('endDate').setValue(txData.lockEnd);
      this.recoverSteps.push({ msg: 'Checking possible stakings by amount locked.'});

    } else {
      if (txData.lockInfo == 'not_lock') {
        this.recoverSteps.push({ msg: 'ERROR - TXID is not a lock.'});
      }
      if (txData.lockInfo == 'not_txid') {
        this.recoverSteps.push({ msg: 'ERROR - TXID not found, try again after a few blocks.'});
      }
      this.checkingTxid = 0;
    }

    return;
   
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  checkForm() {
    this.markFormGroupTouched(this.stakingForm);
    if (this.stakingForm.value.stakingType == 0) {
      if (this.stakingForm.get('fromNEOWallet').status == 'VALID' &&
          this.stakingForm.get('toQLCWallet').status == 'VALID' 
      ) {
        this.step = 2;
        window.scrollTo(0, 0);
      } 
    } else if (this.stakingForm.value.stakingType == 1) {
      if (this.stakingForm.get('fromNEOWallet').status == 'VALID' &&
          this.stakingForm.get('toQLCWallet').status == 'VALID' 
      ) {
        this.step = 2;
        window.scrollTo(0, 0);
      }
    }
    if (this.stakingForm.status === 'VALID') {
      this.step = 2;
      window.scrollTo(0, 0);
    }
  }

  invokeNewStaking() {
    this.loadBalances();
    this.step = 1;
    window.scrollTo(0, 0);
  }
  

  async checkTokenSymbol() {
    const tokensResult = await this.api.tokens();
    if (tokensResult.result) {
      const tokens = tokensResult.result;
      const findToken = tokens.find((token) => String(token.tokenSymbol).toLowerCase() ==  String(this.stakingForm.value.tokenSymbol).toLowerCase());
      if (findToken) {
        this.invalidTokenSymbol = 1;
      } else {
        this.invalidTokenSymbol = 0;
      }
    }
  }

  async checkTokenName() {
    const tokensResult = await this.api.tokens();
    if (tokensResult.result) {
      const tokens = tokensResult.result;
      const findToken = tokens.find((token) => String(token.tokenName).toLowerCase() ==  String(this.stakingForm.value.tokenName).toLowerCase());
      if (findToken) {
        this.invalidTokenName = 1;
      } else {
        this.invalidTokenName = 0;
      }
    }
  }

  async sendSecurityCode() {
    this.sendingSecurityCode = 1;
    const confirm = await this.confidantApi.sendSecurityCode(this.stakingForm.value.email_address);
    this.sendingSecurityCode = 2;
  }

  async checkSecurityCode() {
    this.confidantConfirmed = 3;
    const confirm = await this.confidantApi.checkSecurityCode(this.stakingForm.value.email_address,this.stakingForm.value.security_code);
    this.confidants = [];
    if (confirm.valid == 1) {
      this.confidantConfirmed = 1;
      this.confidants = confirm.mac_addresses;
    } else {
      this.confidantConfirmed = 2;
    }

  }

  

  loadLang() {
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg3').subscribe((res: string) => {
			this.msg3 = res;
		});
  }
  
  back() {
    this.step = 1;
    window.scrollTo(0, 0);
    this.macaddresses = [];

  }

  async loadBalances() {
		for (let i = 0; i < this.neowallets.length; i++) {
			this.neowallets[i].balances = [];
      this.neowallets[i].addressBookName = this.addressBookService.getAccountName(this.neowallets[i].id);

      const balance:any = await this.neoService.getNeoRpcBalance(this.neowallets[i].id);

      for (const asset of balance) {
				this.neowallets[i].balances[asset.asset_hash] = { 
					amount : new BigNumber(asset.amount).dividedBy(Math.pow(10,8)).toNumber(),
					asset_hash: asset.asset_hash
				}
			}
      
      /*
			const balance:any = await this.neoService.getBalance(this.neowallets[i].id);
			for (const asset of balance.assetSymbols) {
				this.neowallets[i].balances[asset] = new BigNumber(balance.assets[asset].balance).toFixed();
      }
			for (const token of balance.tokenSymbols) {
				let newTokenBalance = new BigNumber(balance.tokens[token]).toFixed();
				if (newTokenBalance == 'NaN')
					newTokenBalance = '0';
        this.neowallets[i].balances[token] = newTokenBalance;
			}*/
    }
    this.selectAccount();
    this.setDuration();
  }
  
  selectAccount() {
		if (this.stakingForm.value.fromNEOWallet == '') {
      console.log('neowallets',this.neowallets)
      if (this.neowallets[0] != undefined && this.neowallets[0].id != undefined) {
        this.stakingForm.get('fromNEOWallet').setValue(this.neowallets[0].id);
        
      }
    }
    if (this.stakingForm.value.toQLCWallet == '') {
      if (this.etheraccounts[0] != undefined) {
        this.stakingForm.get('toQLCWallet').setValue(this.etheraccounts[0]);
      }
    }

    const selectedNEOWallet = this.neowallets.find(a => a.id === this.stakingForm.value.fromNEOWallet);

    this.stakingForm.get('availableQLCBalance').setValue((selectedNEOWallet.balances[this.neoService.tokenList['QLC'].networks['1'].hash] != undefined? selectedNEOWallet.balances[this.neoService.tokenList['QLC'].networks['1'].hash].amount : 0));
        
    this.checkIfMinAmount();
  }

  checkIfMinAmount() {
    const minAmount = this.stakingForm.value.stakingType == 1 ? this.stakingTypes[this.stakingForm.value.stakingType].minAmount*this.macaddresses.length : this.stakingTypes[this.stakingForm.value.stakingType].minAmount;
    if (this.stakingForm.value.amounToStake <= minAmount) {
      this.stakingForm.get('amounToStake').setValue(minAmount);
    }
    if (new BigNumber(this.stakingForm.value.amounToStake).isGreaterThan(new BigNumber(this.stakingForm.value.availableQLCBalance))) {
      this.stakingForm.get('amounToStake').setValue(new BigNumber(this.stakingForm.value.availableQLCBalance).integerValue(BigNumber.ROUND_FLOOR));
    }
    this.stakingForm.get('amounToStake').markAsTouched();
  }

  async addMacAdd(mac_address) {
    const findMacAddress = await this.macaddresses.findIndex(o => o.mac_address === mac_address);
    if (findMacAddress != -1) {
      await this.macaddresses.splice(findMacAddress,1);
    } else {
      const findConfidant = await this.confidants.find(o => o.mac_address === mac_address);
      this.macaddresses.push(findConfidant);
    }
    
    this.stakingForm.get('amounToStake').setValue(this.stakingTypes[this.stakingForm.value.stakingType].minAmount*this.macaddresses.length);
    this.stakingForm.get('amounToStake').setValidators([
      Validators.required,
      Validators.pattern('[1-9][0-9]*'),
      Validators.maxLength(40),
      Validators.minLength(1),
      minAmountValidator(this.stakingTypes[Number(this.stakingForm.value.stakingType)].minAmount*this.macaddresses.length)
    ]);
    this.checkIfMinAmount();
  }
  
  setDuration() {
    this.stakingForm.get('amounToStake').setValidators([
      Validators.required,
      Validators.pattern('[1-9][0-9]*'),
      Validators.maxLength(40),
      Validators.minLength(1),
      minAmountValidator(this.stakingTypes[Number(this.stakingForm.value.stakingType)].minAmount)
    ]);
      this.stakingForm.get('amounToStake').setValue(this.stakingTypes[this.stakingForm.value.stakingType].minAmount);
      this.checkIfMinAmount();
  }

  async confirmInvoke() {
    const walletAccount = await this.walletService.getWalletAccount(this.stakingForm.value.toQLCWallet);
		if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.step = 3;
    window.scrollTo(0, 0);
    this.invokeSteps = [];
    let txData;
    if (this.recover == 1 && this.recovering_txid == 1) {
      txData = await this.neoService.contractGetLockInfo(this.recoverForm.value.recover_txid);
      console.log('confirmInvoke.txData',txData);
    } else {
      this.invokeSteps.push({ msg: 'Locking '+ this.stakingForm.value.amounToStake +' QLC on NEO network.'});
      txData = await this.contractLock();
    }
    if (txData === false) {
      this.invokeSteps.push({ msg: 'ERROR - Wrong NEO Wallet password.'});
      return;
    } 
    if (txData.lockTxId == undefined) {
      this.invokeSteps.push({ msg: 'ERROR - No TXID received. Please try again later.'});
      return;
    }
    this.invokeSteps.push({ msg: 'TXID received. Preparing pledge.', checkimg: 1});
    let pType = 'vote';
    if (this.stakingForm.value.stakingType == 1) {
      pType = 'network';
    } else if(this.stakingForm.value.stakingType == 2) {
      pType = 'mintage';
    }
    const pledgeResult = (pType == 'mintage') 
                            ? await this.getPrepareMintagePledge(txData)
                            : await this.getPreparePledge(txData,pType)
                            ;

    this.invokeSteps.push({ msg: 'Pledge prepared. Waiting for TXID confirmation.', checkimg: 1});

    

    this.confirmInvokeWaitForTXIDConfirm(txData,walletAccount);

    
  }

  async continueInvokeProccess() {
		if (this.walletService.walletIsLocked()) {
			return this.notifications.sendError('ERROR - wallet locked');
    }
    this.invokeSteps = [];
    const pledge = this.continueInvokePledge;
    console.log(pledge);
    const walletAccount = await this.walletService.getWalletAccount(pledge.beneficial);
    this.step = 3;
    window.scrollTo(0, 0);
    this.invokeSteps.push({ msg: 'Continuing invoke.'});
    this.invokeSteps.push({ msg: 'Checking TXID on NEO network.', checkimg: 1});

    this.confirmInvokeWaitForTXIDConfirmByPledge(pledge,walletAccount);

  }

  async confirmInvokeWaitForTXIDConfirmByPledge(pledge,walletAccount) {
    if (this.walletService.walletIsLocked()) {
      this.step = 1;
      window.scrollTo(0, 0);
			return this.notifications.sendError('ERROR - wallet locked');
    }
    if (walletAccount == undefined || walletAccount.keyPair == undefined) {
      this.recoverSteps = [];
      this.recoverSteps.push({ msg: 'ERROR - Beneficial account "' + pledge.beneficial + '" not found.'});
      this.continueInvokePledge = {};
      this.continueInvoke = 0;
      this.checkingTxid = 0;
      this.step = 1;
      window.scrollTo(0, 0);
			return this.notifications.sendError('ERROR - Beneficial account not found');
    }

    const txid = pledge.nep5TxId;

    const transaction = await this.neoService.getTransaction(txid);
    //console.log('txid is ');
    //console.log(txid);

    const pType = pledge.pType;
    
    if (transaction.txid) {
      const waitTimer = timer(20000).subscribe( async (data) => {
      //console.log(transaction);
      //console.log('txid confirmed');
      this.invokeSteps.push({ msg: 'TXID confirmed. Preparing QLC Chain pledge.', checkimg: 1});

      const pledgeResult = (pType == 'mintage') 
                            ? await this.nep5api.mintagePledge(txid)
                            : await this.nep5api.benefitPledge(txid)
                            ;

      if (pledgeResult.error) {
        if (pledgeResult.error.message == "get lockinfo error: value is not lockinfo struct : map[type:ByteArray value:]") {
          this.invokeSteps.push({ msg: 'ERROR. TXID is not a lock.', checkimg: 1});
        }
        return;
      }
      if (!pledgeResult.result) {
        this.invokeSteps.push({ msg: 'Pledge ERROR.', link: '/staking-create', linkText: 'Please use RECOVER to recover a failed TX.'});
        /*console.log('pledgeResult error repeating');
        const waitTimer = timer(5000).subscribe( (data) => {
          this.confirmInvokeWaitForTXIDConfirm(pledge,walletAccount);
        });*/
        return;
      }
      const preparedPledge = pledgeResult.result;
           
      this.invokeSteps.push({ msg: 'Pledge prepared. Processing ...'});
      const pledgetxid = await this.processBlock(preparedPledge,walletAccount.keyPair,txid);
      
      this.invokeSteps.push({ msg: 'Pledge succesfully processed. Txid on QLC Chain is: ' + pledgetxid.result, checkimg: 1 });
      this.step = 4;
      window.scrollTo(0, 0);
      });
    } else {
      console.log('no txid yet ... repeating');
      // wait for neoscan to confirm transaction
      const waitTimer = timer(5000).subscribe( (data) => {
        this.confirmInvokeWaitForTXIDConfirmByPledge(pledge,walletAccount);
      });
    }
  }

  async confirmInvokeWaitForTXIDConfirm(txData,walletAccount) {
    if (this.walletService.walletIsLocked()) {
      this.step = 1;
      window.scrollTo(0, 0);
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    const txid = txData.lockTxId;
    const transaction = await this.neoService.getTransaction(txid);
    

    let pType = 'vote';
    if (this.stakingForm.value.stakingType == 1) {
      pType = 'network';
    } else if(this.stakingForm.value.stakingType == 2) {
      pType = 'mintage';
    }
    
    if (1===1) {
      const waitTimer = timer(20000).subscribe( async (data) => {
        
      this.invokeSteps.push({ msg: 'TXID confirmed. Preparing QLC Chain pledge.', checkimg: 1});

      const pledgeResult = (pType == 'mintage') 
                            ? await this.nep5api.mintagePledge(txid)
                            : await this.nep5api.benefitPledge(txid)
                            ;

      if (pledgeResult.error) {
        if (pledgeResult.error.message == "get lockinfo error: value is not lockinfo struct : map[type:ByteArray value:]") {
          this.invokeSteps.push({ msg: 'ERROR. TXID is not a lock.', checkimg: 1});
        }
        return;
      }
      if (!pledgeResult.result) {
        console.log('pledgeResult error repeating');
        const waitTimer = timer(5000).subscribe( (data) => {
          this.confirmInvokeWaitForTXIDConfirm(txData,walletAccount);
        });
        return;
      }
      const pledge = pledgeResult.result;
            
      this.invokeSteps.push({ msg: 'Pledge prepared. Processing ...', checkimg: 1});
      const pledgetxid = await this.processBlock(pledge,walletAccount.keyPair,txid);
      
      this.invokeSteps.push({ msg: 'Pledge succesfully processed. Txid on QLC Chain is: ' + pledgetxid.result, checkimg: 1 });
      this.step = 4;
      window.scrollTo(0, 0);
      if (pType == 'network') {
        const setMac = await this.confidantApi.confirmMacAddresses(this.stakingForm.value.email_address, this.stakingForm.value.security_code, this.macaddresses, this.stakingForm.value.toQLCWallet, this.stakingForm.value.fromNEOWallet, txid);
        this.macaddresses = [];
        this.checkSecurityCode();
      }
      });
    } else {
      console.log('no txid yet ... repeating');
      // wait for neoscan to confirm transaction
      const waitTimer = timer(5000).subscribe( (data) => {
        this.confirmInvokeWaitForTXIDConfirm(txData,walletAccount);
      });
    }
  }





  async contractLock() {
    const txData = await this.neoService.neo5toerc20swapaccountLock(this.stakingForm.value.fromNEOWallet,this.stakingForm.value.amounToStake,this.stakingForm.value.toQLCWallet);
    if (txData === false) {
      return false;
    }
    if (txData.lockTxId == undefined) {
      return this.contractLock();
    }
    return txData;
  }
  
  async getPreparePledge(txData,pType) {
    const request1 = {
      beneficial: txData.beneficial,
      amount: txData.amount,
      pType
    }
    const request2 = {
      multiSigAddress: txData.multiSigAddress,
      publicKey: txData.publicKey,
      lockTxId: txData.lockTxId
    }
    const preparedPledge = await this.nep5api.prepareBenefitPledge(request1,request2);
    if (!preparedPledge.result) {
      return this.getPreparePledge(txData,pType);
    } else {
      return preparedPledge;
    }
  }

  async getPrepareMintagePledge(txData) {
    const request1 = {
      beneficial: txData.beneficial,
      tokenName: this.stakingForm.value.tokenName,
      tokenSymbol: this.stakingForm.value.tokenSymbol,
      totalSupply: this.stakingForm.value.tokenSupply,
      decimals: Number(this.stakingForm.value.tokenDecimals)
    }
    const request2 = {
      multiSigAddress: txData.multiSigAddress,
      publicKey: txData.publicKey,
      lockTxId: txData.lockTxId
    }
    const preparedPledge = await this.nep5api.prepareMintagePledge(request1,request2);
    if (!preparedPledge.result) {
      return this.getPrepareMintagePledge(txData);
    } else {
      return preparedPledge;
    }
  }


  


  async processBlock(block, keyPair, txid) {
    const povFittest = await this.api.getFittestHeader();
    if (povFittest.error || !povFittest.result) {
      console.log('ERROR - no fittest header');
      return;
    }
    block.poVHeight = povFittest.result.height;
		const blockHash = await this.api.blockHash(block);
		const signed = nacl.sign.detached(this.util.hex.toUint8(blockHash.result), keyPair.secretKey);
		const signature = this.util.hex.fromUint8(signed);

		block.signature = signature;
		let generateWorkFor = block.previous;
		if (block.previous === this.zeroHash) {
			const publicKey = await this.api.accountPublicKey(block.address);
			generateWorkFor = publicKey.result;
		}

		if (!this.workPool.workExists(generateWorkFor)) {
			this.notifications.sendInfo(this.msg3);
		}
		//console.log('generating work');
		const work = await this.workPool.getWork(generateWorkFor);
		//console.log('work >>> ' + work);
    block.work = work;
    
    const processResponse = await this.nep5api.process(block,txid);
    
		if (processResponse && processResponse.result) {
			this.workPool.addWorkToCache(processResponse.result); // Add new hash into the work pool
			this.workPool.removeFromCache(generateWorkFor);
			return processResponse;
		} else {
			return null;
		}
  }

}
