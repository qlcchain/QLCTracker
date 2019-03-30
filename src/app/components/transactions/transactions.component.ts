import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

	transactions: any[] = [];
	transactionsCount = 0;
	pendingBlocks = [];

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
		private node: NodeService
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
		const abc =  source.subscribe(async val => {
				this.load();
		});
	} 
	
	goTo(page) {
		if (this.account != null && this.account != '') {
			this.router.navigate(['/transactions/'+page+'/'+this.account], { relativeTo: this.route });
		} else {
			this.router.navigate(['/transactions/'+page], { relativeTo: this.route });
		}
  }

  async loadTransactions() {
    const tokenMap = {};
		const tokens = await this.api.tokens();
		if (!tokens.error) {
			tokens.result.forEach(token => {
				tokenMap[token.tokenId] = token;
			});
		}
    
		await this.getTransactions();
	}
	
	setPage(page) {
    console.log(page);
    this.activePage = page;
    this.offSet = page*this.pageSize-this.pageSize;
    this.getTransactions();
	}
	
	setPages() {
		this.activePage = Math.floor((this.offSet + this.pageSize)/this.pageSize);
		var displayPages = 7;

		var pages = this.transactionsCount/this.pageSize;
    if (this.transactionsCount%this.pageSize != 0) {
      pages = Math.floor(this.transactionsCount/this.pageSize)+1;
    }
		this.allPages = pages;
		if (pages < 7)
			displayPages = pages;
		
		this.pages = Array(displayPages).fill(0).map((pages,i)=>i+1) ;

		if (this.activePage > 3 && this.activePage < pages -3) {
			this.pages[1] = this.activePage -2;
			this.pages[2] = this.activePage -1;
			this.pages[3] = this.activePage;
			this.pages[4] = this.activePage +1;
			this.pages[5] = this.activePage +2;
		} else if (this.activePage > 3 && this.activePage >= pages -3) {
			this.pages[1] = pages -5;
			this.pages[2] = pages -4;
			this.pages[3] = pages -3;
			this.pages[4] = pages -2;
			this.pages[5] = pages -1;
		}

		this.pages[displayPages-1] = pages;
		this.pages[0] = 1;
		if (this.pages[displayPages-2] != pages -1) {
			this.pages[displayPages-2] = '...';
		}

		if (this.pages[1] && this.pages[1] != 2) {
			this.pages[1] = '...';
		}
  }

  async getTransactions() {
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
			transactions = await await this.api.accountHistory(this.account,this.pageSize,this.offSet);
		} else {
			transactions = await await this.api.blocks(this.pageSize,this.offSet);
		}
		//transactions = await this.api.blocks(this.pageSize,this.offSet);
		// const additionalBlocksInfo = [];

		this.transactions = [];
		if (!transactions.error) {
			const historyResult = transactions.result;
			for (const block of historyResult) {
				const blockInfo = await this.api.blocksInfo([block.link]);
				// For Open and receive blocks, we need to look up block info to get originating account
				if (block.type === 'Open' || block.type === 'Receive') {
					const preBlock = await this.api.blocksInfo([block.link]);
					if (!preBlock.error && typeof(preBlock.result[0]) != 'undefined' && preBlock.result.length > 0 ) {
						block.link_as_account = preBlock.result[0].address;
					}
				} else {
          const link_as_account = await this.api.accountForPublicKey(block.link);
          if (!link_as_account.error && typeof(link_as_account.result) != 'undefined') {
            block.link_as_account = link_as_account.result;
          }
				}
				this.transactions.push(block);
			}
			//this.transactions = this.transactions.filter(h => h.type !== 'change');
		}
		const atransactions = await this.api.blocks(100);
		console.log(atransactions.result.length);
	}
}
