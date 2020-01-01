import { Component, OnInit } from '@angular/core';
import { Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer, interval } from 'rxjs';
import BigNumber from 'bignumber.js';
import { WalletService } from 'src/app/services/wallet.service';
import { QLCWebSocketService } from 'src/app/services/qlc-websocket.service';

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
	//transactionsCount = { count: 0, unchecked: 0 };
	representativeOnline = 0;
	representativesCount = 0;
	nodesOnline = 0;
	nodesTotal = 0;
	
	votingPower = new BigNumber(0);
	votingPowerPercent = '0';
	tokensCount = 0;

	latestPovHeight = 0;
	povHeaders = [];
	minerOnline = 0;
	minerCount = 0;

	newsList = [];
	
	routerSub = null;

	miningRewardsGraphData = {
		labels: ['-24','-22','-20','-18','-16','-14','-12','-10','-8','-6','-4','-2'],
		datasets: [
		  {
			label: 'Mining Rewards',
			data: [10, 50, 40, 80, 20, 60, 5, 35, 45, 55 ,8, 2],
			fill: false,
			backgroundColor: "#2069c2",
			borderColor: "#2069c2",
			pointBackgroundColor: "#2069c2",
   			pointBorderColor: "#2069c2",
   			pointHoverBackgroundColor: "#ffffff",
   			pointHoverBorderColor: "#2069c2",
			borderDash: [3, 3],
			borderWidth: 2
		  },
		  {
			label: 'Rep Rewards',
			data: [10, 50, 40, 80, 20, 60, 5, 35, 45, 55 ,8, 2],
			fill: false,
			backgroundColor: "#6941b7",
			borderColor: "#6941b7",
			pointBackgroundColor: "#6941b7",
   			pointBorderColor: "#6941b7",
   			pointHoverBackgroundColor: "#ffffff",
   			pointHoverBorderColor: "#6941b7",
			borderDash: [3, 3],
			borderWidth: 2
		  }
		],
	};

	transactionsGraphData = {
		labels: ['-24','-22','-20','-18','-16','-14','-12','-10','-8','-6','-4','-2'],
		datasets: [
		  {
			label: 'Transactions',
			data: [10, 50, 40, 80, 20, 60, 5, 35, 45, 55 ,8, 2],
			fill: false,
			backgroundColor: "#56af08",
			borderColor: "#56af08",
			pointBackgroundColor: "#56af08",
   			pointBorderColor: "#56af08",
   			pointHoverBackgroundColor: "#ffffff",
   			pointHoverBorderColor: "#56af08",
			borderDash: [3, 3],
			borderWidth: 2,
            yAxisID: "y-axis-1"
		  },
		  {
			label: 'Blocks',
			data: [10, 50, 40, 80, 20, 60, 5, 35, 45, 55 ,8, 2],
			fill: false,
			backgroundColor: "#2069c2",
			borderColor: "#2069c2",
			pointBackgroundColor: "#2069c2",
   			pointBorderColor: "#2069c2",
   			pointHoverBackgroundColor: "#ffffff",
   			pointHoverBorderColor: "#2069c2",
			borderDash: [3, 3],
			borderWidth: 2,
            yAxisID: "y-axis-2"
		  }
		],
	};

	graphOptions = {
		legend: {
			display: true,
			labels: {
				padding: 30
			},
		}
	}

	transactionsgraphOptions = {
		legend: {
			display: true,
			labels: {
				padding: 30
			},
		},
		scales: {
			yAxes: [{
				type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
				display: "auto",
				position: "left",
				id: "y-axis-1",
			}, {
				type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
				display: "auto",
				position: "right",
				id: "y-axis-2",

				// grid line settings
				gridLines: {
					drawOnChartArea: false, // only want the grid lines for one axis to show up
				},
			}],
		}
	}

	blockHashData = {
		labels: ['SHA256D', 'SCRYPT', 'X11'],
		datasets: [
		  {
			data: [0, 0, 0],
			backgroundColor: ['#6941b7', '#2069c2', '#56af08', 'rgb(75, 192, 192)'],
			hoverBackgroundColor: ['#6941b7', '#2069c2', '#56af08', 'rgba(75, 192, 192, 0.2)'],
		  },
		],
	};
	totalHashesPerSecond2Hours = 0;

	blockHashData24 = {
		labels: ['SHA256D', 'SCRYPT', 'X11'],
		datasets: [
		  {
			data: [0, 0, 0],
			backgroundColor: ['#6941b7', '#2069c2', '#56af08', 'rgb(75, 192, 192)'],
			hoverBackgroundColor: ['#6941b7', '#2069c2', '#56af08', 'rgba(75, 192, 192, 0.2)'],
		  },
		],
	};
	totalHashesPerSecond24Hours = 0;

	pieChartOptions = {
		legend: {
			display: true,
			labels: {
				padding: 30
			},
		}
	}

	povInfo = {
		"MaxTxPerBlock": 0,
		"MinTxPerBlock": 0,
		"AvgTxPerBlock": 0,
		"MaxTxPerHour": 0,
		"MinTxPerHour": 0,
		"AvgTxPerHour": 0,
		"MaxBlockPerHour": 0,
		"MinBlockPerHour": 0,
		"AvgBlockPerHour": 0,
		"AllBlockNum": 0,
		"AllTxNum": 0,
		"HourItemList": [
		]
	};

	totalMiningReward = 0;
	totalRepReward = 0;
	
	private latestTransactionsInterval$ = interval(60000);

	constructor(
			private route: Router,
			private api: ApiService,
			private node: NodeService,
			public wallet: WalletService,
			public ws: QLCWebSocketService
	) { }

  	async ngOnInit() {
   	 	this.routerSub = this.route.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.loadTransactions(); // Reload the state when navigating to itself from the transactions page
			}
		});
		this.load();
	}

	ngOnDestroy() {
		if (this.routerSub) {
			this.routerSub.unsubscribe();
		}
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
		const source = timer(500);
		const abc =  source.subscribe(async val => {
				this.load();
		});
	}

	async loadNews() {
		const news = await this.api.news();
		if (!news.error) {
			this.newsList = news.result;
		}
	}
	
	async loadStatuses() {
		const accountsCreated = await this.api.accountsCount();
		if (!accountsCreated.error) {
			this.accountsCreated = accountsCreated.result;
		}
		this.loadNews();
		const povInfoQuery = await this.api.getLastNHourInfo();
		let graphMiningRewards = [];
		let graphRepRewards = [];
		let graphTransactions = [];
		let graphBlocks = [];
		
		let hashInfoData = [];
		let sha256d_2h = 0;
		let x11_2h = 0;
		let scrypt_2h = 0;
		let hashInfoData24 = [];
		let sha256d_24h = 0;
		let x11_24h = 0;
		let scrypt_24h = 0;

		if (povInfoQuery.result) {
			this.povInfo = povInfoQuery.result;
			this.totalMiningReward = 0;
			this.totalRepReward = 0;
			
			//console.log(povInfoQuery.result)
			for (const hourInfo of this.povInfo.HourItemList) {
				if (hourInfo.Hour % 2 === 0) {
					graphMiningRewards.push(hourInfo.AllMinerReward/100000000);
					graphRepRewards.push(hourInfo.AllRepReward/100000000);
					graphTransactions.push(hourInfo.AllTxNum);
					graphBlocks.push(hourInfo.AllBlockNum);
				}
				this.totalMiningReward += hourInfo.AllMinerReward/100000000;
				this.totalRepReward += hourInfo.AllRepReward/100000000;
				if (hourInfo.Hour < 2) {
					sha256d_2h += hourInfo.Sha256dBlockNum;
					x11_2h += hourInfo.X11BlockNum;
					scrypt_2h += hourInfo.ScryptBlockNum;
				}
				sha256d_24h += hourInfo.Sha256dBlockNum;
				x11_24h += hourInfo.X11BlockNum;
				scrypt_24h += hourInfo.ScryptBlockNum;
			}
			hashInfoData = [sha256d_2h,scrypt_2h,x11_2h];
			
			hashInfoData24 = [sha256d_24h,scrypt_24h,x11_24h];
		}

		//console.log(hashInfoData);
		//console.log(hashInfoData24);


/**
 * 
 * "Sha256dBlockNum": 24,
        "X11BlockNum": 18,
        "ScryptBlockNum": 16,
 */
		graphMiningRewards.reverse();
		graphRepRewards.reverse();
		graphTransactions.reverse();
		graphBlocks.reverse();

		const oldDataSet = this.miningRewardsGraphData.datasets[0];
		const oldDataSet2 = this.miningRewardsGraphData.datasets[1];
	
		const newDataSet = {
			...oldDataSet,
		};

		const newDataSet2 = {
			...oldDataSet2,
		};
	
		newDataSet.data = graphMiningRewards;
		newDataSet2.data = graphRepRewards;


		const newState = {
			...this.miningRewardsGraphData,
			datasets: [newDataSet, newDataSet2],
		};
	
		this.miningRewardsGraphData = newState;

		const transactionsOldDataSet = this.transactionsGraphData.datasets[0];
		const transactionsOldDataSet2 = this.transactionsGraphData.datasets[1];
	
		const transactionsNewDataSet = {
			...transactionsOldDataSet,
		};

		const transactionsNewDataSet2 = {
			...transactionsOldDataSet2,
		};
	
		transactionsNewDataSet.data = graphTransactions;
		transactionsNewDataSet2.data = graphBlocks;
	
		const transactionsNewState = {
			...this.transactionsGraphData,
			datasets: [transactionsNewDataSet,transactionsNewDataSet2],
		};
	
		this.transactionsGraphData = transactionsNewState;

		this.minerCount = 0;
		this.minerOnline = 0;
		const minerStatsQuery = await this.api.getMinerStats();
		if (!minerStatsQuery.error) {
			this.minerCount = minerStatsQuery.result.minerCount;
			this.minerOnline = minerStatsQuery.result.dayOnlineCount;
		}
		
		//hash info
		//const hashInfoQuery = await this.api.getHashInfo(0,120);

		/*if (hashInfoQuery.result) {
			for (const [key, value] of Object.entries(hashInfoQuery.result)) {
				//console.log(key, value);
				if (key == 'chainHashPS')
					this.totalHashesPerSecond2Hours = <number> value;
				else 
					hashInfoData.push(value);
			}
		}*/

		const hashOldDataSet = this.blockHashData.datasets[0];
	
		const hashNewDataSet = {
			...hashOldDataSet,
		};
	
		hashNewDataSet.data = hashInfoData;
	
		const hashNewState = {
			...this.blockHashData,
			datasets: [hashNewDataSet],
		};
	
		this.blockHashData = hashNewState;

		//hash info 24 h
		//const hashInfoQuery24 = await this.api.getHashInfo(0,1440);

		/*if (hashInfoQuery24.result) {
			for (const [key, value] of Object.entries(hashInfoQuery24.result)) {
				//console.log(key, value);
				if (key == 'chainHashPS')
					this.totalHashesPerSecond24Hours = <number> value;
				else 
					hashInfoData24.push(value);
			}
		}*/

		const hashOldDataSet24 = this.blockHashData24.datasets[0];
	
		const hashNewDataSet24 = {
			...hashOldDataSet24,
		};
	
		hashNewDataSet24.data = hashInfoData24;
	
		const hashNewState24 = {
			...this.blockHashData24,
			datasets: [hashNewDataSet24],
		};
	
		this.blockHashData24 = hashNewState24;


		
		//const transactionsCount = await this.api.blocksCount();
		//console.log(transactionsCount);
		//if (!transactionsCount.error) {
		//	this.transactionsCount = transactionsCount.result; // transactionsCount.unchecked == pending transactions ??
		//}
		this.wallet.refreshBlocks();

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
			let votingOnline = new BigNumber(0);
      		onlineReps.forEach(async rep => {
				const representative = Array.isArray(representatives.result) ? representatives.result.filter(repMeta => repMeta.address === rep)[0] : null;
				const total = representative != null ? representative.total : 0;
				votingOnline = new BigNumber(total).plus(votingOnline);
				this.votingPower = votingOnline;
				this.votingPowerPercent = new BigNumber(votingOnline).dividedBy(tokens.result.totalSupply).multipliedBy(100).toFixed(2); 
			});
		}
		
		const nodesInfoQuery = await this.api.peersCount();
		if (nodesInfoQuery.result) {
			this.nodesOnline = nodesInfoQuery.result.online;
			this.nodesTotal = nodesInfoQuery.result.all;
		}


	}

	async loadTransactions() {
		this.getTransactions();
		this.latestTransactionsInterval$.subscribe(async () => {
			this.getTransactions();
		});
	}

	async getTransactions() {
		this.latestPovHeight = 0;
		const latesPovHeader = await this.api.getLatestHeader();
		if (!latesPovHeader.error) {
			this.latestPovHeight = latesPovHeader.result.basHdr.height;
		}
		
		const povHeadersQuery = await this.api.batchGetHeadersByHeight(this.latestPovHeight , 5);
		
		let newPovHeaders = [];
		if (!povHeadersQuery.error) {
			const povHeaders = povHeadersQuery.result.headers;
			for (const header of povHeaders) {
				newPovHeaders.push(header);
			}
			this.povHeaders = newPovHeaders;
    	}

		const transactions = await this.api.blocks(5);
		
		if (!transactions.error) {
			this.transactions = await this.wallet.prepareQLCBlockView(transactions.result);
    	}
	}

}
