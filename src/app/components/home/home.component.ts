import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { load } from '@angular/core/src/render3';
import { timer } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  transactions: any[] = [];
	pendingBlocks = [];
	pageSize = 25;
	accountsCreated = 0;
	transactionsCount = { count: 0, unchecked: 0 };
	representativeOnline = 0;

  routerSub = null;

  constructor(
    private router: ActivatedRoute,
		private route: Router,
		private api: ApiService,
		private node: NodeService
  ) { }

  async ngOnInit() {
    this.routerSub = this.route.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.loadTransactions(); // Reload the state when navigating to itself from the transactions page
			}
		});
		this.load();
	}

	load() {
		if (this.node.status === true) {
			this.loadStatuses();
			this.loadTransactions();
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
	
	async loadStatuses() {
		const accountsCreated = await this.api.accountsCount();
		if (!accountsCreated.error) {
			this.accountsCreated = accountsCreated.result;
		}

		const transactionsCount = await this.api.blocksCount();
		if (!transactionsCount.error) {
			this.transactionsCount = transactionsCount.result; // transactionsCount.unchecked == pending transactions ??
		}

		const representativeOnline = await this.api.onlineRepresentatives();
		if (!representativeOnline.error) {
			this.representativeOnline = representativeOnline.result.length; 
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

  async getTransactions() {

		const transactions = await this.api.blocks(10);
		// const additionalBlocksInfo = [];

		this.transactions = [];
		if (!transactions.error) {
			const historyResult = transactions.result;
			for (const block of historyResult) {
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
				if (this.transactions.length < 5 && block.type !== 'Change')
					this.transactions.push(block);
			}
    }
	}

}
