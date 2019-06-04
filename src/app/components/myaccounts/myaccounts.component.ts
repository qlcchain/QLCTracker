import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { AddressBookService } from '../../services/address-book.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { QLCBlockService } from 'src/app/services/qlc-block.service';
import { UtilService } from 'src/app/services/util.service';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-myaccounts',
  templateUrl: './myaccounts.component.html',
  styleUrls: ['./myaccounts.component.scss']
})
export class MyaccountsComponent implements OnInit {
	accounts = this.walletService.wallet.accounts;
	neowallets = this.walletService.wallet.neowallets;
	wallet = this.walletService.wallet;
  isLedgerWallet = this.walletService.isLedgerWallet();
	activeSlideIndex = 0;
  
  pendingBlocks = [];
  successfulBlocks = [];
  processingPending = false;

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

	constructor(
		private walletService: WalletService,
		public neoService: NeoWalletService,
		private api: ApiService,
		private notificationService: NotificationService,
		private addressBook: AddressBookService,
		public settings: AppSettingsService,
		private trans: TranslateService,
		private qlcBlock: QLCBlockService,
    private util: UtilService
	) {
		this.loadLang();
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
		const tokenMap = {};
		const tokens = await this.api.tokens();
		if (!tokens.error) {
			tokens.result.forEach(token => {
				tokenMap[token.tokenId] = token;
			});
		}
		for (let i = 0; i < this.accounts.length; i++) {
			const am = await this.api.accountInfo(this.accounts[i].id);
			if (!am.error) {
				let accountMeta = [];
				let otherTokens = [];
        if (am.result.tokens && Array.isArray(am.result.tokens)) {
          am.result.tokens.forEach(token => {
						accountMeta[token.tokenName] = token;
						if (tokenMap.hasOwnProperty(token.type)) {
							token.tokenInfo = tokenMap[token.type];
						}
						if (token.tokenInfo.tokenSymbol != 'QLC' && token.tokenInfo.tokenSymbol != 'QGAS') {
							otherTokens.push(token);
						}
          });
        }
				this.accounts[i].balances = accountMeta;
				this.accounts[i].otherTokens = otherTokens;
      }
      const pending = await this.api.accountsPending([this.accounts[i].id]);
      let pendingCount = 0;
      const pendingResult = pending.result;
      for (const account in pendingResult) {
        if (!pendingResult.hasOwnProperty(account)) {
          continue;
        }
        pendingCount += pendingResult[account].length;
      }
      this.accounts[i].pendingCount = pendingCount;
			
		}
		for (let i = 0; i < this.neowallets.length; i++) {
			this.neowallets[i].balances = [];
			this.neowallets[i].addressBookName = this.addressBook.getAccountName(this.neowallets[i].id);

			const balance:any = await this.neoService.getNeoScanBalance(this.neowallets[i].id);
			for (const asset of balance) {
				this.neowallets[i].balances[asset.asset_hash] = { 
					amount : new BigNumber(asset.amount).toFixed(),
					asset: asset.asset,
					asset_symbol: asset.asset_symbol
				}
			}
			
		}
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
		} catch (err) {}
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
    await this.loadPending(account);
    this.processPendingBlocks();
  }

  async loadPending(account) {
    this.pendingBlocks = [];
    const accountPending = await this.api.accountsPending([account], 25);
		if (!accountPending.error && accountPending.result) {
			const pendingResult = accountPending.result;

			for (const account in pendingResult) {
				if (!pendingResult.hasOwnProperty(account)) {
					continue;
        }
        let walletAccount = this.wallet.accounts.find(a => a.id === account);
				walletAccount.pendingCount = pendingResult[account].length;
				pendingResult[account].forEach(pending => {
					this.pendingBlocks.push({
            account: pending.source,
            receiveAccount: account,
						amount: pending.amount,
						tokenName: pending.tokenName,
						timestamp: pending.timestamp,
						hash: pending.hash
					});
				});
			}
		}
  }

  async processPendingBlocks(tokenName = 'all') {
    if (this.walletService.walletIsLocked()) {
      this.notificationService.sendWarning(this.msgLocked);
      return;
		}
		if (this.processingPending || this.wallet.locked || !this.pendingBlocks.length) {
			return;
		}
    this.processingPending = true;

    const nextBlock = this.pendingBlocks[0];
		if (this.successfulBlocks.find(b => b.hash === nextBlock.hash)) {
			return setTimeout(() => this.processPendingBlocks(), 1500); // Block has already been processed
		}
		const walletAccount = await this.walletService.getWalletAccount(nextBlock.receiveAccount);
		if (!walletAccount) {
			return; // Dispose of the block, no matching account
		}

		let newHash = null;

		if (tokenName !== 'all') {
			if (nextBlock.tokenName == tokenName) {
        newHash = await this.qlcBlock.generateReceive(walletAccount, nextBlock.hash, this.walletService.isLedgerWallet());
        console.log(newHash);
			}
		} else {
      newHash = await this.qlcBlock.generateReceive(walletAccount, nextBlock.hash, this.walletService.isLedgerWallet());
		}
		if (newHash) {
			if (this.successfulBlocks.length >= 15) {
				this.successfulBlocks.shift();
			}
			this.successfulBlocks.push(nextBlock.hash);

			const receiveAmount = this.util.qlc.rawToQlc(nextBlock.amount);
			this.notificationService.sendSuccess(
				`Successfully received ${receiveAmount.isZero() ? '' : receiveAmount.toFixed(6)} ${nextBlock.tokenName}!`
			);
      await this.loadBalances();
			// await this.promiseSleep(500); // Give the node a chance to make sure its ready to reload all?
		} 

		this.pendingBlocks.shift(); // Remove it after processing, to prevent attempting to receive duplicated messages
		this.processingPending = false;

		setTimeout(() => this.processPendingBlocks(), 1500);
	}
}
