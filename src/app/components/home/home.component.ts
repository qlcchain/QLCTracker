import { Component, OnInit } from '@angular/core';
import { Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';
import BigNumber from 'bignumber.js';

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
	representativesCount = 0;
	votingPower = new BigNumber(0);
	votingPowerPercent = '0';
	tokensCount = 0;

  routerSub = null;

  constructor(
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
		console.log(transactionsCount);
		if (!transactionsCount.error) {
			this.transactionsCount = transactionsCount.result; // transactionsCount.unchecked == pending transactions ??
		}

		const tokensCount = await this.api.tokens();
		if (!tokensCount.error) {
			this.tokensCount = tokensCount.result.length;
		}

		const representatives = await this.api.representatives();
		if (representatives.result) {
			this.representativesCount = representatives.result.length;
			const onlineRepresentatives = await this.api.onlineRepresentatives();
			const onlineReps = onlineRepresentatives.result;
			this.representativeOnline = onlineReps.length; 
			const tokens = await this.api.tokenInfoByName('QLC');
      let displayReps = [];
			let votingOnline = new BigNumber(0);
      onlineReps.forEach(async rep => {
				const representative = Array.isArray(representatives.result) ? representatives.result.filter(repMeta => repMeta.address === rep)[0] : null;
				votingOnline = new BigNumber(representative.balance).plus(votingOnline);
				this.votingPower = votingOnline;
				this.votingPowerPercent = new BigNumber(votingOnline).dividedBy(tokens.result.totalSupply).multipliedBy(100).toFixed(2); 
			});
    }
	}

  async loadTransactions() {
    
    
    await this.getTransactions();
  }

  async getTransactions() {

		const transactions = await this.api.blocks(10);
		// const additionalBlocksInfo = [];

		this.transactions = [];
		if (!transactions.error) {
			const tokenMap = {};
			const tokens = await this.api.tokens();
			if (!tokens.error) {
				tokens.result.forEach(token => {
					tokenMap[token.tokenId] = token;
				});
			}
			const historyResult = transactions.result;
			for (const block of historyResult) {
				// For Open and receive blocks, we need to look up block info to get originating account
				if (block.type === 'Open' || block.type === 'Receive' || block.type === 'ContractReward') {
          const preBlock = await this.api.blocksInfo([block.link]);
					if (!preBlock.error && typeof(preBlock.result[0]) != 'undefined' && preBlock.result.length > 0 ) {
						block.link_as_account = preBlock.result[0].address;
					}
				} else if (block.type === 'ContractSend') {
					block.link_as_account = block.address;
				} else {
          const link_as_account = await this.api.accountForPublicKey(block.link);
          if (!link_as_account.error && typeof(link_as_account.result) != 'undefined') {
            block.link_as_account = link_as_account.result;
          }
				}
				if (this.transactions.length < 5 && block.type !== 'Change') {
					if (tokenMap.hasOwnProperty(block.token)) {
						block.tokenInfo = tokenMap[block.token];
					}
					this.transactions.push(block);
				}
			}
    }
	}

}
