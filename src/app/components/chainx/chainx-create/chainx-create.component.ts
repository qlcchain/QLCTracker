import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ChainxAccountService } from 'src/app/services/chainx-account.service';
import { Router } from '@angular/router';
import { AddressBookService } from '../../../services/address-book.service';

@Component({
  selector: 'app-chainx-create',
  templateUrl: './chainx-create.component.html',
  styleUrls: ['./chainx-create.component.scss']
})
export class ChainxCreateComponent implements OnInit {
  activePanel = 0;
  selectedImportOption = 'new';
  accountName = '';
  alreadyImporting = false;
  newAccountMnemonic = null;
  newAccountPrivateKey = null;
  newAccount = null;
  importPrivateKey = '';
  importMnemonic = '';

  constructor(
    private router: Router,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private chainxAccountService: ChainxAccountService,
    private addressBookService: AddressBookService
  ) {
  }

  ngOnInit() {
  }

  async createAccount() {
    if (this.walletService.isLocked()) {
      return this.notificationService.sendError('Wallet must be unlocked.');
    }

    this.accountName = this.accountName.trim();

    if (this.accountName.length > 0 && this.addressBookService.nameExists(this.accountName)) {
      return this.notificationService.sendInfo('Account name already exists, choose another one.');
    }

    this.activePanel = 1;
    this.notificationService.sendInfo('Creating wallet, please wait.');
    this.alreadyImporting = true;

    const account = await this.chainxAccountService.createAccount(null, this.accountName);
    const wif = this.chainxAccountService.decrypt(account.wif);

    this.newAccountMnemonic = wif;
    this.newAccountPrivateKey = (this.chainxAccountService.account(wif)).privateKey();

    this.newAccount = account;
    this.notificationService.sendSuccess('Wallet created. Please save your mnemonic phrase and private key in a safe space.');
    this.alreadyImporting = false;
  }

  confirmNewAccount() {
    const address = this.newAccount.id;
    this.newAccount = null;
    this.newAccountMnemonic = '';
    this.newAccountPrivateKey = '';

    this.router.navigate([`wallets/chainx/account/${address}`]);
  }

  async importFromPrivateKey() {
    if (this.walletService.isLocked()) {
      return this.notificationService.sendError('Wallet must be unlocked.');
    }

    this.alreadyImporting = true;
    this.importPrivateKey = this.importPrivateKey.trim();

    if (this.importPrivateKey.length === 0) {
      return this.notificationService.sendInfo('Insert your private key.');
    }

    this.notificationService.sendInfo('Importing wallet, please wait.');

    const privateKey = this.importPrivateKey;

    if (!await this.chainxAccountService.checkPrivateKey(privateKey)) {
      this.alreadyImporting = false;

      return this.notificationService.sendWarning('Invalid private key or account already exists.');
    }

    const account = await this.chainxAccountService.createAccount(privateKey);

    this.importPrivateKey = '';
    this.notificationService.sendSuccess('Wallet was imported.');
    this.alreadyImporting = false;

    this.router.navigate(['wallets/chainx/account/' + account.id]);
  }

  async importFromMnemonic() {
    if (this.walletService.isLocked()) {
      return this.notificationService.sendError('Wallet must be unlocked.');
    }

    this.alreadyImporting = true;
    this.importMnemonic = this.importMnemonic.trim();

    if (this.importMnemonic.length === 0) {
      this.alreadyImporting = false;

      return this.notificationService.sendInfo('Insert your mnemonic phrase.');
    }

    this.notificationService.sendInfo('Importing wallet, please wait.');

    const mnemonic = this.importMnemonic;

    if (!await this.chainxAccountService.checkMnemonic(mnemonic)) {
      this.alreadyImporting = false;

      return this.notificationService.sendWarning('Invalid mnemonic phrase or account already exists.');
    }

    const account = await this.chainxAccountService.createAccount(mnemonic);

    this.importMnemonic = '';
    this.notificationService.sendSuccess('Wallet was imported.');
    this.alreadyImporting = false;

    this.router.navigate(['wallets/chainx/account/' + account.id]);
  }
}
