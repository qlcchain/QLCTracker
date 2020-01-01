import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
	selector: 'app-transactions',
	templateUrl: './transactions.component.html',
	styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

	transactions: any[] = [];
	transactionsCount = 0;
	pendingBlocks = [];
	latestPovHeight = 0;

	accountMeta: any = {};
	account = '';

	routerSub = null;

	pageSize = 10;
	pages = [];
	allPages = 0;
	activePage = 0;
	offSet = 0;


	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
		private node: NodeService,
		private wallet: WalletService
	) { }

	async ngOnInit() {
		this.routerSub = this.router.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.load(); // Reload the state when navigating to itself from the transactions page
			}
		});
		this.load();
	}

	load() {
		if (this.node.status === true) {
			var page = this.route.snapshot.params.page;
			if (page == undefined || page == 0)
				page = 1;

			this.setPage(page);
		} else {
			this.reload();
		}
	}

	async reload() {
		const source = timer(200);
		const abc = source.subscribe(async val => {
			this.load();
		});
	}

	goTo(page) {
		if (this.account != null && this.account != '') {
			this.router.navigate(['/transactions/' + page + '/' + this.account], { relativeTo: this.route });
		} else {
			this.router.navigate(['/transactions/' + page], { relativeTo: this.route });
		}
	}

	async loadTransactions() {
		await this.getTransactions();
	}

	setPage(page) {
		this.activePage = page;
		this.offSet = page * this.pageSize - this.pageSize;
		this.getTransactions();
	}

	setPages() {
		this.activePage = Math.floor((this.offSet + this.pageSize) / this.pageSize);
		var displayPages = 7;

		var pages = this.transactionsCount / this.pageSize;
		if (this.transactionsCount % this.pageSize != 0) {
			pages = Math.floor(this.transactionsCount / this.pageSize) + 1;
		}
		this.allPages = pages;
		if (pages < 7)
			displayPages = pages;

		this.pages = Array(displayPages).fill(0).map((pages, i) => i + 1);

		if (pages > 5 && this.activePage > 3 && this.activePage < pages - 3) {
			this.pages[1] = this.activePage - 2;
			this.pages[2] = this.activePage - 1;
			this.pages[3] = this.activePage;
			this.pages[4] = this.activePage + 1;
			this.pages[5] = this.activePage + 2;
		} else if (pages > 5 && this.activePage > 3 && this.activePage >= pages - 3) {
			this.pages[1] = pages - 5;
			this.pages[2] = pages - 4;
			this.pages[3] = pages - 3;
			this.pages[4] = pages - 2;
			this.pages[5] = pages - 1;
		}

		this.pages[displayPages - 1] = pages;
		this.pages[0] = 1;
		if (this.pages[displayPages - 2] != pages - 1) {
			this.pages[displayPages - 2] = '...';
		}

		if (this.pages[1] && this.pages[1] != 2) {
			this.pages[1] = '...';
		}
	}

	async getTransactions() {
		/*this.latestPovHeight = 0;
		const latesPovHeader = await this.api.getLatestHeader();
		if (!latesPovHeader.error) {
			this.latestPovHeight = latesPovHeader.result.height;
		}*/
		
		this.account = this.route.snapshot.params.account;
		let transactionsCount = null;
		if (this.account != null && this.account != '') {
			transactionsCount = await this.api.accountBlocksCount(this.account);
			if (!transactionsCount.error) {
				this.transactionsCount = transactionsCount.result;
				this.setPages();
			}
		} else {
			transactionsCount = await this.api.blocksCount();
			if (!transactionsCount.error) {
				this.transactionsCount = transactionsCount.result.count;
				this.setPages();
			}
		}


		let transactions = null;
		if (this.account != null && this.account != '') {
			transactions = await this.api.accountHistory(this.account, this.pageSize, this.offSet);
		} else {
			transactions = await this.api.blocks(this.pageSize, this.offSet);
		}
		//transactions = await this.api.blocks(this.pageSize,this.offSet);
		// const additionalBlocksInfo = [];

		this.transactions = [];
		if (!transactions.error) {
			this.transactions = await this.wallet.prepareQLCBlockView(transactions.result);
			//const historyResult = transactions.result;
			
			//this.transactions = this.transactions.filter(h => h.type !== 'change');
		}
	}
}
