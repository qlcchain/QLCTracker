import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { ApiService } from 'src/app/services/api.service';
import { QLCBlockService } from 'src/app/services/qlc-block.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-representation-reward',
  templateUrl: './representation-reward.component.html',
  styleUrls: ['./representation-reward.component.scss']
})
export class RepresentationRewardComponent implements OnInit {
  accounts = this.wallet.wallet.accounts;

  minerStats = [];

  repRewardForm = new FormGroup({
    qlcAddress: new FormControl('',Validators.required),
    beneficial: new FormControl('',Validators.required),
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

  representatives = [];

  repAccounts = [];
  nonRepAccounts = [];

  repStats = {
		"repCount": 0,
		"repStats": {
		},
		"totalBlockNum": 0,
		"totalPeriod": 0,
		"totalRewardAmount": "",
		"latestBlockHeight": 0
	};

  constructor(
    private wallet: WalletService,
    private api: ApiService,
    private blockService: QLCBlockService,
    private notifications: NotificationService
  ) { }

  async ngOnInit() {
    this.repRewardForm.get('qlcAddress').setValue(this.accounts[0].id);
    this.repRewardForm.get('beneficial').setValue(this.accounts[0].id);
    
    await this.getRepStatus();

    for (const account of this.accounts) { // check if any account address is a rep
      const isRep = this.representatives.find(o => o.address === account.id);
      if (isRep) {
        this.repAccounts.push({
          account , 
          repInfo : isRep, 
          repHistory: {
            status: 0
          }, 
          repRewards: {
            status: 0,
            showGetReward: 0,
            showProcessingReward: 0,
            showError: 0,
            errorTxt: '',
            rewardProcessHash: '',
            showBlockProcessed: 0
          } 
        });
      } else {
        this.nonRepAccounts.push(account);
      }
    }
    this.checkReps();

  }

  async checkReps() {
    for (let rep of this.repAccounts) {
      rep.repRewards.status = 0;
      rep.repRewards.data = {};
      rep.repRewards.showGetReward = 0;
      rep.repRewards.showProcessingReward = 0;
      rep.repRewards.showError = 0;
      rep.repRewards.errorTxt = '';
      rep.repRewards.rewardProcessHash = '';
      rep.repRewards.showBlockProcessed = 0;
      rep.repHistory.status = 0;

      const availRewardInfoQuery = await this.api.rep_getAvailRewardInfo(rep.account.id);
      if (availRewardInfoQuery.result) {
        if (availRewardInfoQuery.result.needCallReward == true) {
          // reward
          rep.repRewards.status = 1;
          rep.repRewards.data = availRewardInfoQuery.result;
          rep.repRewards.showGetReward = 1;
        } else {
          // no reward found
          rep.repRewards.status = -1;

        }
      }
      const availRewardHistoryInfoQuery = await this.api.rep_getRewardHistory(rep.account.id);
      if (availRewardHistoryInfoQuery.result) {
        // reward history
        rep.repHistory.status = 1;
        rep.repHistory.data = availRewardHistoryInfoQuery.result;
        //console.log(rep.repHistory);
      } else {
        // no reward found
        rep.repHistory.status = -1;
        
      }
      //console.log(this.repAccounts);
    }
  }

  async getRepStatus() {
    const repStatsQuery = await this.api.pov_getRepStats();
    let allRepStats = [];
    let onlineRepStats = [];
    let offlineRepStats = [];
    let eligibleForRewards = [];
    if (repStatsQuery.result) {
      this.repStats = repStatsQuery.result;
      const repStats = this.repStats.repStats;
      for (var key in repStats) {
        //console.log(repStats[key]);
        const repStat = {
          "address" : key,
          "mainBlockNum": repStats[key].mainBlockNum,
          "mainRewardAmount": repStats[key].mainRewardAmount,
          "mainOnlinePeriod": repStats[key].mainOnlinePeriod,
          "stableBlockNum": repStats[key].stableBlockNum,
          "stableRewardAmount": repStats[key].stableRewardAmount,
          "stableOnlinePeriod": repStats[key].stableOnlinePeriod,
          "lastOnlineTime": repStats[key].lastOnlineTime,
          "lastOnlineHeight": repStats[key].lastOnlineHeight,
          "isOnline": repStats[key].isOnline
        }
        allRepStats.push(repStat);
      }
    }
    const representatives = await this.api.representatives();
    if (representatives.result) {
      const onlineRepresentatives = await this.api.onlineRepresentatives();
      const onlineReps = onlineRepresentatives.result;
      const tokens = await this.api.tokenInfoByName('QLC');
      let displayReps = [];
      representatives.result.forEach(async rep => {
        const repOnline = onlineReps.indexOf(rep.address) !== -1;
        rep.online = repOnline;
        rep.votingPower = (rep.total / tokens.result.totalSupply*100).toFixed(2);
        const repReward = allRepStats.filter( (rewardRep) => {
          return rewardRep.address === rep.address;
        });
        if (rep.total >= 300000000000000) {
          rep.eligible = true;
        } else {
          rep.eligible = false;
        }
        if (repReward.length !== 0) {
          rep.reward = repReward[0];
          if (rep.reward.isOnline) {
            rep.online = true;
            displayReps.push(rep);
          } else {
            rep.online = false;
            displayReps.push(rep);
          }
        } else {
          displayReps.push(rep);
        }
      });
      this.representatives = displayReps;
      
      return true;
    }
    return false;
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
    if (this.wallet.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.showChecking = 1;
    const qlcAddress = this.repRewardForm.value.qlcAddress;

    const availRewardInfoQuery = await this.api.rep_getAvailRewardInfo(qlcAddress);

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

  async getReward(qlcAddress) {
    if (this.wallet.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    let rep = this.repAccounts.find(o => o.account.id === qlcAddress);
    rep.repRewards.showError = 0;
    rep.repRewards.errorTxt = '';
    rep.repRewards.showGetReward = 0;
    rep.repRewards.showProcessingReward = 1;

    const beneficial = this.repRewardForm.value.beneficial;
    //console.log("beneficial");
    //console.log(beneficial);
    const availRewardInfoQuery = await this.api.rep_getAvailRewardInfo(qlcAddress);

    if (availRewardInfoQuery.result) {
      const availRewardInfo = availRewardInfoQuery.result;
      if (availRewardInfo.needCallReward == true) {
        const rewardSendBlock = await this.api.rep_getRewardSendBlock(qlcAddress,beneficial,availRewardInfo.availStartHeight,availRewardInfo.availEndHeight,availRewardInfo.availRewardBlocks,availRewardInfo.availRewardAmount);
        //console.log("rewardSendBlock");
        //console.log(rewardSendBlock);
        if (!rewardSendBlock.result) {
          rep.repRewards.showProcessingReward = 0;
          rep.repRewards.showError = 1;
          rep.repRewards.errorTxt = 'Error getting reward block, please try again later.';
          rep.repRewards.showGetReward = 1;
          return;
        }
        const walletAccount = await this.wallet.getWalletAccount(qlcAddress);
        //this.showPreparingBlock = 0;
        //this.showProcessingBlock = 1;
        const processRewardSend = await this.blockService.processBlockWithPov(rewardSendBlock.result,walletAccount.keyPair);
        if (!processRewardSend.result) {
          rep.repRewards.showProcessingReward = 0;
          rep.repRewards.showError = 1;
          rep.repRewards.errorTxt = 'Error processing reward block. (' + processRewardSend.error.message + ')';
          rep.repRewards.showGetReward = 1;
          return;
        }
        rep.repRewards.rewardProcessHash = processRewardSend.result;
        rep.repRewards.showProcessingReward = 0;
        rep.repRewards.showBlockProcessed = 1;
        
        //console.log(processRewardSend);
      } else {
        rep.repRewards.showProcessingReward = 0;
        rep.repRewards.showError = 1;
        rep.repRewards.errorTxt = 'The reward was already claimed, try again tomorrow.';
      }
    }

    return; 
  }

  async receiveReward() {
    
    const sentHash = this.repRewardForm.value.sentHash;
    //console.log(sentHash);
    const rewardRecvBlockQuery = await this.api.getRewardRecvBlockBySendHash(sentHash);
    //console.log(rewardRecvBlockQuery);
    const qlcAddress = this.repRewardForm.value.qlcAddress;
    const walletAccount = await this.wallet.getWalletAccount(qlcAddress);
    const procesRewardRecv = await this.blockService.processBlockWithPov(rewardRecvBlockQuery.result,walletAccount.keyPair);
    //console.log(procesRewardRecv);
  }

}
