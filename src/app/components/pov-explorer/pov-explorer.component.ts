import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-pov-explorer',
  templateUrl: './pov-explorer.component.html',
  styleUrls: ['./pov-explorer.component.scss']
})
export class PovExplorerComponent implements OnInit {

  povHeaders: any[] = [];
  povHeadersCount = 0;
  povLatestHeader = {
	"basHdr": {
	  "version": 0,
	  "previous": "0000000000000000000000000000000000000000000000000000000000000000",
	  "merkleRoot": "0000000000000000000000000000000000000000000000000000000000000000",
	  "timestamp": 0,
	  "bits": 0,
	  "nonce": 0,
	  "hash": "0000000000000000000000000000000000000000000000000000000000000000",
	  "height": 0
	},
	"auxHdr": null,
	"cbtx": {
	  "version": 0,
	  "txIns": [
	  ],
	  "txOuts": [
	  ],
	  "stateHash": "0000000000000000000000000000000000000000000000000000000000000000",
	  "txNum": 0,
	  "hash": "0000000000000000000000000000000000000000000000000000000000000000"
	},
	"algoName": "",
	"algoEfficiency": 0,
	"normBits": 0,
	"normDifficulty": 0,
	"algoDifficulty": 0
  };
  refreshButton = 'Refresh';
  minersNum = 0;
  totalQgasMined = 0;

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

  ngOnInit() {
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
		this.router.navigate(['/pov-explorer/' + page], { relativeTo: this.route });
	}

  setPage(page) {
		this.activePage = page;
		this.offSet = page * this.pageSize - this.pageSize;
		this.getPovHeaders();
	}

	setPages() {
		this.activePage = Math.floor((this.offSet + this.pageSize) / this.pageSize);
		var displayPages = 7;

		var pages = this.povHeadersCount / this.pageSize;
		if (this.povHeadersCount % this.pageSize != 0) {
			pages = Math.floor(this.povHeadersCount / this.pageSize) + 1;
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
  
	async refresh() {
		this.refreshButton = 'Refreshing ...';
		await this.getPovHeaders();
		this.refreshButton = 'Refresh';
	}

	async getPovHeaders() {
		let povHeadersCount = null;
		
		const latesPovHeader = await this.api.getLatestHeader();
		if (!latesPovHeader.error) {
		this.povHeadersCount = latesPovHeader.result.basHdr.height;
		this.povLatestHeader = latesPovHeader.result;
		this.setPages();
		}

		const startHeight =this.povHeadersCount - (this.activePage*this.pageSize-this.pageSize);
		let maxPageSize = this.pageSize;
		if (maxPageSize > startHeight) {
		maxPageSize = startHeight;
		}

		this.minersNum = 0;
		this.totalQgasMined = 0;
		const minerStatsQuery = await this.api.getMinerStats();
		if (!minerStatsQuery.error) {
			this.minersNum = minerStatsQuery.result.minerCount;
			this.totalQgasMined = minerStatsQuery.result.totalMinerReward;
		}
		
		const povHeadersQuery = await this.api.batchGetHeadersByHeight(startHeight , maxPageSize);
		
		//transactions = await this.api.Headers(this.pageSize,this.offSet);
		// const additionalHeadersInfo = [];

		this.povHeaders = [];
		if (!povHeadersQuery.error) {
			/*const tokenMap = {};
			const tokens = await this.api.tokens();
			if (!tokens.error) {
				tokens.result.forEach(token => {
					tokenMap[token.tokenId] = token;
				});
      }*/
			const povHeaders = povHeadersQuery.result.headers;
      //console.log(povHeaders);
			for (const header of povHeaders) {
				
				this.povHeaders.push(header);
			}
			//this.transactions = this.transactions.filter(h => h.type !== 'change');
    }
    //console.log(this.povHeaders);
    return true;
	}

	prepareDifficulty(normDifficulty) {
		const bigNorm = new BigNumber(normDifficulty);
		if (bigNorm.dividedBy(1000000000000).isGreaterThan(1))  {
			return bigNorm.dividedBy(1000000000000).toFormat(2) + ' T';
		}
		if (bigNorm.dividedBy(1000000000).isGreaterThan(1))  {
			return bigNorm.dividedBy(1000000000).toFormat(2) + ' G';
		}
		if (bigNorm.dividedBy(1000000).isGreaterThan(1))  {
			return bigNorm.dividedBy(1000000).toFormat(2) + ' M';
		}
		if (bigNorm.dividedBy(1000).isGreaterThan(1))  {
			return bigNorm.dividedBy(1000).toFormat(2) + ' K';
		}
		return bigNorm.toFormat(2);
	}

}
