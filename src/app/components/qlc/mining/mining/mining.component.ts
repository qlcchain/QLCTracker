import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WalletService } from 'src/app/services/wallet.service';
import { ApiService } from 'src/app/services/api.service';
import { QLCBlockService } from 'src/app/services/qlc-block.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-mining',
  templateUrl: './mining.component.html',
  styleUrls: ['./mining.component.scss']
})
export class MiningComponent implements OnInit {
  accounts = this.walletService.wallet.accounts;

  minerStats = [];

  miningForm = new FormGroup({
    qlcAddress: new FormControl('',Validators.required),
    sentHash: new FormControl('',Validators.required),
  });

  activeView = 'status';

  showGetReward = 0;
  availRewardAmount = 0;
  showNoRewardAvailabe = 0;
  showChecking = 0;
  showCheckOtherAddress = 0;
  showError = 0;
  errorMsg = '';
  showPreparingBlock = 0;
  showProcessingBlock = 0;
  showBlockProcessed = 0;
  rewardProcessHash = '';

  miningReward = {};

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


  constructor(
    private walletService: WalletService,
    private api: ApiService,
    private blockService: QLCBlockService,
    private notifications: NotificationService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.route.url.subscribe((e)=>{
      if (typeof e[1] != 'undefined') {
        //console.log(e[1].path);
        if (e[1].path == 'claim') {
          this.activeView = e[1].path;
        } else {
          this.activeView = 'status';
        }
      }
    });
    //this.miningForm.get('qlcAddress').setValue(this.accounts[0].id);
    this.getMinerStats();
  }

  async getMinerStats() {
    const latesPovHeader = await this.api.getLatestHeader();
		if (!latesPovHeader.error) {
      this.povHeadersCount = latesPovHeader.result.basHdr.height;
      this.povLatestHeader = latesPovHeader.result;
		}
		this.minersNum = 0;
		this.totalQgasMined = 0;
    const minerStatsQuery = await this.api.getMinerStats();
    if (minerStatsQuery.result) {
			this.minersNum = minerStatsQuery.result.minerCount;
			this.totalQgasMined = minerStatsQuery.result.totalMinerReward;
      const minerStats = minerStatsQuery.result.minerStats;
      let displayMinerStats = [];
      for (var key in minerStats) {
        //console.log(minerStats[key]);
        displayMinerStats.push({
          "address" : key,
          "mainBlockNum": minerStats[key].mainBlockNum,
          "mainRewardAmount": minerStats[key].mainRewardAmount,
          "firstBlockTime": minerStats[key].firstBlockTime,
          "lastBlockTime": minerStats[key].lastBlockTime,
          "firstBlockHeight": minerStats[key].firstBlockHeight,
          "lastBlockHeight": minerStats[key].lastBlockHeight,
          "isHourOnline": minerStats[key].isHourOnline,
          "isDayOnline": minerStats[key].isDayOnline
        });
      }
      displayMinerStats.sort(this.compareMinerStats);
      this.minerStats = displayMinerStats;
    }
    //console.log(this.minerStats);
  }

  compareMinerStats( a, b ) {
    /*if ( a.isHourOnline > b.isHourOnline ){
      return -1;
    }
    if ( a.isHourOnline < b.isHourOnline ){
      return 1;
    }
    return 0;*/
    return b.isDayOnline - a.isDayOnline || b.isHourOnline - a.isHourOnline;
  }

  resetForm() {
    this.showChecking = 0;
    this.showGetReward = 0;
    this.showNoRewardAvailabe = 0;
    this.showCheckOtherAddress = 0;
    this.showError = 0;
    this.errorMsg = '';
    this.showPreparingBlock = 0;
    this.showProcessingBlock = 0;
    this.showBlockProcessed = 0;
    this.rewardProcessHash = '';
  }

  async checkForm() {
    if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.showChecking = 1;
    const qlcAddress = this.miningForm.value.qlcAddress;

    const availRewardInfoQuery = await this.api.getAvailRewardInfo(qlcAddress);

    if (availRewardInfoQuery.result) {
      if (availRewardInfoQuery.result.needCallReward == true) {
        //console.log('availRewardInfoQuery.result.needCallReward true');
        this.showGetReward = 1;
        this.miningReward = availRewardInfoQuery.result;
        this.availRewardAmount = availRewardInfoQuery.result.availRewardAmount;
      } else {
        this.showGetReward = 0;
        this.showNoRewardAvailabe = 1;
      }
    }
    
    this.showCheckOtherAddress = 1;

  }

  async getReward() {
    if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.showGetReward = 0;
    this.showCheckOtherAddress = 0;
    const qlcAddress = this.miningForm.value.qlcAddress;
    const availRewardInfoQuery = await this.api.getAvailRewardInfo(qlcAddress);

    this.showPreparingBlock = 1;
    if (availRewardInfoQuery.result) {
      const availRewardInfo = availRewardInfoQuery.result;
      if (availRewardInfo.needCallReward == true) {
        //console.log('availRewardInfo.needCallReward true');
        const rewardSendBlock = await this.api.getRewardSendBlock(qlcAddress,qlcAddress,availRewardInfo.availStartHeight,availRewardInfo.availEndHeight,availRewardInfo.availRewardBlocks,availRewardInfo.availRewardAmount);
        //console.log(rewardSendBlock);
        if (!rewardSendBlock.result) {
          this.showPreparingBlock = 0;
          this.showError = 1;
          this.errorMsg = 'Error getting reward block, please try again later.';
          this.showCheckOtherAddress = 1;
          return;
        }
        const walletAccount = await this.walletService.getWalletAccount(qlcAddress);
        this.showPreparingBlock = 0;
        this.showProcessingBlock = 1;
        const procesRewardSend = await this.blockService.processBlockWithPov(rewardSendBlock.result,walletAccount.keyPair);
        if (!procesRewardSend.result) {
          this.showProcessingBlock = 0;
          this.showError = 1;
          this.errorMsg = 'Error processing reward block. (' + procesRewardSend.error.message + ')';
          this.showCheckOtherAddress = 1;
          return;
        }
        this.rewardProcessHash = procesRewardSend.result;
        this.showProcessingBlock = 0;
        this.showBlockProcessed = 1;
        
        //console.log(procesRewardSend);
      } else {
        this.showError = 1;
        this.errorMsg = 'The reward was already claimed, try again tomorrow.';
      }
    }
    this.showCheckOtherAddress = 1;

    



  }

  async receiveReward() {
    
    const sentHash = this.miningForm.value.sentHash;
    //console.log(sentHash);
    const rewardRecvBlockQuery = await this.api.getRewardRecvBlockBySendHash(sentHash);
    //console.log(rewardRecvBlockQuery);
    const qlcAddress = this.miningForm.value.qlcAddress;
    const walletAccount = await this.walletService.getWalletAccount(qlcAddress);
    const procesRewardRecv = await this.blockService.processBlockWithPov(rewardRecvBlockQuery.result,walletAccount.keyPair);
    //console.log(procesRewardRecv);
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
