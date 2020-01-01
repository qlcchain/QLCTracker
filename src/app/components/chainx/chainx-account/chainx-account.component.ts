import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { combineLatest, Subscription } from 'rxjs';
import { AddressBookService } from '../../../services/address-book.service';
import { ChainxAccountService } from '../../../services/chainx-account.service';
import { NotificationService } from '../../../services/notification.service';
import { WalletService } from '../../../services/wallet.service';
import BigNumber from 'bignumber.js';

export interface IItems {
  number: number;
  index: number;
  hash: string;
  signed: string;
  signature: string;
  account_index: number;
  era: string;
  module: string;
  call: string;
  help: string;
  args: any[];
  data: string;
  version: number;
  acceleration: 1;
  time: number;
  status: string;
}

export interface ITransactions {
  items: object;
  page: number;
  pageSize: number;
  total: number;
}

@Component({
  selector: 'app-chainx-account',
  templateUrl: './chainx-account.component.html',
  styleUrls: ['./chainx-account.component.scss']
})
export class ChainxAccountComponent implements OnInit {
  account = {
    id: '',
    addressBookName: null,
    balances: null,
    mnemonic: null,
    wif: null
  };
  addressBookNameTemp = '';
  showEditName = false;
  modalRef: BsModalRef;
  recoverMnemonicText = 'Recover mnemonic phrase';
  recoverPrivateKeyText = 'Recover private key';
  recoveredMnemonic = null;
  recoveredPrivateKey = null;
  subscriptions: Subscription[] = [];
  loading = true;
  transactions;
  transfers;
  publicKey: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private changeDetection: ChangeDetectorRef,
    private modalService: BsModalService,
    private addressBookService: AddressBookService,
    private notificationService: NotificationService,
    private walletService: WalletService,
    public chainxAccountService: ChainxAccountService,
  ) {
  }

  ngOnInit() {
    this.publicKey = this.chainxAccountService.getPublicKey(this.route.snapshot.params.address).replace('0x', '');
    // this.publicKey = '9614fd65f80d0e6da07573618e224e495d135ee5b0eebd4e5d4529819e55c050';
    this.loadAccount();
    this.getTransactions();
  }

  async loadAccount() {
    const account = this.walletService.wallet.chainxAccounts.find(a => a.id === this.route.snapshot.params.address);

    if (account === undefined) {
      return this.router.navigate(['/wallets/']);
    }

    this.account = account;
    const assets = await this.chainxAccountService.getAssetsByAccount(this.account.id);

    for (const asset of assets.data) {
      this.account.balances = asset.details;
      this.account.balances.TotalBalance = (Object.values(asset.details).reduce(
        (prev: BigNumber, current: any) => prev.plus(new BigNumber(current)),
        new BigNumber(0)
      ));
    }

    this.loading = false;
  }

  async getTransactions(pageSize = 10) {
    this.transactions = await this.chainxAccountService.get(`/account/${this.publicKey}/txs?page=0&page_size=${pageSize}`);
    this.transfers = await this.chainxAccountService.get(`/account/${this.publicKey}/transfers?page=0&page_size=${pageSize}`);

    //console.log(this.transactions.items);
    //console.log(this.transfers.items);
  }

  editName() {
    this.showEditName = true;
    this.addressBookNameTemp = this.account.addressBookName;
  }

  async editNameSave() {
    const addressBookName = this.account.addressBookName.trim();
    if (!addressBookName) {
      this.addressBookService.deleteAddress(this.account.id);
      this.notificationService.sendSuccess('Account name successfully deleted.');
      this.showEditName = false;

      return;
    }

    try {
      await this.addressBookService.saveAddress(this.account.id, addressBookName);
    } catch (err) {
      this.notificationService.sendError(err.message);

      return;
    }

    this.notificationService.sendSuccess('Account name successfully updated');
    this.showEditName = false;
  }

  editNameCancel() {
    this.showEditName = false;
    this.account.addressBookName = this.addressBookNameTemp;
  }

  deleteWallet() {
    const existingAccountIndex = this.walletService.wallet.chainxAccounts.findIndex(a => a.id === this.account.id);

    if (existingAccountIndex === -1) {
      return;
    }

    this.walletService.wallet.chainxAccounts.splice(existingAccountIndex, 1);

    this.walletService.saveWalletExport();
    this.router.navigate(['/wallets/']);
  }

  openModal(template: TemplateRef<any>) {
    combineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());
    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.recoveredPrivateKey = '';
        this.recoverPrivateKeyText = 'Recover private key';
        this.recoveredMnemonic = '';
        this.recoverMnemonicText = 'Recover mnemonic phrase';
      })
    );

    this.modalRef = this.modalService.show(template);
  }

  async recoverMnemonic(template) {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    this.recoverMnemonicText = 'Preparing, please wait.';
    this.recoveredMnemonic = this.chainxAccountService.decrypt(this.account.wif);
    this.openModal(template);
  }

  async recoverPrivateKey(template) {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    this.recoverPrivateKeyText = 'Preparing, please wait.';

    let privateKey = this.chainxAccountService.decrypt(this.account.wif);

    if (this.account.mnemonic) {
      privateKey = (this.chainxAccountService.account(privateKey)).privateKey();
    }

    this.recoveredPrivateKey = privateKey;
    this.openModal(template);
  }
}
