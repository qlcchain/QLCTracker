import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressBookService } from '../../../services/address-book.service';
import { ChainxAccountService } from '../../../services/chainx-account.service';
import { NotificationService } from '../../../services/notification.service';
import { WalletService } from '../../../services/wallet.service';
import { CurrencyPipe } from '@angular/common';
import BigNumber from 'bignumber.js';
import { NoCommaPipe } from '../../../pipes/no-comma.pipe';

@Component({
  selector: 'app-chainx-send',
  templateUrl: './chainx-send.component.html',
  styleUrls: ['./chainx-send.component.scss'],
  providers: [CurrencyPipe, NoCommaPipe]
})
export class ChainxSendComponent implements OnInit {
  chainxAccounts = this.walletService.wallet.chainxAccounts;
  chainxAccount = {
    id: '',
    addressBookName: null,
    balances: null,
    wif: null
  };
  activePanel = 'send';
  amount = null;
  amountFiat?: number;
  accountFrom = '';
  accountFromName = '';
  accountTo = '';
  accountToBook = '';
  accountToName = '';
  memo = '';
  txHash = '';
  confirmingTransaction = false;
  alreadySending = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private currencyPipe: CurrencyPipe,
    private addressBookService: AddressBookService,
    private notificationService: NotificationService,
    private walletService: WalletService,
    public chainxAccountService: ChainxAccountService,
    public noCommaPipe: NoCommaPipe
  ) {
  }

  ngOnInit() {
    this.accountFrom = this.route.snapshot.params.address;

    if (!this.accountFrom) {
      this.accountFrom = this.chainxAccounts[0].id;
    }

    this.loadAccount();
  }

  async loadAccount(refresh = false) {
    let account = this.chainxAccounts.find(a => a.id === this.route.snapshot.params.address);

    if (account === undefined) {
      account = this.chainxAccounts[0];
    }

    this.chainxAccount = account;
    const assets = await this.chainxAccountService.getAssetsByAccount(this.chainxAccount.id);

    for (const asset of assets.data) {
      this.chainxAccount.balances = asset.details;
    }

    if (refresh) {
      this.notificationService.sendInfo('Successfully refreshed.');
    }

    this.loading = false;
  }

  checkAmount() {
    this.amount = this.noCommaPipe.transform(this.amount);

    if (this.chainxAccount.balances === null || !this.amount || Number(this.amount) < 0) {
      this.amount = 0;
    } else if (new BigNumber(this.amount * this.chainxAccountService.divisor).gt(new BigNumber(this.chainxAccount.balances.Free))) {
      this.amount = this.chainxAccount.balances.Free / this.chainxAccountService.divisor;
    }

    this.transformAmount();
  }

  private transformAmount() {
    this.amount = this.currencyPipe.transform(this.amount, '', '', '1.2-8');
  }

  async selectAccount() {
    this.chainxAccount = this.chainxAccounts.find(a => a.id === this.accountFrom);
    const assets = await this.chainxAccountService.getAssetsByAccount(this.chainxAccount.id);

    for (const asset of assets.data) {
      this.chainxAccount.balances = asset.details;
    }

    this.amount = null;
  }

  async confirmTransaction() {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    this.alreadySending = true;
    this.confirmingTransaction = true;

    try {
      const amount = Number(this.noCommaPipe.transform(this.amount)) * this.chainxAccountService.divisor;

      const data = {
        sender: this.accountFrom,
        destination: this.accountTo,
        memo: this.memo,
        amount
      };

      const response: any = await this.chainxAccountService.transfer(data);

      this.activePanel = 'success';
      this.notificationService.sendSuccess(`Transaction was successful.`);
      this.txHash = response.txHash;
    } catch (err) {
      console.log(err);

      if (typeof err.message !== 'undefined') {
        this.notificationService.sendError(err.message);
      } else if (typeof err.result !== 'undefined') {
        this.notificationService.sendError(`Some error occurred: ${err.result}`);
      }
    }

    this.confirmingTransaction = false;
    this.resetFields();

    await this.loadAccount();
  }

  async sendTransaction() {
    if (!this.accountFrom) {
      return this.notificationService.sendWarning('Missing account of sender.');
    }

    if (!this.accountTo) {
      return this.notificationService.sendWarning('Missing account of receiver.');
    }

    if (this.accountFrom === this.accountTo) {
      return this.notificationService.sendWarning('Receiver account is the same as sender account.');
    }

    this.amount = this.noCommaPipe.transform(this.amount);

    if (!this.amount || parseFloat(this.amount) === 0) {
      return this.notificationService.sendWarning('Amount is missing.');
    }

    this.accountFromName = this.addressBookService.getAccountName(this.accountFrom);
    this.accountToName = this.addressBookService.getAccountName(this.accountTo);

    this.activePanel = 'confirm';
  }

  async setMaxAmount() {
    this.amount = this.chainxAccount.balances === null ? 0 : (this.chainxAccount.balances.Free / this.chainxAccountService.divisor);

    this.transformAmount();
  }

  selectFromBook() {
    this.accountTo = this.accountToBook;
    this.accountToName = this.addressBookService.getAccountName(this.accountTo) || '';

    if (this.accountToName !== '') {
      this.accountToName += ' - ';
    }
  }

  resetFields() {
    this.amount = null;
    this.amountFiat = null;
    this.accountTo = '';
    this.accountToBook = '';
    this.accountToName = '';
    this.memo = '';
    this.alreadySending = false;
  }
}
