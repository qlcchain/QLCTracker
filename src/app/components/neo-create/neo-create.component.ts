import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AddressBookService } from 'src/app/services/address-book.service';
import { ApiService } from 'src/app/services/api.service';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-neo-create',
  templateUrl: './neo-create.component.html',
  styleUrls: ['./neo-create.component.scss']
})
export class NeoCreateComponent implements OnInit {
  wallet = this.walletService.wallet;
  activePanel = 0;
  
  walletNameModel = '';
  importPrivateKeyModel = '';
  importEncryptedKeyModel = '';
  importEncryptedKeyPasswordModel = '';
  walletPasswordModel = '';
  walletPasswordConfirmModel = '';
  agree = false;
  newWalletPrivateKey = '';
  newWalletEncryptedKey = '';
  newWallet = null;

  alreadyImporting = false;
  
  selectedImportOption = 'new';
  importOptions = [
    { name: 'new', value: 'new' },
    { name: 'private', value: 'private' },
    { name: 'encrypted', value: 'encrypted' }
  ];
  
  constructor(
    private walletService: WalletService,
    private api: ApiService,
    private notifications: NotificationService,
    private addressBook: AddressBookService,
    private neoWallet: NeoWalletService,
		private router: Router
  ) { 
    
  }
  //
  ngOnInit() {
  }

  async importFromPrivateKey() {
    if (this.walletService.isLocked()){
      this.notifications.sendError('Wallet must be unlocked.');
      return;
    }
    this.notifications.sendInfo('Importing wallet, please wait.');
    this.alreadyImporting = true;
    const wip = this.importPrivateKeyModel;
    
    if (!await this.neoWallet.checkPrivateKey(wip)){
      this.notifications.sendError('Please enter a valid private key.');
      return;
    }
    const account = await this.neoWallet.createWallet(wip);
    this.importPrivateKeyModel = '';
    this.notifications.sendSuccess('Wallet was imported.');
    this.alreadyImporting = false;
    this.router.navigate(['myneowallet/'+account.id]);
  }

  async importFromEncryptedKey() {
    if (this.walletService.isLocked()){
      this.notifications.sendError('Wallet must be unlocked.');
      return;
    }
    this.notifications.sendInfo('Importing wallet, please wait.');
    this.alreadyImporting = true;
    
    const wip = await this.neoWallet.decrypt(this.importEncryptedKeyModel,this.importEncryptedKeyPasswordModel);
    if (!this.neoWallet.checkPrivateKey(wip)){
      this.notifications.sendError('Please enter a valid private key.');
      return;
    }
    const account = await this.neoWallet.createWallet(wip);
    this.importEncryptedKeyModel = '';
    this.importEncryptedKeyPasswordModel = '';
    this.notifications.sendSuccess('Wallet was imported.');
    this.alreadyImporting = false;
    this.router.navigate(['myneowallet/'+account.id]);
  }

  async createWallet() {
    if (this.walletService.isLocked()){
      this.notifications.sendError('Wallet must be unlocked.',);
      return;
    }
    this.activePanel = 1;
    this.notifications.sendInfo('Creating wallet, please wait.');
    this.alreadyImporting = true;
    const account = await this.neoWallet.createWallet('new',this.walletNameModel.trim());
    this.newWalletEncryptedKey = account.encryptedwif;

    const wif = await this.neoWallet.decrypt(account.encryptedwif,this.wallet.password);
    if (wif != false) {
      this.newWalletPrivateKey = wif;
      this.newWallet = account;
      this.notifications.sendSuccess('Wallet created. Please save your key in a safe space.');
      this.alreadyImporting = false;
    } else {
      this.newWalletPrivateKey = 'ERROR - Please don\'t use this wallet. There was an encryption error.';
      this.newWalletEncryptedKey = 'ERROR - Please don\'t use this wallet. There was an encryption error.';
    }
    
  }

  confirmNewWallet() {
    const address = this.newWallet.id;
    this.newWallet = null;
    this.newWalletEncryptedKey = '';
    this.newWalletPrivateKey = '';

    this.router.navigate(['myneowallet/'+address]);
  }
  
}
  