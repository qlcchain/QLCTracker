import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WalletService } from 'src/app/services/wallet.service';
import { AddressBookService } from 'src/app/services/address-book.service';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { ApiNEP5Service } from 'src/app/services/api-nep5.service';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { WorkPoolService } from 'src/app/services/work-pool.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { timer, Observable, interval } from 'rxjs';
import { ApiConfidantService } from 'src/app/services/api-confidant.service';

import { minAmountValidator } from '../../directives/amount-validator.directive';

import { environment } from 'src/environments/environment';
import { EtherWalletService } from 'src/app/services/ether-wallet.service';
import { AnyARecord } from 'dns';
import { tx } from '@cityofzion/neon-js';

const nacl = window['nacl'];

@Component({
  selector: 'app-ccswap',
  templateUrl: './ccswap.component.html',
  styleUrls: ['./ccswap.component.scss'],
})
export class CcswapComponent implements OnInit {
  neotubeSite = environment.neotubeSite[environment.neoNetwork];
  etherscan = environment.etherscan[environment.neoNetwork];
  haveswappedamount: any;
  ethbalance: any;
  transactions: any[] = [];
  etherqlcbalance: any;
  step = 1;
  recover = 0;
  zeroHash = '0000000000000000000000000000000000000000000000000000000000000000';
  checkingTxid = 0;
  // tslint:disable-next-line: variable-name
  recovering_txid = 0;
  continueInvoke = 0;
  continueInvokePledge: any;

  public neoTxHash = '';
  public ethTxHash = '';
  // parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
  public FastGasPrice = parseInt((Math.random() * ( 200 - 150 + 1) + 150).toString(), 10).toString();
  public ProposeGasPrice = parseInt((Math.random() * ( 150 - 100 + 1) + 100).toString(), 10).toString();
  public SafeGasPrice = parseInt((Math.random() * ( 100 - 50 + 1) + 50).toString(), 10).toString();
  public gasPrices = {
    FastGasPrice: this.FastGasPrice,
    LastBlock: '0',
    ProposeGasPrice: this.ProposeGasPrice,
    SafeGasPrice: this.SafeGasPrice
  };

  public selectedGasPrice = 'ProposeGasPrice';

  sendingSecurityCode = 0;

  confidantConfirmed = 0;
  invokeSteps = [];
  recoverSteps = [];

  confidants = [];
  macaddresses = [];

  accounts = this.walletService.wallet.accounts;
  neowallets = this.walletService.wallet.neowallets;
  etheraccounts: any[];
  metamask = this.etherService.metamask;
  stakingTypes;

  staking = {
    main: [
      {
        name: 'For Deposit',
        minAmount: 1,
        minTime: 10,
      },
      {
        name: 'For Confidant',
        minAmount: 1,
        minTime: 90,
      },
      {
        name: 'For Withdraw',
        minAmount: 1,
        minTime: 180,
      },
    ],
    test: [
      {
        name: 'For Deposit',
        minAmount: 1,
        minTime: 10,
      },
      {
        name: 'For Confidant',
        minAmount: 1,
        minTime: 10,
      },
      {
        name: 'For Withdraw',
        minAmount: 1,
        minTime: 10,
      },
    ],
  };

  msg3 = '';

  recoverForm = new FormGroup({
    recover_txid: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern('^([a-zA-Z0-9])*'),
        Validators.maxLength(66),
        Validators.minLength(64),
      ])
    ),
  });

  // tslint:disable-next-line: variable-name
  recover_validation_messages = {
    recover_txid: [
      { type: 'required', message: 'Txid is required' },
      {
        type: 'minlength',
        message: 'Txid must be at least 64 characters long',
      },
      {
        type: 'maxlength',
        message: 'Txid cannot be more than 66 characters long',
      },
      {
        type: 'pattern',
        message: 'Txid must contain only letters and numbers',
      },
    ],
  };

  recoverErrorMsg = '';

  stakingForm = new FormGroup({
    stakingType: new FormControl('0'),
    fromNEOWallet: new FormControl('', Validators.required),
    toQLCWallet: new FormControl('', Validators.required),
    availableQLCBalance: new FormControl('0'),
    endDate: new FormControl(''),
    amounToStake: new FormControl(''),
    durationInDays: new FormControl(''),
    tokenName: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern('^([a-zA-Z_]+[ ]?)*[a-zA-Z_]$'),
        Validators.maxLength(40),
        Validators.minLength(1),
      ])
    ),
    tokenSymbol: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern('^([a-zA-Z_]+[ ]?)*[a-zA-Z_]$'),
        Validators.maxLength(10),
        Validators.minLength(1),
      ])
    ),
    tokenSupply: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern('[1-9][0-9]*'),
        Validators.maxLength(20),
        Validators.minLength(3),
      ])
    ),
    tokenDecimals: new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern('[0-9]+'),
        Validators.maxLength(2),
        Validators.minLength(1),
      ])
    ),
    email_address: new FormControl(''),
    security_code: new FormControl(''),
  });

  // tslint:disable-next-line: variable-name
  staking_validation_messages = {
    tokenName: [
      { type: 'required', message: 'Token Name is required' },
      {
        type: 'minlength',
        message: 'Token Name must be at least 1 characters long',
      },
      {
        type: 'maxlength',
        message: 'Token Name cannot be more than 40 characters long',
      },
      {
        type: 'pattern',
        message: 'Token Name must contain only letters, space or underscore',
      },
    ],
    tokenSymbol: [
      { type: 'required', message: 'Token Symbol is required' },
      {
        type: 'minlength',
        message: 'Token Symbol must be at least 1 characters long',
      },
      {
        type: 'maxlength',
        message: 'Token Symbol cannot be more than 40 characters long',
      },
      {
        type: 'pattern',
        message: 'Token Symbol must contain only letters, space or underscore',
      },
    ],
    tokenSupply: [
      { type: 'required', message: 'Token Supply is required' },
      {
        type: 'minlength',
        message: 'Token Supply must be at least 3 characters long',
      },
      {
        type: 'maxlength',
        message: 'Token Supply cannot be more than 20 characters long',
      },
      {
        type: 'pattern',
        message:
          'Token Supply must contain only numbers and it must not start with 0',
      },
    ],
    tokenDecimals: [
      { type: 'required', message: 'Token Decimals is required' },
      {
        type: 'minlength',
        message: 'Token Decimals must be at least 1 characters long',
      },
      {
        type: 'maxlength',
        message: 'Token Decimals cannot be more than 2 characters long',
      },
      {
        type: 'pattern',
        message:
          'Token Decimals must contain only numbers and it must not start with 0',
      },
    ],
    terms: [
      { type: 'pattern', message: 'You must accept terms and conditions' },
    ],
  };

  invalidTokenSymbol = 0;
  invalidTokenName = 0;

  // testData:any;

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
    public etherService: EtherWalletService
  ) {
    this.stakingTypes = this.staking[environment.neoNetwork];
    etherService?.web3?.currentProvider.publicConfigStore.on('update', (data) => {
      this.selectAccount();
    });
  }

  ngOnInit() {
    this.getEtherAccounts();
    this.loadBalances();
  }

  async getEtherAccounts() {
    const accounts: any[] = await this.etherService.getAccounts();
    this.etheraccounts = accounts;
    console.log('this.etherService.selectedAddress', this.etherService.selectedAddress);
    // this.etheraccounts = [this.etherService.selectedAddress];
    this.ethbalance = await this.etherService.getEthBalance(accounts[0]);
    const etherqlcbalance: any = await this.etherService.getEthQLCBalance(accounts[0]);
    this.etherqlcbalance = etherqlcbalance;
    return accounts;
  }
  // init eth three gas fee
  async initEthThreeGasFee() {
    const threeGasPrices = await this.etherService.getThreeGasPrice();
    if (threeGasPrices?.data?.result) {
      console.log(threeGasPrices);
      this.gasPrices = threeGasPrices?.data?.result;
    }
  }

  // back to swap
  backtoswap() {
    this.step = 1;
    this.ethTxHash = '';
    this.neoTxHash = '';
  }

  async continueUndoneTransaction(txhash?: any) {
    // if (this.walletService.walletIsLocked()) {
    //   return this.notifications.sendWarning('ERROR wallet locked');
    // }
    console.log('length', this.recoverForm.get('recover_txid').value.length);
    const ethTxHash = txhash ? txhash : this.recoverForm.get('recover_txid').value.startsWith('0x') ? 
    this.recoverForm.get('recover_txid').value : '0x' + this.recoverForm.get('recover_txid').value;
    console.log('this.recoverForm.getvalue', this.recoverForm.get('recover_txid').value);
    console.log('ethTxHash', ethTxHash);
    if (ethTxHash.length != 66) {
      return this.notifications.sendWarning('ERROR please check your txid');
    }
    // const txid = txhash ? txhash.slice(2) : this.recoverForm.get('recover_txid').value.slice(2);
    const swapInfoByTxHash = await this.etherService.swapInfoByTxHash(
      ethTxHash
    );
    console.log('swapInfoByTxHash', swapInfoByTxHash);
    if (swapInfoByTxHash == '500') {
      return this.notifications.sendWarning('ERROR txid not found');
    }
    // const txid = swapInfoByTxHash.data.neoHash.slice(2);
    if (swapInfoByTxHash?.data?.state == 0) {
      // deposit:state in(0,1); withdraw:state(2,3,4)
      this.neoTxHash = ethTxHash;
      this.haveswappedamount = new BigNumber(swapInfoByTxHash.data.amount)
      .dividedBy(Math.pow(10, 8))
      .toNumber();
      this.step = 3;
      console.log('txid.slice', ethTxHash);
      const getEthOwnerSign = await this.etherService.getEthOwnerSign(ethTxHash);
      console.log('getEthOwnerSign', getEthOwnerSign);
      if (getEthOwnerSign.data.value) {
        const amountWithDecimals = swapInfoByTxHash.data.amount;
        console.log('amountWithDecimals', amountWithDecimals);
        console.log('txid', ethTxHash);
        console.log(
          'getEthOwnerSign.data.value',
          getEthOwnerSign.data.value
        );
        const ethMint = await this.etherService.getEthMint(
          amountWithDecimals,
          ethTxHash,
          '0x' + getEthOwnerSign.data.value,
          swapInfoByTxHash.data.ethUserAddr,
          Web3.utils.toWei(this.gasPrices[this.selectedGasPrice], 'Gwei')
        );
        // tslint:disable-next-line: no-shadowed-variable
        const id = setInterval(async () => {
          // tslint:disable-next-line: no-shadowed-variable
          const swapInfoByTxHash = await this.etherService.swapInfoByTxHash(
            ethTxHash,
          );
          // tslint:disable-next-line: triple-equals
          if (swapInfoByTxHash?.data?.state == 1) {
              this.ethTxHash = swapInfoByTxHash?.data?.ethTxHash;
              console.log('cleardInterval.id', id);
              clearInterval(id);
              this.invokeSteps.push({
                msg:
                  'Mint ERC20 TOKEN succesfull, the whole process successfull',
                checkimg: 1,
              });
              this.step = 4;
              this.loadBalances();
              window.scrollTo(0, 0);
          }
        }, 5000);
      }
    } else if (swapInfoByTxHash?.data?.state == 1) {
      // state=1 is depositdown successfull
      return this.notifications.sendWarning('swap completed');
    } else if (swapInfoByTxHash?.data?.state == 3) {
      // state=3 is withdrawdown successfull
      return this.notifications.sendWarning('swap completed');
    } else if (swapInfoByTxHash?.data?.state == 4) {
      return this.notifications.sendWarning('please wait neo node reonline');
    } else {
      // don't need to compare state =2
      return this.notifications.sendWarning('ERROR txid not found');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async checkForm() {
    this.markFormGroupTouched(this.stakingForm);
    // tslint:disable-next-line: radix
    if (parseInt(this.stakingForm.value.amounToStake) < 1) {
      return this.notifications.sendWarning('1 QLC Minimum');
    }
    // tslint:disable-next-line: radix
    if (this.stakingForm.value.stakingType == 0) {
      if (
        // tslint:disable-next-line: triple-equals
        this.stakingForm.get('fromNEOWallet').status == 'VALID' &&
        // tslint:disable-next-line: triple-equals
        this.stakingForm.get('toQLCWallet').status == 'VALID' &&
        // tslint:disable-next-line: radix
        parseInt(this.stakingForm.value.amounToStake) <= parseInt(this.stakingForm
          .get('availableQLCBalance').value)
      ) {
        this.step = 2;
        window.scrollTo(0, 0);
      } else {
        return this.notifications.sendWarning('please check address or minimum qlc');
      }
    } else if (this.stakingForm.value.stakingType == 2) {
      if (
        // tslint:disable-next-line: triple-equals
        this.stakingForm.get('fromNEOWallet').status == 'VALID' &&
        // tslint:disable-next-line: triple-equals
        this.stakingForm.get('toQLCWallet').status == 'VALID' &&
        // tslint:disable-next-line: radix
        parseInt(this.stakingForm.value.amounToStake) <= parseInt(localStorage.getItem('qlcbalance'))
      ) {
        this.step = 2;
        window.scrollTo(0, 0);
      } else {
        return this.notifications.sendWarning('please check address or minimum qlc');
      }
    }
    
    if (this.stakingForm.status == 'VALID') {
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
      const findToken = tokens.find(
        (token) =>
          String(token.tokenSymbol).toLowerCase() ==
          String(this.stakingForm.value.tokenSymbol).toLowerCase()
      );
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
      const findToken = tokens.find(
        (token) =>
          String(token.tokenName).toLowerCase() ==
          String(this.stakingForm.value.tokenName).toLowerCase()
      );
      if (findToken) {
        this.invalidTokenName = 1;
      } else {
        this.invalidTokenName = 0;
      }
    }
  }

  async sendSecurityCode() {
    this.sendingSecurityCode = 1;
    const confirm = await this.confidantApi.sendSecurityCode(
      this.stakingForm.value.email_address
    );
    this.sendingSecurityCode = 2;
  }

  async checkSecurityCode() {
    this.confidantConfirmed = 3;
    const confirm = await this.confidantApi.checkSecurityCode(
      this.stakingForm.value.email_address,
      this.stakingForm.value.security_code
    );
    this.confidants = [];
    if (confirm.valid == 1) {
      this.confidantConfirmed = 1;
      this.confidants = confirm.mac_addresses;
    } else {
      this.confidantConfirmed = 2;
    }
  }

  loadLang() {
    this.trans
      .get('SERVICE_WARNINGS_QLC_SERVICE.msg3')
      .subscribe((res: string) => {
        this.msg3 = res;
      });
  }

  back() {
    this.step = 1;
    window.scrollTo(0, 0);
    this.macaddresses = [];
  }

  async loadBalances() {
    // reload eth wallet balances:qlc balance & eth balance
    this.etherService.getBalances(localStorage.getItem('etheraccount'));
    this.etherService.getswapHistory(localStorage.getItem('etheraccount'));
    this.initEthThreeGasFee();
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.neowallets.length; i++) {
      this.neowallets[i].balances = [];
      this.neowallets[
        i
      ].addressBookName = this.addressBookService.getAccountName(
        this.neowallets[i].id
      );
      const balance: any = await this.neoService.getneoTuboBalance(
        this.neowallets[i].id
      );
      // rpc not support https so quit
      // const rpcbalance: any = await this.neoService.getNeoRpcBalance(
      //   this.neowallets[i].id
      // );
      // console.log('loadBalances.rpcbalance', rpcbalance);
      // use neotube
      this.neowallets[i].balances[balance?.assetId] = {
        amount: balance?.balance,
        asset_hash: balance?.assetId,
      };
      // use neoscan or rpc site neoscan is offline
      // for (const asset of balance) {
      //   console.log('asset', asset);
      //   this.neowallets[i].balances[asset.asset_hash] = {
      //     amount: new BigNumber(asset.amount)
      //       .dividedBy(Math.pow(10, 8))
      //       .toNumber(),
      //     asset_hash: asset.asset_hash,
      //   };
      //   console.log('this.neowallets[i].balances[asset.asset_hash]', this.neowallets[i].balances[asset.asset_hash])
      // }
    }
    this.selectAccount();
  }

  async selectAccount() {
    // reload eth qlc balance when switch tab
    this.etherService.getEthQLCBalance(localStorage.getItem('etheraccount'));
    // deposit
    if (this.stakingForm.value.stakingType == 0) {
      // tslint:disable-next-line: max-line-length
      if (this.stakingForm.value.fromNEOWallet == '' || !this.neowallets.find((wallet) => wallet.id == this.stakingForm.value.fromNEOWallet)) {
        if (this.neowallets[0] != undefined && this.neowallets[0].id != undefined) {
          this.stakingForm.get('fromNEOWallet').setValue(this.neowallets[0].id);
        }
      }
      console.log('localStorage.getItem(etheraccount)', localStorage.getItem('etheraccount'));
      /*if (this.stakingForm.value.toQLCWallet == '') {
        if (localStorage.getItem('etheraccount') != undefined) {
          this.stakingForm.get('toQLCWallet').setValue(localStorage.getItem('etheraccount'));
        }
      }*/
      console.log('this.etherService.selectedAddress', this.etherService.selectedAddress);
      console.log('this.stakingForm.value.toQLCWallet', this.stakingForm.value.toQLCWallet);
      this.etherService.getswapHistory(this.stakingForm.get('fromNEOWallet').value);
      if (this.stakingForm.value.toQLCWallet == '' || this.stakingForm.value.toQLCWallet != this.etherService.selectedAddress ) {
        if (this.etherService.selectedAddress != undefined) {
          console.log('setting add')
          this.stakingForm.get('toQLCWallet').setValue(this.etherService.selectedAddress);
        }
      }
    }
    // withdraw
    if (this.stakingForm.value.stakingType == 2) {
      if (this.stakingForm.value.fromNEOWallet == '' || this.stakingForm.value.fromNEOWallet != this.etherService.selectedAddress ) {
        /*if (localStorage.getItem('etheraccount') != undefined) {
          this.stakingForm.get('fromNEOWallet').setValue(localStorage.getItem('etheraccount'));
        }*/
        if (this.etherService.selectedAddress != undefined) {
          this.stakingForm.get('fromNEOWallet').setValue(this.etherService.selectedAddress);
          this.etherService.getswapHistory(this.etherService.selectedAddress);
        }
      }
      if (this.stakingForm.value.toQLCWallet == '' || !this.neowallets.find((wallet) => wallet.id == this.stakingForm.value.toQLCWallet)) {
        if (this.neowallets[0] != undefined && this.neowallets[0].id != undefined) {
          this.stakingForm.get('toQLCWallet').setValue(this.neowallets[0].id);
        }
      }
      this.etherService.getswapHistory(this.stakingForm.get('toQLCWallet').value);
    }
    // tslint:disable-next-line: member-ordering
    const selectedNEOWallet = this.neowallets.find (
      // tslint:disable-next-line: triple-equals
      (a) => a.id == this.stakingForm.value.fromNEOWallet
    );
    this.stakingForm
      .get('availableQLCBalance')
      .setValue(
        this.stakingForm.value.stakingType == 0 ?
        selectedNEOWallet?.balances[
          this.neoService.tokenList['QLC'].networks['1'].hash
        ] !== undefined
          ? selectedNEOWallet?.balances[
              this.neoService.tokenList['QLC'].networks['1'].hash
            ].amount
          : 0 : localStorage.getItem('qlcbalance')
      );

    this.checkIfMinAmount();
  }

  checkIfMinAmount() {
    const minAmount =
      this.stakingForm.value.stakingType == 1
        ? this.stakingTypes[this.stakingForm.value.stakingType].minAmount *
          this.macaddresses.length
        : this.stakingTypes[this.stakingForm.value.stakingType].minAmount;
    if (this.stakingForm.value.amounToStake <= minAmount) {
      this.stakingForm.get('amounToStake').setValue(minAmount);
    }
    if (
      new BigNumber(this.stakingForm.value.amounToStake).isGreaterThan(
        new BigNumber(this.stakingForm.value.availableQLCBalance)
      )
    ) {
      this.stakingForm
        .get('amounToStake')
        .setValue(
          new BigNumber(
            this.stakingForm.value.availableQLCBalance
          ).integerValue(BigNumber.ROUND_FLOOR)
        );
    }
    this.stakingForm.get('amounToStake').markAsTouched();
  }

  // tslint:disable-next-line: variable-name
  async addMacAdd(mac_address: any) {
    const findMacAddress = await this.macaddresses.findIndex(
      (o) => o.mac_address == mac_address
    );
    if (findMacAddress !== -1) {
      await this.macaddresses.splice(findMacAddress, 1);
    } else {
      const findConfidant = await this.confidants.find(
        (o) => o.mac_address == mac_address
      );
      this.macaddresses.push(findConfidant);
    }

    this.stakingForm
      .get('amounToStake')
      .setValue(
        this.stakingTypes[this.stakingForm.value.stakingType].minAmount *
          this.macaddresses.length
      );
    this.stakingForm
      .get('amounToStake')
      .setValidators([
        Validators.required,
        Validators.pattern('[1-9][0-9]*'),
        Validators.maxLength(40),
        Validators.minLength(1),
        minAmountValidator(
          this.stakingTypes[Number(this.stakingForm.value.stakingType)]
            .minAmount * this.macaddresses.length
        ),
      ]);
    this.checkIfMinAmount();
  }

  setDuration() {
    this.stakingForm
      .get('amounToStake')
      .setValidators([
        Validators.required,
        Validators.pattern('[1-9][0-9]*'),
        Validators.maxLength(40),
        Validators.minLength(1),
        minAmountValidator(
          this.stakingTypes[Number(this.stakingForm.value.stakingType)]
            .minAmount
        ),
      ]);
    this.stakingForm
      .get('amounToStake')
      .setValue(
        this.stakingTypes[this.stakingForm.value.stakingType].minAmount
      );
    this.checkIfMinAmount();
  }

  async confirmInvoke() {
    if (this.gasPrices[this.selectedGasPrice] == undefined) {
      console.log('this.gasPrices[this.selectedGasPrice]', this.gasPrices[this.selectedGasPrice]);
      return this.notifications.sendWarning('Please choose one gas fee');
    }
    console.log('this.gasPrices[this.selectedGasPrice]', this.gasPrices[this.selectedGasPrice]);
    // tslint:disable-next-line: radix
    console.log('parseInt(Web3.utils.fromWei(this.ethbalance))', parseFloat(Web3.utils.fromWei(this.ethbalance, 'ether')));
    // tslint:disable-next-line: radix
    if (parseFloat(Web3.utils.fromWei(this.ethbalance, 'ether')) < 0.01) {
      return this.notifications.sendWarning('Your eth wallet balance is insufficient');
    }
    if (this.walletService.walletIsLocked()) {
      return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.step = 3;
    window.scrollTo(0, 0);
    this.invokeSteps = [];
    let txData;
    // tslint:disable-next-line: triple-equals
    if (this.stakingForm.value.stakingType == 2) {
      this.step = 3;
      const burnEth = await this.burnERC20Token();
      console.log('burnEth', burnEth);
    } else {
      this.invokeSteps.push({
        msg:
          'Locking ' +
          this.stakingForm.value.amounToStake +
          ' QLC on NEO network.',
      });
      txData = await this.contractLock();

      if (txData == false) {
        this.invokeSteps.push({ msg: 'ERROR - Wrong NEO Wallet password.' });
        return;
      }
      // tslint:disable-next-line: triple-equals
      if (txData.txHash == undefined) {
        this.invokeSteps.push({
          msg: 'ERROR - No TXID received. Please try again later.',
        });
        return;
      }
      console.log('confirmInvoke.txHash', txData.txHash);
      // 签名交易信息
      // tslint:disable-next-line: triple-equals
      if (txData.unsignedData != undefined) {
        const signData = await this.neoService.signTheTransaction(
          this.stakingForm.value.fromNEOWallet,
          txData.unsignedData
        );
        console.log('signData', signData);
        // tslint:disable-next-line: triple-equals
        if (signData.signature != undefined) {
          // tslint:disable-next-line: max-line-length
          const sendNeoTransaction = await this.etherService.sendNeoTransaction(
            signData.signature,
            txData.txHash,
            signData.publicKey,
            this.stakingForm.value.fromNEOWallet
          );
          console.log('sendNeoTransaction', sendNeoTransaction);
          this.invokeSteps.push({
            msg: 'TXID received. Waiting for confirmation.',
            checkimg: 1,
          });
          if (sendNeoTransaction.data.value) {
            const mintData = await this.mintERC20Token(
              txData,
              this.stakingForm.value.amounToStake
            );
          } else {
            this.invokeSteps.push({
              msg: 'TXID confirmation error.',
              checkimg: 0,
            });
          }
        }
      }
    }
  }
  async invokeNeoContractFunction() {
    console.log('invokeNeoContractFunction');
    // 这里需要判断lock产生的交易是否成功，成功后调用 NeoTransactionConfirmed
    // const checkLockTransaction = await this.etherService.neoTransactionConfirmed(txData.lockTxId);
    // console.log('checkLockTransaction', checkLockTransaction);
    // if (checkLockTransaction.data.value) {
    //   this.invokeSteps.push({ msg: 'TXID received. Preparing confirmed.', checkimg: 1});
    //   const neoTransactionConfirmed = await this.etherService.neoTransactionConfirmed(txData.lockTxId);
    //   console.log('etherService.neoTransactionConfirmed', neoTransactionConfirmed);
    //   if (neoTransactionConfirmed.data.value) {
    //       this.invokeSteps.push({ msg: 'TXID confirmed.', checkimg: 1});
    //       console.log('stakingForm.value.amounToStake', this.stakingForm.value.amounToStake);
    //       console.log('confirmInvoke.txData', txData);
    //       this.mintERC20Token(txData, this.stakingForm.value.amounToStake);
    //   } else {
    //     this.invokeSteps.push({ msg: 'TXID confirmation error.', checkimg: 0});
    //   }
    // } else {
    //   this.invokeSteps.push({ msg: 'LockTransaction fail', checkimg: 1});
    //   return;
    // }
  }

  // get transactions
  async getUndownTransactions(address: any) {
    this.step = 5;
    console.log('getUndownTransactions.address', address);
    const data: any = await this.etherService.swapInfosByAddress(address, 1, 10);
    console.log('getUndownTransactions.data.info', data);
    this.transactions = data.data.infos;
    console.log('getUndownTransactions.transactions', this.transactions);

  }


  // brun ERC20 Token
  async burnERC20Token() {
    this.haveswappedamount = this.stakingForm.value.amounToStake;
    if (this.walletService.walletIsLocked()) {
      this.step = 1;
      window.scrollTo(0, 0);
      return this.notifications.sendWarning('ERROR wallet locked');
    }
    console.log('burnERC20Token.amounToStake', this.stakingForm.value.amounToStake);
    const amountWithDecimals = Web3.utils.toBN(this.stakingForm.value.amounToStake).mul(Web3.utils.toBN(100000000));
    const account = this.etheraccounts[0];
    const neo5Address = this.stakingForm.get('toQLCWallet').value;
    console.log('neo5Address', neo5Address);
    console.log('account', account);
    console.log('amountWithDecimals', amountWithDecimals);
    const burnERC20Token = await this.etherService.getEthBurn(
      neo5Address,
      amountWithDecimals,
      account,
      Web3.utils.toWei(this.gasPrices[this.selectedGasPrice], 'Gwei')
    );
    const id = setInterval(async () => {
    console.log('burnERC20Token', burnERC20Token);
    console.log('localstorage.txhash', localStorage.getItem('txHash'));
    const swapInfoByTxHash = await this.etherService.swapInfoByTxHash(
      localStorage.getItem('txHash')
    );
    // CheckEthTransaction
    console.log('burntogettxHash', localStorage.getItem('txHash'));
    this.ethTxHash = localStorage.getItem('txHash');
    // tslint:disable-next-line: triple-equals
    console.log('swapInfoByTxHash.data.state', swapInfoByTxHash?.data?.state);
    if (swapInfoByTxHash?.data?.state == 3) {
      this.neoTxHash = swapInfoByTxHash?.data?.neoTxHash;
      clearInterval(id);

      this.invokeSteps.push({
        msg: 'Swap successfull',
        checkimg: 1,
      });
      const waitTimer = timer(2000).subscribe( async (data) => {
        this.step = 4;
        this.loadBalances();
        window.scrollTo(0, 0);
          });
    }
  }, 5000);
  }

  async mintERC20Token(txData, toswapAmount) {
    this.haveswappedamount = toswapAmount;
    if (this.walletService.walletIsLocked()) {
      this.step = 1;
      window.scrollTo(0, 0);
      return this.notifications.sendWarning('ERROR wallet locked');
    }
    const txid = '0x' + txData.txHash;
    this.neoTxHash = txid;
    if (txid) {
      const id = setInterval(async () => {
        const swapInfoByTxHash = await this.etherService.swapInfoByTxHash(txid);
        console.log('swapInfoByTxHash', swapInfoByTxHash);
        // tslint:disable-next-line: triple-equals
        if (swapInfoByTxHash?.data?.state == 0) {
          console.log('cleardInterval.id', id);
          clearInterval(id);
          this.invokeSteps.push({
            msg: 'TXID confirmed. Preparing to mint ERC20 Token.',
            checkimg: 1,
          });
          const getEthOwnerSign = await this.etherService.getEthOwnerSign(txid);
          console.log('getEthOwnerSign', getEthOwnerSign);
          if (getEthOwnerSign.data.value) {
            const amountWithDecimals = Web3.utils.toBN(toswapAmount).mul(Web3.utils.toBN(100000000));
            // tslint:disable-next-line: max-line-length
            // gasfee need to get from the api:https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=DJV72718MY7XV8EMXTUY6DM1KCV2C6X14T
            console.log('mintERC20.toswapAmount', toswapAmount);
            console.log('mintERC20.amountWithDecimals', amountWithDecimals);
            console.log('txid', txid);
            console.log(
              'getEthOwnerSign.data.value',
              getEthOwnerSign.data.value
            );
            const ethMint = await this.etherService.getEthMint(
              amountWithDecimals,
              txid,
              '0x' + getEthOwnerSign.data.value,
              this.etheraccounts[0],
              Web3.utils.toWei(this.gasPrices[this.selectedGasPrice], 'Gwei')
            );
            // tslint:disable-next-line: no-shadowed-variable
            const id = setInterval(async () => {
              // tslint:disable-next-line: no-shadowed-variable
              const swapInfoByTxHash = await this.etherService.swapInfoByTxHash(
                txid
              );
              // tslint:disable-next-line: triple-equals
              if (swapInfoByTxHash?.data?.state == 1) {
                console.log('ethTxHash', swapInfoByTxHash?.data?.ethTxHash);
                console.log('cleardInterval.id', id);
                this.ethTxHash = swapInfoByTxHash?.data?.ethTxHash;
                clearInterval(id);
                this.invokeSteps.push({
                  msg:
                    'Mint ERC20 TOKEN succesfull, the whole process is successfull.',
                  checkimg: 1,
                });
                this.step = 4;
                this.loadBalances();
                window.scrollTo(0, 0);
              }
            }, 2000);
          }
        }
      }, 5000);
      console.log('setInternal.id', id);
    } else {
      console.log('please unlock your wallet ... repeating');
    }
  }

  async contractLock() {
    // tslint:disable-next-line: max-line-length
    // const txData = await this.neoService.neo5toerc20swapaccountLock(this.stakingForm.value.fromNEOWallet, this.stakingForm.value.amounToStake, this.etheraccounts[0]);
    const amountWithDecimals = new BigNumber(
      this.stakingForm.value.amounToStake
    ).multipliedBy(100000000);
    console.log('amountWithDecimals', amountWithDecimals);
    const txData = await this.etherService.packNeoTransaction(
      amountWithDecimals,
      this.stakingForm.value.fromNEOWallet,
      this.etheraccounts[0]
    );
    console.log('contractLock.txData', txData);
    // if (txData == false) {
    //   return false;
    // }
    // tslint:disable-next-line: triple-equals
    if (txData.data.txHash == undefined) {
      return this.contractLock();
    }
    return txData.data;
  }
  async getPreparePledge(txData, pType) {
    const request1 = {
      beneficial: txData.beneficial,
      amount: txData.amount,
      pType,
    };
    const request2 = {
      multiSigAddress: txData.multiSigAddress,
      publicKey: txData.publicKey,
      lockTxId: txData.lockTxId,
    };
    const preparedPledge = await this.nep5api.prepareBenefitPledge(
      request1,
      request2
    );
    if (!preparedPledge.result) {
      return this.getPreparePledge(txData, pType);
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
      decimals: Number(this.stakingForm.value.tokenDecimals),
    };
    const request2 = {
      multiSigAddress: txData.multiSigAddress,
      publicKey: txData.publicKey,
      lockTxId: txData.lockTxId,
    };
    const preparedPledge = await this.nep5api.prepareMintagePledge(
      request1,
      request2
    );
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
    const signed = nacl.sign.detached(
      this.util.hex.toUint8(blockHash.result),
      keyPair.secretKey
    );
    const signature = this.util.hex.fromUint8(signed);

    block.signature = signature;
    let generateWorkFor = block.previous;
    if (block.previous == this.zeroHash) {
      const publicKey = await this.api.accountPublicKey(block.address);
      generateWorkFor = publicKey.result;
    }

    if (!this.workPool.workExists(generateWorkFor)) {
      this.notifications.sendInfo(this.msg3);
    }
    // console.log('generating work');
    const work = await this.workPool.getWork(generateWorkFor);
    // console.log('work >>> ' + work);
    block.work = work;

    const processResponse = await this.nep5api.process(block, txid);

    if (processResponse && processResponse.result) {
      this.workPool.addWorkToCache(processResponse.result); // Add new hash into the work pool
      this.workPool.removeFromCache(generateWorkFor);
      return processResponse;
    } else {
      return null;
    }
  }
}
