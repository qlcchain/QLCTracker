import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { AddressBookService } from '../../services/address-book.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import BigNumber from 'bignumber.js';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalUnlockComponent } from '../modal-unlock/modal-unlock.component';
import { ChainxAccountService } from '../../services/chainx-account.service';
import { EtherWalletService } from 'src/app/services/ether-wallet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-myaccounts',
  templateUrl: './myaccounts.component.html',
  styleUrls: ['./myaccounts.component.scss']
})
export class MyaccountsComponent implements OnInit {
  accounts = this.walletService.wallet.accounts;
  neowallets = this.walletService.wallet.neowallets;
  chainxAccounts = this.walletService.wallet.chainxAccounts;
  wallet = this.walletService.wallet;
  loading = true;
  isLedgerWallet = this.walletService.isLedgerWallet();
  activeSlideIndex = 0;

  pendingBlocks = [];
  successfulBlocks = [];
  processingPending = false;

  modalRef: BsModalRef;

  msg1 = '';
  msg2 = '';
  msg3 = '';
  msg4 = '';
  msg5 = '';
  msg6 = '';
  msg7 = '';
  msg8 = '';
  msg9 = '';
  msg10 = '';
  msg11 = '';
  msg12 = '';
  msgEdit1 = '';
  msgEdit2 = '';

  msgLocked = '';

	desktop = false;

  constructor(
    private walletService: WalletService,
    private chainxAccountService: ChainxAccountService,
    public neoService: NeoWalletService,
    private api: ApiService,
    private notificationService: NotificationService,
    private addressBook: AddressBookService,
    public settings: AppSettingsService,
    private trans: TranslateService,
    private modalService: BsModalService,
    public etherService: EtherWalletService
  ) {
    this.loadLang();
		if (environment.desktop) {
			this.desktop = true;
		}
  }

  async ngOnInit() {
    this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadLang();
    });
    this.loadBalances();
  }

  loadLang() {
    this.trans.get('ACCOUNTS_WARNINGS.msg1').subscribe((res: string) => {	this.msg1 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg2').subscribe((res: string) => {	this.msg2 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg3').subscribe((res: string) => {	this.msg3 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg4').subscribe((res: string) => {	this.msg4 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg5').subscribe((res: string) => {	this.msg5 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg6').subscribe((res: string) => {	this.msg6 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg7').subscribe((res: string) => {	this.msg7 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg8').subscribe((res: string) => {	this.msg8 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg9').subscribe((res: string) => {	this.msg9 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg10').subscribe((res: string) => {	this.msg10 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg11').subscribe((res: string) => {	this.msg11 = res; });
    this.trans.get('ACCOUNTS_WARNINGS.msg12').subscribe((res: string) => {	this.msg12 = res; });
    this.trans.get('ACCOUNT_DETAILS_WARNINGS.msg5').subscribe((res: string) => {	this.msgEdit1 = res; });
    this.trans.get('ACCOUNT_DETAILS_WARNINGS.msg6').subscribe((res: string) => {	this.msgEdit2 = res; });
    this.trans.get('RECEIVE_WARNINGS.msg2').subscribe((res: string) => {	this.msgLocked = res; });
  }

  async loadBalances() {
    await this.walletService.loadTokens();

    /*const tokenMap = {};
    const tokens = await this.api.tokens();
    if (!tokens.error) {
      tokens.result.forEach(token => {
        tokenMap[token.tokenId] = token;
      });
    }*/
    for (let i = 0; i < this.accounts.length; i++) {
      const am = await this.api.accountInfo(this.accounts[i].id);
      if (!am.error) {
        let accountMeta = [];
        let otherTokens = [];
        if (am.result.tokens && Array.isArray(am.result.tokens)) {
          am.result.tokens.forEach(token => {
            accountMeta[token.tokenName] = token;
            if (this.walletService.tokenMap.hasOwnProperty(token.type)) {
              token.tokenInfo = this.walletService.tokenMap[token.type];
              if (token.tokenInfo?.tokenSymbol != 'QLC' && token.tokenInfo?.tokenSymbol != 'QGAS') {
                otherTokens.push(token);
              }
            }
          });
        }
        this.accounts[i].balances = accountMeta;
        this.accounts[i].otherTokens = otherTokens;
      }
      /*const pending = await this.api.accountsPending([this.accounts[i].id]);
      let pendingCount = 0;
      const pendingResult = pending.result;
      for (const account in pendingResult) {
        if (!pendingResult.hasOwnProperty(account)) {
          continue;
        }
        pendingCount += pendingResult[account].length;
      }
      this.accounts[i].pendingCount = pendingCount;*/
      
    }
    this.walletService.loadPending();
    // console.log(this.accounts);
    for (let i = 0; i < this.neowallets.length; i++) {
      this.neowallets[i].balances = [];
      this.neowallets[i].addressBookName = this.addressBook.getAccountName(this.neowallets[i].id);

      const balance: any = await this.neoService.getNeoScanBalance(this.neowallets[i].id);
      for (const asset of balance) {
        this.neowallets[i].balances[asset.asset_hash] = {
          amount: new BigNumber(asset.amount).toFixed(),
          asset: asset.asset,
          asset_symbol: asset.asset_symbol
        }
      }

    }

    for (const chainxAccount of this.chainxAccounts) {
      chainxAccount.balances = null;

      const assets = await this.chainxAccountService.getAssetsByAccount(chainxAccount.id);

      for (const asset of assets.data) {
        chainxAccount.balances = asset.details;
      }
    }

    this.loading = false
  }

  async createAccount() {
    if (this.walletService.isLocked()) {
      return this.notificationService.sendError(this.msg1);
    }
    if (!this.walletService.isConfigured()) {
      return this.notificationService.sendError(this.msg2);
    }
    if (this.walletService.wallet.accounts.length >= 20) {
      return this.notificationService.sendWarning(this.msg3);
    }
    try {
      const newAccount = await this.walletService.addWalletAccount();
      this.notificationService.sendSuccess(this.msg4 + ` ${newAccount.id}`);
    } catch (err) {
    }
  }

  copied() {
    this.notificationService.sendSuccess(this.msg5);
  }

  async deleteAccount(account) {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning(this.msg6);
    }
    try {
      await this.walletService.removeWalletAccount(account.id);
      this.notificationService.sendSuccess(this.msg7 + ` ${account.id}`);
    } catch (err) {
      this.notificationService.sendError(this.msg8 + ` ${err.message}`);
    }
  }

  editName(account) {
    account.editName = true;
    account.tempBookName = account.addressBookName;
  }

  editNameCancel(account) {
    account.editName = false;
    account.addressBookName = account.tempBookName;
    account.tempBookName = '';
  }

  async editNameSave(account) {
    const addressBookName = account.addressBookName.trim();
    if (!addressBookName) {
      this.addressBook.deleteAddress(account.id);
      this.notificationService.sendSuccess(this.msgEdit1);
      account.editName = false;
      return;
    }

    try {
      await this.addressBook.saveAddress(account.id, addressBookName);
    } catch (err) {
      this.notificationService.sendError(err.message);
      return;
    }

    this.notificationService.sendSuccess(this.msgEdit2);
    account.editName = false;
  }

  async receive(account) {
    if (this.walletService.walletIsLocked()) {
      this.modalRef = this.modalService.show(ModalUnlockComponent, { class: 'modal-lg' });
    }
  }

}
