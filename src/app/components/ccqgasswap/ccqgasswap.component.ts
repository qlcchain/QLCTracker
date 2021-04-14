import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { WalletService } from "src/app/services/wallet.service";
import { AddressBookService } from "src/app/services/address-book.service";
import { NeoWalletService } from "src/app/services/neo-wallet.service";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { ApiNEP5Service } from "src/app/services/api-nep5.service";
import { ApiService } from "src/app/services/api.service";
import { UtilService } from "src/app/services/util.service";
import { WorkPoolService } from "src/app/services/work-pool.service";
import { NotificationService } from "src/app/services/notification.service";
import { TranslateService } from "@ngx-translate/core";
import { timer, Observable, interval } from "rxjs";
import { ApiConfidantService } from "src/app/services/api-confidant.service";

import { minAmountValidator } from "../../directives/amount-validator.directive";

import { environment } from "src/environments/environment";
import { EtherWalletService } from "src/app/services/ether-wallet.service";
import { ActivatedRoute } from "@angular/router";

const nacl = window["nacl"];

@Component({
  selector: "app-ccqgasswap",
  templateUrl: "./ccqgasswap.component.html",
  styleUrls: ["./ccqgasswap.component.scss"],
})
export class CcqgasswapComponent implements OnInit, OnDestroy {
  chainType = '';
  chainType20 = '';
  neotubeSite = environment.neotubeSite[environment.neoNetwork];
  etherscan = environment.etherscan[environment.neoNetwork];
  bscscan = environment.bscscan[environment.neoNetwork];
  haveswappedamount: any;
  ethbalance: any;
  transactions: any[] = [];
  etherqlcbalance: any;
  step = 1;
  recover = 0;
  zeroHash = "0000000000000000000000000000000000000000000000000000000000000000";
  checkingTxid = 0;
  // tslint:disable-next-line: variable-name
  recovering_txid = 0;
  continueInvoke = 0;
  continueInvokePledge: any;

  public neoTxHash = "";
  public ethTxHash = "";
  // parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
  FastGasPrice: any;
  ProposeGasPrice: any;
  SafeGasPrice: any;
  gasPrices = {
  };

  public selectedGasPrice = "ProposeGasPrice";

  sendingSecurityCode = 0;

  confidantConfirmed = 0;
  invokeSteps = [];
  recoverSteps = [];

  confidants = [];
  macaddresses = [];

  accounts = this.walletService.wallet.accounts;
  accountTokens: any = [];
  selectedToken: any = [];
  selectedTokenSymbol = '';
  neowallets = this.walletService.wallet.neowallets;
  etheraccounts: any[];
  metamask = this.etherService.metamask;
  stakingTypes;

  staking = {
    main: [
      {
        name: "For Deposit",
        minAmount: 1,
        minTime: 10,
      },
      {
        name: "For Confidant",
        minAmount: 1,
        minTime: 90,
      },
      {
        name: "For Withdraw",
        minAmount: 1,
        minTime: 180,
      },
    ],
    test: [
      {
        name: "For Deposit",
        minAmount: 1,
        minTime: 10,
      },
      {
        name: "For Confidant",
        minAmount: 1,
        minTime: 10,
      },
      {
        name: "For Withdraw",
        minAmount: 1,
        minTime: 10,
      },
    ],
  };

  msg3 = "";

  recoverForm = new FormGroup({
    recover_txid: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.pattern("^([a-zA-Z0-9])*"),
        Validators.maxLength(66),
        Validators.minLength(64),
      ])
    ),
  });

  // tslint:disable-next-line: variable-name
  recover_validation_messages = {
    recover_txid: [
      { type: "required", message: "Txid is required" },
      {
        type: "minlength",
        message: "Txid must be at least 64 characters long",
      },
      {
        type: "maxlength",
        message: "Txid cannot be more than 66 characters long",
      },
      {
        type: "pattern",
        message: "Txid must contain only letters and numbers",
      },
    ],
  };

  recoverErrorMsg = "";

  stakingForm = new FormGroup({
    stakingType: new FormControl("0"),
    fromQLCWallet: new FormControl("", Validators.required),
    toQLCWallet: new FormControl("", Validators.required),
    availableQLCBalance: new FormControl("0"),
    endDate: new FormControl(""),
    amounToStake: new FormControl(""),
    durationInDays: new FormControl(""),
    tokenName: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.pattern("^([a-zA-Z_]+[ ]?)*[a-zA-Z_]$"),
        Validators.maxLength(40),
        Validators.minLength(1),
      ])
    ),
    tokenSymbol: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.pattern("^([a-zA-Z_]+[ ]?)*[a-zA-Z_]$"),
        Validators.maxLength(10),
        Validators.minLength(1),
      ])
    ),
    tokenSupply: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.pattern("[1-9][0-9]*"),
        Validators.maxLength(20),
        Validators.minLength(3),
      ])
    ),
    tokenDecimals: new FormControl(
      "",
      Validators.compose([
        Validators.required,
        Validators.pattern("[0-9]+"),
        Validators.maxLength(2),
        Validators.minLength(1),
      ])
    ),
    email_address: new FormControl(""),
    security_code: new FormControl(""),
  });

  // tslint:disable-next-line: variable-name
  staking_validation_messages = {
    tokenName: [
      { type: "required", message: "Token Name is required" },
      {
        type: "minlength",
        message: "Token Name must be at least 1 characters long",
      },
      {
        type: "maxlength",
        message: "Token Name cannot be more than 40 characters long",
      },
      {
        type: "pattern",
        message: "Token Name must contain only letters, space or underscore",
      },
    ],
    tokenSymbol: [
      { type: "required", message: "Token Symbol is required" },
      {
        type: "minlength",
        message: "Token Symbol must be at least 1 characters long",
      },
      {
        type: "maxlength",
        message: "Token Symbol cannot be more than 40 characters long",
      },
      {
        type: "pattern",
        message: "Token Symbol must contain only letters, space or underscore",
      },
    ],
    tokenSupply: [
      { type: "required", message: "Token Supply is required" },
      {
        type: "minlength",
        message: "Token Supply must be at least 3 characters long",
      },
      {
        type: "maxlength",
        message: "Token Supply cannot be more than 20 characters long",
      },
      {
        type: "pattern",
        message:
          "Token Supply must contain only numbers and it must not start with 0",
      },
    ],
    tokenDecimals: [
      { type: "required", message: "Token Decimals is required" },
      {
        type: "minlength",
        message: "Token Decimals must be at least 1 characters long",
      },
      {
        type: "maxlength",
        message: "Token Decimals cannot be more than 2 characters long",
      },
      {
        type: "pattern",
        message:
          "Token Decimals must contain only numbers and it must not start with 0",
      },
    ],
    terms: [
      { type: "pattern", message: "You must accept terms and conditions" },
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
    public etherService: EtherWalletService,
    private route: ActivatedRoute
  ) {
    this.stakingTypes = this.staking[environment.neoNetwork];

    // Get Current Path:  company  同理
    this.route?.url?.subscribe((url) => (this.chainType = url[1]?.path === 'qgaseth' ? 'eth' : 'bsc'));
    this.chainType20 = this.chainType === 'eth' ? 'ERC20' : 'BEP20';
    // init gasfee
     // parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
    this.FastGasPrice = this.chainType === 'eth'
    ? parseInt((Math.random() * ( 200 - 150 + 1) + 150).toString(), 10).toString()
    : '15';
    this.ProposeGasPrice = this.chainType === 'eth' ?
    parseInt((Math.random() * ( 150 - 100 + 1) + 100).toString(), 10).toString()
    : '10';
    this.SafeGasPrice = this.chainType === 'eth' ?
    parseInt((Math.random() * ( 100 - 50 + 1) + 50).toString(), 10).toString() : '5';
    this.gasPrices = {
      FastGasPrice: this.FastGasPrice,
      LastBlock: '0',
      ProposeGasPrice: this.ProposeGasPrice,
      SafeGasPrice: this.SafeGasPrice
    };
  }

  ngOnDestroy() {
    //this.etherService.accountSub.unsubscribe();
  }

  ngOnInit() {
    // this.route.queryParams.subscribe(p => {
    //   this.parasGet = p.

    // })
    this.etherService.accountSub.subscribe((test) => {
      console.log("sub test", test);
      this.selectAccount();
      this.getEtherAccounts();
      this.loadBalances();
    });
    this.getEtherAccounts();
    this.loadBalances();
  }

  async getEtherAccounts() {
    const accounts: any[] = await this.etherService.getAccounts();
    this.etheraccounts = accounts;
    console.log(
      "this.etherService.selectedAddress",
      this.etherService.selectedAddress
    );
    // this.etheraccounts = [this.etherService.selectedAddress];
    this.ethbalance = await this.etherService.getEthBalance(accounts[0]);
    const etherqlcbalance: any = await this.etherService.getEthQLCBalance(
      accounts[0],
      this.chainType
    );
    this.etherqlcbalance = etherqlcbalance;
    return accounts;
  }
  // init eth three gas fee
  async initEthThreeGasFee() {
    const threeGasPrices = await this.etherService.getThreeGasPrice(this.chainType);
    if (threeGasPrices?.data?.result) {
      //console.log(threeGasPrices);
      this.gasPrices = threeGasPrices?.data?.result;
    }
  }

  // back to swap
  backtoswap() {
    this.step = 1;
    this.ethTxHash = "";
    this.neoTxHash = "";
  }

  async continueUndoneTransaction(txhash?: any) {
    console.log('continueUndoneTransaction,chainType', this.chainType);
    // if (this.walletService.walletIsLocked()) {
    //   return this.notifications.sendWarning('ERROR wallet locked');
    // }
    console.log('length', this.recoverForm.get('recover_txid').value.length);
    const ethTxHash = txhash
      ? '0x' + txhash
      : this.recoverForm.get('recover_txid').value.startsWith('0x')
      ? this.recoverForm.get('recover_txid').value
      : '0x' + this.recoverForm.get('recover_txid').value;
    console.log(
      'this.recoverForm.getvalue',
      this.recoverForm.get('recover_txid').value
    );
    console.log('ethTxHash', ethTxHash);
    if (ethTxHash.length != 66) {
      return this.notifications.sendWarning('ERROR please check your txid');
    }
    // const txid = txhash ? txhash.slice(2) : this.recoverForm.get('recover_txid').value.slice(2);
    const swapInfoByTxHash = await this.etherService.qgasswapInfoByTxHash(
      ethTxHash
    );
    console.log('swapInfoByTxHash', swapInfoByTxHash);
    if (swapInfoByTxHash == "500") {
      return this.notifications.sendWarning('ERROR txid not found');
    }
    // get ethTransactionID when state =1,5 mins will be removed
    // const ethTransactionID: any = await this.etherService.chainTransactionID(
    //   ethTxHash
    // );
    // const txid = swapInfoByTxHash.data.neoHash.slice(2);
    if (swapInfoByTxHash?.data?.state == 1) {
      // deposit:state in(0:depending,1:completed); withdraw:state(2,3,4)
      // if (ethTransactionID?.data?.hash) {
      //   // ethTransactionID
      //   console.log(
      //     'ethTransactionID?.data?.hash-confirm',
      //     ethTransactionID?.data?.hash
      //   );
      //   const getTransactionsStatusByEthTxhash: any = await this.etherService.getTransactionsStatusByEthTxhash(
      //     ethTransactionID?.data?.hash
      //   );
      //   if (getTransactionsStatusByEthTxhash?.data?.result?.status == "") {
      //     return this.notifications.sendWarning("swap processing");
      //   } else {
      //     return this.notifications.sendWarning("swap completed");
      //   }
      // }
      this.neoTxHash = ethTxHash;
      this.haveswappedamount = new BigNumber(swapInfoByTxHash.data.amount)
        .dividedBy(Math.pow(10, 8))
        .toNumber();
      this.step = 3;
      // mint erc20/bsc20 token
      const mintData = await this.mintERC20Token(
        ethTxHash,
        this.haveswappedamount
      );
    } else if (swapInfoByTxHash?.data?.state == 1) {
      // state=1 is depositdown successfull
      return this.notifications.sendWarning("swap completed");
    } else if (swapInfoByTxHash?.data?.state == 3) {
      // state=3 is withdrawdown successfull
      return this.notifications.sendWarning("swap completed");
    } else if (swapInfoByTxHash?.data?.state == 4) {
      return this.notifications.sendWarning("please wait neo node reonline");
    } else {
      // don't need to compare state =2
      return this.notifications.sendWarning("ERROR txid not found");
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
        this.stakingForm.get('fromQLCWallet').status == 'VALID' &&
        // tslint:disable-next-line: triple-equals
        this.stakingForm.get('toQLCWallet').status == 'VALID' &&
        // tslint:disable-next-line: radix
        parseInt(this.stakingForm.value.amounToStake) <= parseInt(this.stakingForm.get('availableQLCBalance').value)
      ) {
        this.step = 2;
        window.scrollTo(0, 0);
      } else {
        return this.notifications.sendWarning(
          'please check address or minimum qlc'
        );
      }
    } else if (this.stakingForm.value.stakingType == 2) {
      if (
        // tslint:disable-next-line: triple-equals
        this.stakingForm.get('fromQLCWallet').status == 'VALID' &&
        // tslint:disable-next-line: triple-equals
        this.stakingForm.get('toQLCWallet').status == 'VALID' &&
        // tslint:disable-next-line: radix
        parseInt(this.stakingForm.value.amounToStake) <= parseInt(localStorage.getItem('qgasbalance'))
      ) {
        this.step = 2;
        window.scrollTo(0, 0);
      } else {
        return this.notifications.sendWarning(
          'please check address or minimum qlc'
        );
      }
    }

    if (this.stakingForm.status == "VALID") {
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
      .get("SERVICE_WARNINGS_QLC_SERVICE.msg3")
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
    const tokenMap = {};
    const tokens = await this.api.tokens();
    if (!tokens.error) {
      tokens.result.forEach((token) => {
        tokenMap[token.tokenId] = token;
      });
    }

    // fill account meta
    for (const account of this.accounts) {
      const accountInfo = await this.api.accountInfo(account.id);
      if (!accountInfo.error) {
        const am = accountInfo.result;
        account.otherTokens = [];
        for (const token of am.tokens) {
          if (tokenMap.hasOwnProperty(token.type)) {
            token.tokenInfo = tokenMap[token.type];
            if (
              token.tokenInfo.tokenSymbol !== 'QLC' &&
              token.tokenInfo.tokenSymbol !== 'QGAS'
            ) {
              account.otherTokens.push(token);
            }
          }
        }
        account.accountMeta = am;
      }
    }
    this.selectAccount();
  }

  selectToken() {
      if (this.accountTokens !== undefined && this.accountTokens.length > 0) {
        this.selectedToken = this.accountTokens.find(a => a.tokenInfo.tokenSymbol === this.selectedTokenSymbol);
      } else {
        this.selectedToken = '';
      }
  }
  tokenBalance(token) {
    if (this.accountTokens !== undefined && this.accountTokens.length > 0) {
      const tokenData = this.accountTokens.find(a => a.tokenInfo.tokenSymbol === token);
      if (tokenData != undefined && tokenData.balance != undefined)
        return tokenData.balance;
      else
        return 0.00;
		} else {
			return 0.00;
		}
  }
  async selectAccount() {
    // reload eth qlc balance when switch tab
    this.etherService.getQGASBalance(this.etherService.selectedAddress, this.chainType);
    // deposit
    if (this.stakingForm.value.stakingType == 0) {
      // tslint:disable-next-line: max-line-length
      if (
        this.stakingForm.value.fromQLCWallet == "" ||
        !this.accounts.find(
          (wallet) => wallet.id == this.stakingForm.value.fromQLCWallet
        )
      ) {
        if (this.accounts[0] != undefined && this.accounts[0].id != undefined) {
          this.stakingForm.get("fromQLCWallet").setValue(this.accounts[0].id);
        }
      }
      console.log(
        "localStorage.getItem(etheraccount)",
        localStorage.getItem("etheraccount")
      );
      /*if (this.stakingForm.value.toQLCWallet == '') {
        if (localStorage.getItem('etheraccount') != undefined) {
          this.stakingForm.get('toQLCWallet').setValue(localStorage.getItem('etheraccount'));
        }
      }*/
      console.log(
        "this.etherService.selectedAddress",
        this.etherService.selectedAddress
      );
      console.log(
        "this.stakingForm.value.toQLCWallet",
        this.stakingForm.value.toQLCWallet
      );
      this.etherService.getqgasswapHistory(
        this.stakingForm.get("fromQLCWallet").value
      );
      if (
        this.stakingForm.value.toQLCWallet == "" ||
        this.stakingForm.value.toQLCWallet != this.etherService.selectedAddress
      ) {
        if (this.etherService.selectedAddress != undefined) {
          console.log("setting add");
          this.stakingForm
            .get("toQLCWallet")
            .setValue(this.etherService.selectedAddress);
        }
      }
    }
    // withdraw
    if (this.stakingForm.value.stakingType == 2) {
      if (
        this.stakingForm.value.fromQLCWallet == "" ||
        this.stakingForm.value.fromQLCWallet !=
          this.etherService.selectedAddress
      ) {
        /*if (localStorage.getItem('etheraccount') != undefined) {
          this.stakingForm.get('fromQLCWallet').setValue(localStorage.getItem('etheraccount'));
        }*/
        if (this.etherService.selectedAddress != undefined) {
          this.stakingForm
            .get("fromQLCWallet")
            .setValue(this.etherService.selectedAddress);
          this.etherService.getqgasswapHistory(this.etherService.selectedAddress);
        }
      }
      if (
        this.stakingForm.value.toQLCWallet == "" ||
        !this.accounts.find(
          (wallet) => wallet.id == this.stakingForm.value.toQLCWallet
        )
      ) {
        if (this.accounts[0] != undefined && this.accounts[0].id != undefined) {
          this.stakingForm.get("toQLCWallet").setValue(this.accounts[0].id);
        }
      }
      this.etherService.getqgasswapHistory(
        this.stakingForm.get("toQLCWallet").value
      );
    }
    // tslint:disable-next-line: member-ordering
    const selectedNEOWallet = this.accounts.find(
      // tslint:disable-next-line: triple-equals
      (a) => a.id == this.stakingForm.value.fromQLCWallet
    );
    console.log('this.stakingForm.value.stakingType', this.stakingForm.value.stakingType);
    console.log('selectedNEOWallet', selectedNEOWallet);
    this.stakingForm
      .get('availableQLCBalance')
      .setValue(
        this.stakingForm.value.stakingType == 0
          ? selectedNEOWallet?.balances['QGAS']?.balance !== undefined
            ? new BigNumber(selectedNEOWallet?.balances['QGAS']?.balance).dividedBy(Math.pow(10, 8))
            .toNumber()
            : 1
          : localStorage.getItem('qgasbalance')
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
      this.stakingForm.get("amounToStake").setValue(minAmount);
    }
    if (
      new BigNumber(this.stakingForm.value.amounToStake).isGreaterThan(
        new BigNumber(this.stakingForm.value.availableQLCBalance)
      )
    ) {
      this.stakingForm
        .get("amounToStake")
        .setValue(
          new BigNumber(
            this.stakingForm.value.availableQLCBalance
          ).integerValue(BigNumber.ROUND_FLOOR)
        );
    }
    this.stakingForm.get("amounToStake").markAsTouched();
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
      .get("amounToStake")
      .setValue(
        this.stakingTypes[this.stakingForm.value.stakingType].minAmount *
          this.macaddresses.length
      );
    this.stakingForm
      .get("amounToStake")
      .setValidators([
        Validators.required,
        Validators.pattern("[1-9][0-9]*"),
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
      .get("amounToStake")
      .setValidators([
        Validators.required,
        Validators.pattern("[1-9][0-9]*"),
        Validators.maxLength(40),
        Validators.minLength(1),
        minAmountValidator(
          this.stakingTypes[Number(this.stakingForm.value.stakingType)]
            .minAmount
        ),
      ]);
    this.stakingForm
      .get("amounToStake")
      .setValue(
        this.stakingTypes[this.stakingForm.value.stakingType].minAmount
      );
    this.checkIfMinAmount();
  }

  async confirmInvoke() {
    if (this.gasPrices[this.selectedGasPrice] === undefined) {
      console.log(
        'this.gasPrices[this.selectedGasPrice]',
        this.gasPrices[this.selectedGasPrice]
      );
      return this.notifications.sendWarning('Please choose one gas fee');
    }
    console.log(
      'this.gasPrices[this.selectedGasPrice]',
      this.gasPrices[this.selectedGasPrice]
    );
    // tslint:disable-next-line: radix
    console.log(
      'parseInt(Web3.utils.fromWei(this.ethbalance))',
      parseFloat(Web3.utils.fromWei(this.ethbalance, 'ether'))
    );
    // tslint:disable-next-line: radix
    if (parseFloat(Web3.utils.fromWei(this.ethbalance, 'ether')) < 0.01) {
      return this.notifications.sendWarning(
        'Your eth wallet balance is insufficient'
      );
    }
    if (this.walletService.walletIsLocked()) {
      return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.step = 3;
    window.scrollTo(0, 0);
    this.invokeSteps = [];
    let txData;
    // tslint:disable-next-line: triple-equals
    // stakingType =2:burnERC20Token
    console.log('mint.chainType', this.chainType);
    if (this.stakingForm.value.stakingType == 2) {
      this.step = 3;
      const burnEth = await this.burnERC20Token();
      console.log('burnEth', burnEth);
    } else {
      this.invokeSteps.push({
        msg:
          'Locking ' +
          this.stakingForm.value.amounToStake +
          ' QGAS on QLC network.',
      });
      txData = await this.contractLock();
      console.log('confirmInvoke.hash', txData.hash);
      console.log('confirmInvoke.root', txData.root);
      // tslint:disable-next-line: triple-equals
      if (txData.hash == undefined && txData.root == undefined) {
        this.invokeSteps.push({
          msg: 'ERROR - No TXID received. Please try again later.',
        });
        return;
      }
      if (txData?.hash !== undefined && txData?.root !== undefined) {
        // client sign and calculate work by getPledgeSendBlock return values
        // get sign and calc work
        const walletAccount = await this.walletService.getWalletAccount(this.stakingForm.value.fromQLCWallet);
        console.log('mint.walletAccount', walletAccount);
        console.log('mint.txData?.hash', txData?.hash);
        console.log('mint.txData?.root', txData?.root);
        const signed = nacl.sign.detached(this.util.hex.toUint8(txData?.hash),
        walletAccount.keyPair.secretKey);
        console.log('mint.walletAccount.keyPair.secretKey', walletAccount.keyPair.secretKey);
        console.log('mint.signed', signed);
        const signature = this.util.hex.fromUint8(signed);
        const work = await this.workPool.getWork(txData?.root);
        console.log('mint.signature:this.util.hex.fromUint8(signed)', signature);
        console.log('mint.work', work);
        // call qgasswap/processBlock to process block on qlc chain
        const processBlock = await this.etherService.qgasprocessBlock(
          txData?.hash,
          signature,
          work
        );
        console.log('mint.processBlock', processBlock);
        // mint erc20/bsc20 token
        const mintData = await this.mintERC20Token(
          txData.hash,
          this.stakingForm.value.amounToStake
        );
        }
    }
  }

  // get transactions
  async getUndownTransactions(address: any) {
    this.step = 5;
    console.log("getUndownTransactions.address", address);
    const data: any = await this.etherService.swapInfosByAddress(
      address,
      1,
      10
    );
    console.log("getUndownTransactions.data.info", data);
    this.transactions = data.data.infos;
    console.log("getUndownTransactions.transactions", this.transactions);
  }

  // burn ERC20 Token
  async burnERC20Token() {
    this.haveswappedamount = this.stakingForm.value.amounToStake;
    if (this.walletService.walletIsLocked()) {
      this.step = 1;
      window.scrollTo(0, 0);
      return this.notifications.sendWarning('ERROR wallet locked');
    }
    console.log(
      'burnERC20Token.amounToStake',
      this.stakingForm.value.amounToStake
    );
    const amountWithDecimals = Web3.utils
      .toBN(this.stakingForm.value.amounToStake)
      .mul(Web3.utils.toBN(100000000));
    const account = this.etheraccounts[0];
    const neo5Address = this.stakingForm.get('toQLCWallet').value;
    console.log('neo5Address', neo5Address);
    console.log('account', account);
    console.log('amountWithDecimals', amountWithDecimals);
    const burnERC20Token = await this.etherService.getQgasBurn(
      neo5Address,
      amountWithDecimals,
      account,
      Web3.utils.toWei(this.gasPrices[this.selectedGasPrice], 'Gwei'),
      this.chainType
    );
    const id = setInterval(async () => {
      console.log('burnERC20Token', burnERC20Token);
      console.log('localstorage.txhash', localStorage.getItem('txHash'));
      // client call hub qgasswap/swapInfoByTxHash by eth/bsc hash regularly, wait state to QGasWithDrawPending:4
      const swapInfoByTxHash = await this.etherService.qgasswapInfoByTxHash(
        localStorage.getItem('txHash')
      );
      // CheckEthTransaction
      console.log('burntogettxHash', localStorage.getItem('txHash'));
      this.ethTxHash = localStorage.getItem('txHash');
      // tslint:disable-next-line: triple-equals
      console.log('swapInfoByTxHash.data.state', swapInfoByTxHash?.data?.state);
      if (swapInfoByTxHash?.data?.state == 4) {
        clearInterval(id);
        // call /qgasswap/getWithdrawRewardBlock to get contract reward block
        const qgasgetWithdrawRewardBlock = await this.etherService.qgasgetWithdrawRewardBlock(
          localStorage.getItem('txHash')
        );
        // client sign and calculate work by getWithdrawRewardBlock return values
        // sign and calc work
        const walletAccount = await this.walletService.getWalletAccount(neo5Address);
        if (qgasgetWithdrawRewardBlock?.data?.hash != undefined && qgasgetWithdrawRewardBlock?.data?.root != undefined) {
            const signed = nacl.sign.detached(this.util.hex.toUint8(qgasgetWithdrawRewardBlock?.data?.hash),
            walletAccount.keyPair.secretKey);
            const signature = this.util.hex.fromUint8(signed);
            const work = await this.workPool.getWork(qgasgetWithdrawRewardBlock?.data?.root);
            // call qgasswap/processBlock to process block on qlc chain
            const processBlock = await this.etherService.qgasprocessBlock(
              qgasgetWithdrawRewardBlock?.data?.hash,
              signature,
              work
            );
            const id5 = setInterval(async () => {
              // tslint:disable-next-line: no-shadowed-variable
              const swapInfoByTxHash = await this.etherService.qgasswapInfoByTxHash(
                localStorage.getItem('txHash')
              );
              if (swapInfoByTxHash?.data?.state === 5) {
                this.neoTxHash = swapInfoByTxHash?.data?.qlcRewardTxHash;
                clearInterval(id5);

                this.invokeSteps.push({
                  msg: 'Swap successfull',
                  checkimg: 1,
                });
                const waitTimer = timer(2000).subscribe(async (data) => {
                  this.step = 4;
                  this.loadBalances();
                  window.scrollTo(0, 0);
                });
              }

            }, 2000);
        }
      }
    }, 5000);
  }

  async mintERC20Token(txData, toswapAmount) {
    this.haveswappedamount = toswapAmount;
    if (this.walletService.walletIsLocked()) {
      this.step = 1;
      window.scrollTo(0, 0);
      return this.notifications.sendWarning("ERROR wallet locked");
    }
    console.log('mintERC20Token', txData);
    const txid = txData.startsWith('0x') ? txData : '0x' + txData;
    console.log('mintERC20Token.txid', txid);
    this.neoTxHash = txid;
    if (txid) {
      const id = setInterval(async () => {
        const swapInfoByTxHash = await this.etherService.qgasswapInfoByTxHash(txid);
        console.log("swapInfoByTxHash", swapInfoByTxHash);
        // tslint:disable-next-line: triple-equals
        if (swapInfoByTxHash?.data?.state == 1) {
          console.log("cleardInterval.id", id);
          clearInterval(id);
          this.invokeSteps.push({
            msg: 'TXID confirmed. Preparing to mint ' + this.chainType20 + ' Token.',
            checkimg: 1,
          });
          const getEthOwnerSign = await this.etherService.qgasgetChainOwnerSign(
            txid
          );
          console.log("qgasgetChainOwnerSign", getEthOwnerSign);
          if (getEthOwnerSign.data.value) {
            const amountWithDecimals = Web3.utils
              .toBN(toswapAmount)
              .mul(Web3.utils.toBN(100000000));
            // tslint:disable-next-line: max-line-length
            // gasfee need to get from the api:https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=DJV72718MY7XV8EMXTUY6DM1KCV2C6X14T
            console.log("mintERC20.toswapAmount", toswapAmount);
            console.log("mintERC20.amountWithDecimals", amountWithDecimals);
            console.log("txid", txid);
            console.log(
              "getEthOwnerSign.data.value",
              getEthOwnerSign.data.value
            );
            const ethMint = await this.etherService.getQgasMint(
              amountWithDecimals,
              txid,
              '0x' + getEthOwnerSign.data.value,
              this.etheraccounts[0],
              Web3.utils.toWei(this.gasPrices[this.selectedGasPrice], "Gwei"),
              this.chainType
            );
            // tslint:disable-next-line: no-shadowed-variable
            const id = setInterval(async () => {
              // tslint:disable-next-line: no-shadowed-variable
              const swapInfoByTxHash = await this.etherService.qgasswapInfoByTxHash(
                txid
              );
              // tslint:disable-next-line: triple-equals
              if (swapInfoByTxHash?.data?.state == 2) {
                console.log("ethTxHash", swapInfoByTxHash?.data?.chainTxHash);
                console.log("cleardInterval.id", id);
                this.ethTxHash = swapInfoByTxHash?.data?.chainTxHash;
                clearInterval(id);
                this.invokeSteps.push({
                  msg:
                    "Mint TOKEN succesfull, the whole process is successfull.",
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
      console.log("setInternal.id", id);
    } else {
      console.log("Txid confirmed error");
    }
  }

  async contractLock() {
    // tslint:disable-next-line: max-line-length
    // const txData = await this.neoService.neo5toerc20swapaccountLock(this.stakingForm.value.fromQLCWallet, this.stakingForm.value.amounToStake, this.etheraccounts[0]);
    const amountWithDecimals = new BigNumber(
      this.stakingForm.value.amounToStake
    ).multipliedBy(100000000);
    console.log("amountWithDecimals", amountWithDecimals);
    const txData = await this.etherService.qgasgetPledgeSendBlock(
      this.stakingForm.value.fromQLCWallet,
      amountWithDecimals,
      this.etheraccounts[0],
      this.chainType
    );
    console.log("contractLock.txData", txData);
    // if (txData == false) {
    //   return false;
    // }
    // tslint:disable-next-line: triple-equals
    if (txData.data.hash == undefined && txData.data.root == undefined) {
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
      console.log("ERROR - no fittest header");
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
