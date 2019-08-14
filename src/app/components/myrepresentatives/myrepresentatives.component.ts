import { Component, OnInit, ViewChild } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { ApiService } from '../../services/api.service';
import BigNumber from 'bignumber.js';
import { UtilService } from '../../services/util.service';
import { RepresentativeService } from '../../services/representative.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { QLCBlockService } from '../../services/qlc-block.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-myrepresentatives',
  templateUrl: './myrepresentatives.component.html',
  styleUrls: ['./myrepresentatives.component.scss']
})
export class MyrepresentativesComponent implements OnInit {
  @ViewChild('repInput', { static: true }) repInput;

  accounts = this.walletService.wallet.accounts;
	wallet = this.walletService.wallet;

	changeAccountID: any = null;
	toRepresentativeID = '';
	representativeSelect = '';

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

  representativeResults$ = new BehaviorSubject([]);
	showRepresentatives = false;
	representativeListMatch = '';

	representativeOverview = [];
	changingRepresentatives = false;

	selectedAccounts = [];
	fullAccounts = [];
  
  constructor(
		public walletService: WalletService,
		private api: ApiService,
		private notifications: NotificationService,
		private qlcBlock: QLCBlockService,
		private util: UtilService,
		private representativeService: RepresentativeService,
		public settings: AppSettingsService,
		private trans: TranslateService,
    private logger: NGXLogger
  ) { }

  async ngOnInit() {
		this.representativeService.loadRepresentativeList();
		await this.loadRepresentativeOverview();
		this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadLang();
    });
    this.searchRepresentatives();
		this.loadLang();
  }
  
  loadLang() {
		this.trans.get('REPS_WARNINGS.msg1').subscribe((res: string) => {	this.msg1 = res; });
		this.trans.get('REPS_WARNINGS.msg2').subscribe((res: string) => {	this.msg2 = res; });
		this.trans.get('REPS_WARNINGS.msg3').subscribe((res: string) => {	this.msg3 = res; });
		this.trans.get('REPS_WARNINGS.msg4').subscribe((res: string) => {	this.msg4 = res; });
		this.trans.get('REPS_WARNINGS.msg5').subscribe((res: string) => {	this.msg5 = res; });
		this.trans.get('REPS_WARNINGS.msg6').subscribe((res: string) => {	this.msg6 = res; });
		this.trans.get('REPS_WARNINGS.msg7').subscribe((res: string) => {	this.msg7 = res; });
		this.trans.get('REPS_WARNINGS.msg8').subscribe((res: string) => {	this.msg8 = res; });
		this.trans.get('REPS_WARNINGS.msg9').subscribe((res: string) => {	this.msg9 = res; });
		this.trans.get('REPS_WARNINGS.msg10').subscribe((res: string) => {	this.msg10 = res; });
	}
  async loadRepresentativeOverview() {
		const onlineReps = await this.getOnlineRepresentatives();
		// TODO: Handling for unopened accounts?

		const walletAccountInfos = await this.getWalletAccountDetails();
		this.fullAccounts = walletAccountInfos;

		// Get a unique list of representatives for our accounts
		const uniqueRepresentatives = this.getAccountRepresentatives(walletAccountInfos);

		// Get full info about each representative
		const representativesDetails = await this.getRepresentativesDetails(uniqueRepresentatives);

		// Build up the overview object for each representative
		const totalSupply = new BigNumber(60000000000000000);
		let representativesOverview = [];

		for (const representative of representativesDetails) {
			const repOnline = onlineReps.indexOf(representative.account) !== -1;
			const knownRep = this.representativeService.getRepresentative(representative.account);

			const qlcWeight = this.util.qlc.rawToQlc(representative.weight || 0);
			const percent = qlcWeight.div(totalSupply).times(100);

			// Determine the status based on some factors
			let status = 'none';
			if (knownRep && knownRep.trusted) {
				status = 'trusted'; // In our list and marked as trusted
			} else if (knownRep && knownRep.warn) {
				status = 'alert'; // In our list and marked for avoidance
			} else if (percent.gte(10)) {
				status = 'alert'; // Has extremely high voting weight
			} else if (percent.gte(1)) {
				status = 'warn'; // Has high voting weight
			} else if (knownRep) {
				status = 'known'; // In our list
			}

			const repOverview = {
				id: representative.account,
				weight: qlcWeight,
				delegatedWeight: representative.delegatedWeight,
				percent: percent,
				status: status,
				label: knownRep ? knownRep.name : null,
				online: repOnline,
				accounts: representative.accounts
			};

			representativesOverview.push(repOverview);
		}

		// Sort by weight delegated
		representativesOverview = representativesOverview.sort((a, b) => b.delegatedWeight - a.delegatedWeight);

		this.representativeOverview = representativesOverview;
	}

	async getWalletAccountDetails(): Promise<any> {
		// Run an accountInfo call for each account in the wallet to get their representatives
		const walletAccountInfos = await Promise.all(
			this.accounts.map(account =>
				this.api.accountInfo(account.id).then(res => {
					if (res.result) {
						const result = res.result;
						result.id = account.id;
						result.addressBookName = account.addressBookName;
						const tokenMetas = result.tokens;
						const qlcTokenMeta = tokenMetas.filter(tm => tm.type === this.api.qlcTokenHash)[0];
						if (qlcTokenMeta !== undefined) {
							result.representative = qlcTokenMeta.rep || qlcTokenMeta.representative;
							result.balance = qlcTokenMeta.balance;
							this.logger.debug(`${account.id} resp: ${result.representative} balance: ${result.balance}`);
						} else {
							this.logger.debug(`${account.id} does not hold any QLC`);
						}
						return result;
					}
				})
			)
		);

		return walletAccountInfos;
	}

	async getRepresentativesDetails(representatives): Promise<any> {
		// Run an accountInfo call for each representative, carry on data.  The uglyness allows for them to run in parallel
		const repInfos = await Promise.all(
			representatives.map(rep =>
				this.api.accountInfo(rep.id).then(async res => {
					const result = res.result;
					result.account = rep.id;
					//result.delegatedWeight = rep.weight;
					const votingWeight = await this.api.accountVotingWeight(rep.id);
					result.delegatedWeight = votingWeight.result;
					result.accounts = rep.accounts;

					return result;
				})
			)
		);

		return repInfos;
	}

	// Make a unique list of representatives used in all accounts
	getAccountRepresentatives(walletAccountInfos) {
		const representatives = [];
		for (const accountInfo of walletAccountInfos) {
			if (!accountInfo || !accountInfo.representative) {
				continue;
			} // Account doesn't exist yet

			const existingRep = representatives.find(rep => rep.id === accountInfo.representative);
			if (existingRep) {
				existingRep.weight = existingRep.weight.plus(new BigNumber(accountInfo.coinBalance));
				existingRep.accounts.push(accountInfo);
			} else {
				const newRep = {
					id: accountInfo.representative,
					weight: new BigNumber(accountInfo.coinBalance),
					accounts: [accountInfo]
				};
				representatives.push(newRep);
			}
		}

		return representatives;
	}

	async getOnlineRepresentatives() {
		const representatives = [];
		const reps = await this.api.onlineRepresentatives();
		if (reps.result) {
			for (const rep of reps.result) {
				representatives.push(rep);
			}
		}

		return representatives;
	}

	addSelectedAccounts(accounts) {
		for (const account of accounts) {
			this.newAccountID(account.id);
		}

		// Scroll to the representative input
		setTimeout(() => this.repInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
	}

	async newAccountID(accountID) {
		const newAccount = accountID || this.changeAccountID;
		if (!newAccount) {
			return; // Didn't select anything
		}

		const existingAccount = this.selectedAccounts.find(a => a.id === newAccount);
		if (existingAccount) {
			return; // Already selected
    }
    console.log(this.selectedAccounts);

    const allExists = this.selectedAccounts.find(a => a.id === 'All Accounts');
    console.log(allExists);
    console.log(this.accounts);
		if (newAccount === 'all') {
			this.selectedAccounts = []; // Reset the list before adding all
		}
		if (newAccount !== 'all' && allExists) {
			this.selectedAccounts.splice(this.selectedAccounts.indexOf(allExists), 1); // Remove all from the list
		}

		if (newAccount === 'all') {
			this.selectedAccounts.push({ id: 'All Accounts' });
		} else {
			const walletAccount = await this.walletService.getWalletAccount(newAccount);
			this.selectedAccounts.push(walletAccount);
		}

		setTimeout(() => (this.changeAccountID = null), 10);
	}

	removeSelectedAccount(account) {
		this.selectedAccounts.splice(this.selectedAccounts.indexOf(account), 1); // Remove all from the list
	}

	searchRepresentatives() {
		this.showRepresentatives = true;
		const search = this.toRepresentativeID || '';
		const representatives = this.representativeService.getSortedRepresentatives();

		const matches = representatives.filter(a => a.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);

		this.representativeResults$.next(matches);
	}

	selectRep() {
		this.selectRepresentative(this.representativeSelect);
	}

	selectRepresentative(rep) {
		this.showRepresentatives = false;
		this.toRepresentativeID = rep;
		this.searchRepresentatives();
		this.validateRepresentative();
	}

	validateRepresentative() {
		setTimeout(() => (this.showRepresentatives = false), 400);
		this.toRepresentativeID = this.toRepresentativeID.replace(/ /g, '');
		const rep = this.representativeService.getRepresentative(this.toRepresentativeID);

		if (rep) {
			this.representativeListMatch = rep.name;
		} else {
			this.representativeListMatch = '';
		}
	}

	async changeRepresentatives() {
		const accounts = this.selectedAccounts;
		const newRep = this.toRepresentativeID;

		if (this.changingRepresentatives) {
			return; // Already running
		}
		if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning(this.msg2);
		}
		if (!accounts || !accounts.length) {
			return this.notifications.sendWarning(this.msg3);
		}

		this.changingRepresentatives = true;

		const valid = await this.api.validateAccountNumber(newRep);
		if (!valid.result) {
			this.changingRepresentatives = false;
			return this.notifications.sendWarning(this.msg4);
		}

		const qlcTokenMeta = await this.api.accountInfoByToken(newRep);
		if (qlcTokenMeta === undefined || qlcTokenMeta == null) {
			this.changingRepresentatives = false;
			return this.notifications.sendWarning(this.msg5 + ` ${newRep} ` + this.msg6);
		}

		const allAccounts = accounts.find(a => a.id === 'All Accounts');
		const accountsToChange = allAccounts ? this.accounts : accounts;

		// Remove any that don't need their represetatives to be changed
		const accountsNeedingChange = accountsToChange.filter(account => {
			const accountInfo = this.fullAccounts.find(a => a.id === account.id);
			// token account exist and token account holder QLC
			if (accountInfo && accountInfo.representative) {
				return accountInfo.representative.toLowerCase() !== newRep.toLowerCase();
			}
			return false;
		});

		if (!accountsNeedingChange.length) {
			this.changingRepresentatives = false;
			return this.notifications.sendInfo(this.msg7);
		}

		// Now loop and change them
		for (const account of accountsNeedingChange) {
			const walletAccount = await this.walletService.getWalletAccount(account.id);
			if (!walletAccount) {
				continue; // Unable to find account in the wallet? wat?
			}

			try {
				const changed = await this.qlcBlock.generateChange(walletAccount, newRep, this.walletService.isLedgerWallet());
				if (!changed) {
					this.notifications.sendError(this.msg8 + ` ${account.id}` + this.msg9);
				}
			} catch (err) {
				this.notifications.sendError(err.message);
			}
		}

		// Good to go!
		this.selectedAccounts = [];
		this.toRepresentativeID = '';
		this.representativeListMatch = '';
		this.changingRepresentatives = false;

		this.notifications.sendSuccess(this.msg10);
		this.searchRepresentatives();
		await this.loadRepresentativeOverview();
	}
}
