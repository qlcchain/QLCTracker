import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BigNumber } from 'bignumber.js';
import { BehaviorSubject, timer } from 'rxjs';
import { AddressBookService } from '../../services/address-book.service';
import { ApiService } from '../../services/api.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { NotificationService } from '../../services/notification.service';
import { PriceService } from '../../services/price.service';
import { QLCBlockService } from '../../services/qlc-block.service';
import { UtilService } from '../../services/util.service';
import { WalletService } from '../../services/wallet.service';
import { WorkPoolService } from '../../services/work-pool.service';
import { NodeService } from '../../services/node.service';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';

@Component({
	selector: 'app-sendneo',
	templateUrl: './sendneo.component.html',
	styleUrls: ['./sendneo.component.scss']
})
export class SendneoComponent implements OnInit {
	qlc = 100000000;

	activePanel = 'send';

  neowallets = this.walletService.wallet.neowallets;
  selectedWallet = {
    id: '',
    balances: []
  };
	accountTokens: any = [];
	selectedToken: any = [];
	selectedTokenSymbol = '';
	addressBookResults$ = new BehaviorSubject([]);
	showAddressBook = false;
	addressBookMatch = '';

	newHashId = '';

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
	msg13 = '';

	amounts = [
		{ name: 'QLC', shortName: 'QLC', value: 'QLC' },
		{ name: 'kqlc (0.001 QLC)', shortName: 'kqlc', value: 'kqlc' },
		{ name: 'qlc (0.000001 QLC)', shortName: 'qlc', value: 'qlc' }
	];

	selectedAmount = this.amounts[0];

	amount = null;
	amountRaw = new BigNumber(0);
	amountFiat: number | null = null;
	rawAmount: BigNumber = new BigNumber(0);
	fromAccount: any = {};
	fromAccountID: any = '';
	fromAddressBook = '';
	// toAccount: any = false;
	toAccountID = '';
	bookContact = '';
	toAddressBook = '';
	toAccountStatus = null;
  confirmingTransaction = false;
  
  reloadTimer = null;

	constructor(
		private router: ActivatedRoute,
		private walletService: WalletService,
		private addressBookService: AddressBookService,
		private notificationService: NotificationService,
		private api: ApiService,
		private qlcBlock: QLCBlockService,
		public price: PriceService,
		private workPool: WorkPoolService,
		public settings: AppSettingsService,
		private util: UtilService,
		private trans: TranslateService,
		private node: NodeService,
    private neoService: NeoWalletService
	) {
		this.loadLang();
		this.load();
  }
  ngOnDestroy() {
		if (this.reloadTimer) {
			this.reloadTimer.unsubscribe();
		}
	}
	load() {
    console.log('send');
		if (this.node.status === true) {
			if (this.neowallets !== undefined && this.neowallets.length > 0) {
				this.searchAddressBook();
			}
		} else {
			this.reload();
		}
	}

	async reload() {
		const source = timer(200);
		this.reloadTimer = source.subscribe(async val => {
			this.load();
		});
	}
	loadLang() {
		this.trans.get('SEND_WARNINGS.msg1').subscribe((res: string) => {	this.msg1 = res; });
		this.trans.get('SEND_WARNINGS.msg2').subscribe((res: string) => {	this.msg2 = res; });
		this.trans.get('SEND_WARNINGS.msg3').subscribe((res: string) => {	this.msg3 = res; });
		this.trans.get('SEND_WARNINGS.msg4').subscribe((res: string) => {	this.msg4 = res; });
		this.trans.get('SEND_WARNINGS.msg5').subscribe((res: string) => {	this.msg5 = res; });
		this.trans.get('SEND_WARNINGS.msg6').subscribe((res: string) => {	this.msg6 = res; });
		this.trans.get('SEND_WARNINGS.msg7').subscribe((res: string) => {	this.msg7 = res; });
		this.trans.get('SEND_WARNINGS.msg8').subscribe((res: string) => {	this.msg8 = res; });
		this.trans.get('SEND_WARNINGS.msg9').subscribe((res: string) => {	this.msg9 = res; });
		this.trans.get('SEND_WARNINGS.msg10').subscribe((res: string) => {	this.msg10 = res; });
		this.trans.get('SEND_WARNINGS.msg11').subscribe((res: string) => {	this.msg11 = res; });
		this.trans.get('SEND_WARNINGS.msg12').subscribe((res: string) => {	this.msg12 = res; });
		this.trans.get('SEND_WARNINGS.msg13').subscribe((res: string) => {	this.msg13 = res; });
	}
	async loadBalances() {
		for (let i = 0; i < this.neowallets.length; i++) {
			this.neowallets[i].balances = [];
			this.neowallets[i].addressBookName = this.addressBookService.getAccountName(this.neowallets[i].id);
			const balance:any = await this.neoService.getBalance(this.neowallets[i].id);
			for (const asset of balance.assetSymbols) {
				this.neowallets[i].balances[asset] = new BigNumber(balance.assets[asset].balance).toFixed();
      }
			for (const token of balance.tokenSymbols) {
				let newTokenBalance = new BigNumber(balance.tokens[token]).toFixed();
				if (newTokenBalance == 'NaN')
					newTokenBalance = '0';
        this.neowallets[i].balances[token] = newTokenBalance;
			}
		}
		this.selectAccount();
	}

	async ngOnInit() {
		const params = this.router.snapshot.queryParams;
		const wallet = this.router.snapshot.params.wallet;
		if (params && params.amount) {
			this.amount = params.amount;
		}
		if (params && params.to) {
			this.toAccountID = params.to;
			this.validateDestination();
		}

		this.addressBookService.loadAddressBook();
		// Look for the first account that has a balance
		const accountIDWithBalance = this.neowallets.reduce((previous, current) => {
			if (previous) {
				return previous;
			}
			const tokens = current.balances;
			if (tokens) {
				const filter = tokens.filter(tokenMeta => {
					return tokenMeta.balance > 0;
				});

				if (filter && filter.length > 0) {
					return current.id;
				} else {
					return null;
				}
			} else {
				return null;
			}
		}, null);
		if (wallet !== undefined) {
			this.fromAccountID = wallet;
		} else if (accountIDWithBalance) {
			this.fromAccountID = accountIDWithBalance;
		} else {
			this.fromAccountID = this.neowallets.length ? this.neowallets[0].id : '';
		}
		this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadLang();
		});
		this.loadBalances();
	}

	// An update to the QLC amount, sync the fiat value
	syncFiatPrice() {
		const rawAmount = this.getAmountBaseValue(this.amount || 0).plus(this.amountRaw);
		if (rawAmount.lte(0)) {
			this.amountFiat = 0;
			return;
		}

		// This is getting hacky, but if their currency is bitcoin, use 6 decimals, if it is not, use 2
		const precision = this.settings.settings.displayCurrency === 'BTC' ? 1000000 : 100;

		// Determine fiat value of the amount
		const fiatAmount = this.util.qlc
			.rawToMqlc(rawAmount)
			.times(this.price.price.lastPrice)
			.times(precision)
			.div(precision)
			.toNumber();
		this.amountFiat = fiatAmount;
	}

	// An update to the fiat amount, sync the QLC value based on currently selected denomination
	syncQlcPrice() {
		const fiatAmount = this.amountFiat || 0;
		const rawAmount = this.util.qlc.mqlcToRaw(new BigNumber(fiatAmount).div(this.price.price.lastPrice));
		const qlcVal = this.util.qlc.rawToQlc(rawAmount);
		const qlcAmount = this.getAmountValueFromBase(this.util.qlc.qlcToRaw(qlcVal));

		this.amount = qlcAmount.toNumber();
	}

	searchAddressBook() {
		this.showAddressBook = true;
		const search = this.toAccountID || '';
		const addressBook = this.addressBookService.addressBook;

		const matches = addressBook.filter(a => a.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);

		this.addressBookResults$.next(matches);
	}

	selectBookEntry(account) {
		this.showAddressBook = false;
		this.toAccountID = account;
		this.searchAddressBook();
		this.validateDestination();
	}

	async validateDestination() {
		// The timeout is used to solve a bug where the results get hidden too fast and the click is never registered
		setTimeout(() => (this.showAddressBook = false), 400);

		// Remove spaces from the account id
		this.toAccountID = this.toAccountID.replace(/ /g, '');

		this.addressBookMatch = this.addressBookService.getAccountName(this.toAccountID);

		// const accountInfo = await this.walletService.walletApi.accountInfo(this.toAccountID);
		const accountInfo = await this.api.accountInfo(this.toAccountID);
		if (accountInfo.error) {
			if (accountInfo.error === this.msg1) {
				this.toAccountStatus = 1;
			} else {
				this.toAccountStatus = 0;
			}
		} else if (accountInfo.result && accountInfo.result.tokens) {
			this.toAccountStatus = 2;
		}
	}

	async sendTransaction() {
		/*const isValid = await this.api.validateAccountNumber(this.toAccountID);
		if (!isValid.result) {
			return this.notificationService.sendWarning(this.msg2);
		}*/
		if (!this.fromAccountID || !this.toAccountID) {
			return this.notificationService.sendWarning(this.msg3);
		}

		//const from = await this.api.accountInfoByToken(this.fromAccountID, this.selectedToken.type);
		// let to = await this.api.accountInfoByToken(this.toAccountID, this.selectedToken.token_hash);
		//if (!from) {
		//	return this.notificationService.sendError(this.msg4);
		//}
		if (this.fromAccountID === this.toAccountID) {
			return this.notificationService.sendWarning(this.msg5);
		}

		//from.balanceBN = new BigNumber(from.balance || 0);
		// to.balanceBN = new BigNumber(to.balance || 0);
		//this.fromAccount = from;
		// this.toAccount = to;

		// to be transfered amount
		const rawAmount = this.getAmountBaseValue(this.amount || 0);
		this.rawAmount = rawAmount.plus(this.amountRaw);

		const qlcAmount = this.rawAmount.div(this.qlc);

		/*if (from.balanceBN.minus(rawAmount).isLessThan(0)) {
			return this.notificationService.sendError(this.msg8 + `${this.selectedToken.tokenInfo.tokenName}`);
		}*/

		// Determine a proper raw amount to show in the UI, if a decimal was entered
		//this.amountRaw = this.rawAmount.mod(this.qlc);

		// Determine fiat value of the amount
		/*this.amountFiat = this.util.qlc
			.rawToMqlc(rawAmount)
			.times(this.price.price.lastPrice)
			.toNumber();*/

		// Start precopmuting the work...
		this.fromAddressBook = this.addressBookService.getAccountName(this.fromAccountID);
		this.toAddressBook = this.addressBookService.getAccountName(this.toAccountID);
		//this.workPool.addWorkToCache(this.fromAccount.header);
		this.activePanel = 'confirm';
	}

	async confirmTransaction() {
		
		if (this.walletService.walletIsLocked()) {
			return this.notificationService.sendWarning(this.msg10);
		}

		this.confirmingTransaction = true;

		try {
			const newHash = await this.neoService.send(
				this.fromAccountID,
				this.toAccountID,
				this.selectedToken.tokenSymbol,
				this.amount
			);
			//console.log('hash >>>> ');
			//console.log(newHash);
			if (newHash) {
				this.newHashId = newHash.txid;
				this.activePanel = 'success';
				this.notificationService.sendSuccess(this.msg11 + ` ${this.amount} ${this.selectedToken.tokenSymbol}!`);
				this.amount = null;
				this.amountFiat = null;
				this.resetRaw();
				this.toAccountID = '';
				this.toAccountStatus = null;
				this.fromAddressBook = '';
				this.toAddressBook = '';
				this.addressBookMatch = '';
			} 
			
		} catch (err) {
			const errMessage = this.msg13 + ` ${err.message}`;
			this.notificationService.sendError(errMessage);
		}

		this.confirmingTransaction = false;

		await this.walletService.reloadBalances();
	}

	setMaxAmount() {
		const walletAccount = this.walletService.wallet.neowallets.find(a => a.id === this.fromAccountID);
		if (!walletAccount) {
			return;
		}
		const maxAmount = this.selectedToken.balance;
		this.amount = maxAmount;
		//this.syncFiatPrice();
	}

	resetRaw() {
		this.amountRaw = new BigNumber(0);
		this.amount = '';
	}

	selectToken() {
		if (this.accountTokens !== undefined && this.accountTokens.length > 0) {
			this.selectedToken = this.accountTokens.find(a => a.tokenSymbol === this.selectedTokenSymbol);
		} else {
			this.selectedToken = '';
		}
		this.resetRaw();
  }
  tokenBalance(token) {
    //console.log(token + this.selectedWallet.balances.length);
    if (this.selectedWallet !== undefined && this.selectedWallet.balances) {
      if (this.selectedWallet.balances[token])
        return this.selectedWallet.balances[token];
      else
        return 0.00;
		} else {
			return 0.00;
		}
  }
  selectTokenIcon(token) {
		if (this.accountTokens !== undefined && this.accountTokens.length > 0) {
      console.log('selected token icon' + token);
      const selectedToken = this.accountTokens.find(a => a.tokenSymbol === token);
      if (selectedToken) {
        this.selectedTokenSymbol = token;
        this.selectedToken = selectedToken;
      }
		} 
		this.resetRaw();
	}

	async selectAccount() {
    const selectedWallet = this.neowallets.find(a => a.id === this.fromAccountID);
    this.selectedWallet = selectedWallet;
    this.accountTokens = [];
    const balance:any = await this.neoService.getBalance(this.selectedWallet.id);
    for (const token of balance.tokenSymbols) {
      let newTokenBalance = new BigNumber(balance.tokens[token]).toFixed();
      if (newTokenBalance == 'NaN')
        newTokenBalance = '0';
      this.selectedWallet.balances[token] = newTokenBalance;
      let tokenSymbol = token;
      if (tokenSymbol === 'QLINK TOKEN') {
        tokenSymbol = 'QLC';
      }
      this.accountTokens.push({ tokenSymbol: tokenSymbol, balance: newTokenBalance });
    }
    for (const token of balance.assetSymbols) {
      let newTokenBalance = new BigNumber(balance.assets[token].balance).toFixed();
      if (newTokenBalance == 'NaN')
        newTokenBalance = '0';
      this.selectedWallet.balances[token] = newTokenBalance;
      const tokenSymbol = token;
      this.accountTokens.push({ tokenSymbol: tokenSymbol, balance: newTokenBalance });
    }
		this.selectedToken = this.accountTokens !== undefined && this.accountTokens.length > 0 ? this.accountTokens[0] : [];
		this.selectedTokenSymbol =
			this.selectedToken !== undefined && this.selectedToken.tokenSymbol !== undefined
				? this.selectedToken.tokenSymbol
				: '';

		this.resetRaw();
	}

	selectFromBook() {
		this.toAccountID = this.bookContact;
	}

	getAmountBaseValue(value) {
		switch (this.selectedAmount.value) {
			default:
			case 'QLC':
				return this.util.qlc.qlcToRaw(value);
			case 'kqlc':
				return this.util.qlc.kqlcToRaw(value);
			case 'mqlc':
				return this.util.qlc.mqlcToRaw(value);
		}
	}

	getAmountValueFromBase(value) {
		switch (this.selectedAmount.value) {
			default:
			case 'QLC':
				return this.util.qlc.rawToQlc(value);
			case 'kqlc':
				return this.util.qlc.rawToKqlc(value);
			case 'mqlc':
				return this.util.qlc.rawToMqlc(value);
		}
	}

	checkAmount() {
		if (this.amount < 0)
			this.amount = 0;

		if (Number(this.amount) > Number(this.selectedToken.balance))
			this.amount = Number(this.selectedToken.balance);
		
		this.rawAmount = new BigNumber(this.amount);
	}
}
