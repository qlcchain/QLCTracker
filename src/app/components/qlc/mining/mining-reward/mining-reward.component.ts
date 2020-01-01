import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { ApiService } from 'src/app/services/api.service';
import { QLCBlockService } from 'src/app/services/qlc-block.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-mining-reward',
  templateUrl: './mining-reward.component.html',
  styleUrls: ['./mining-reward.component.scss']
})
export class MiningRewardComponent implements OnInit {

  accounts = this.walletService.wallet.accounts;
  minerAccounts = [];
  minerAccountsNotStarted = [];
  nonMinerAccounts = [];

  minerStats = [];

  miningForm = new FormGroup({
    qlcAddress: new FormControl('',Validators.required),
    beneficial: new FormControl('',Validators.required),
    sentHash: new FormControl('',Validators.required),
  });

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


  constructor(
    private walletService: WalletService,
    private api: ApiService,
    private blockService: QLCBlockService,
    private notifications: NotificationService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.miningForm.get('qlcAddress').setValue(this.accounts[0].id);
    this.miningForm.get('beneficial').setValue(this.accounts[0].id);
    await this.getMinerStats();

    for (const account of this.accounts) { // check if any account address is a miner
      const isMiner = this.minerStats.find(o => o.address === account.id);
      if (isMiner) {
        this.minerAccounts.push({
          account , 
          minerInfo : isMiner, 
          minerHistory: {
            status: 0
          }, 
          minerRewards: {
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
        //console.log('.................checking account state');
        const repStatus = await this.api.pov_getLatestAccountState(account.id);
        if (repStatus.result) {
          //console.log(repStatus);
          if (repStatus.result.accountState && repStatus.result.accountState != null) {
            if (repStatus.result.accountState.vote && repStatus.result.accountState.vote >= 10000000000000) {
              //console.log('found minerAccountsNotStarted');
              //console.log(account)
              this.minerAccountsNotStarted.push(account);
            } else {
              this.nonMinerAccounts.push(account);
            }
          } else {
            this.nonMinerAccounts.push(account);
          }
        } else {
          this.nonMinerAccounts.push(account);
        }
      }
    }
    this.checkMiners();
    //console.log(this.minerAccounts);
    //console.log(this.nonMinerAccounts);
  }

  async checkMiners() {
    for (let miner of this.minerAccounts) {
      miner.minerRewards.status = 0;
      miner.minerRewards.data = {};
      miner.minerRewards.showGetReward = 0;
      miner.minerRewards.showProcessingReward = 0;
      miner.minerRewards.showError = 0;
      miner.minerRewards.errorTxt = '';
      miner.minerRewards.rewardProcessHash = '';
      miner.minerRewards.showBlockProcessed = 0;
      miner.minerHistory.status = 0;

      const availRewardInfoQuery = await this.api.getAvailRewardInfo(miner.account.id);
      if (availRewardInfoQuery.result) {
        if (availRewardInfoQuery.result.needCallReward == true) {
          // reward
          miner.minerRewards.status = 1;
          miner.minerRewards.data = availRewardInfoQuery.result;
          miner.minerRewards.showGetReward = 1;
        } else {
          // no reward found
          miner.minerRewards.status = -1;

        }
      }
      const availRewardHistoryInfoQuery = await this.api.miner_getRewardHistory(miner.account.id);
      if (availRewardHistoryInfoQuery.result) {
        // reward history
        miner.minerHistory.status = 1;
        miner.minerHistory.data = availRewardHistoryInfoQuery.result;
        //console.log(miner.minerHistory);
      } else {
        // no reward found
        miner.minerHistory.status = -1;
        
      }
      //console.log(this.minerAccounts);
    }
  }

  async getMinerStats() {
    const minerStatsQuery = await this.api.getMinerStats();
    if (minerStatsQuery.result) {
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
      return true;
    }
    return false;
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

  async getReward(qlcAddress) {
    if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    let miner = this.minerAccounts.find(o => o.account.id === qlcAddress);
    miner.minerRewards.showError = 0;
    miner.minerRewards.errorTxt = '';
    miner.minerRewards.showGetReward = 0;
    miner.minerRewards.showProcessingReward = 1;

    const beneficial = this.miningForm.value.beneficial;
    //console.log("beneficial");
    //console.log(beneficial);
    const availRewardInfoQuery = await this.api.getAvailRewardInfo(qlcAddress);

    if (availRewardInfoQuery.result) {
      const availRewardInfo = availRewardInfoQuery.result;
      if (availRewardInfo.needCallReward == true) {
        const rewardSendBlock = await this.api.getRewardSendBlock(qlcAddress,beneficial,availRewardInfo.availStartHeight,availRewardInfo.availEndHeight,availRewardInfo.availRewardBlocks,availRewardInfo.availRewardAmount);
        //console.log("rewardSendBlock");
        //console.log(rewardSendBlock);
        if (!rewardSendBlock.result) {
          miner.minerRewards.showProcessingReward = 0;
          miner.minerRewards.showError = 1;
          miner.minerRewards.errorTxt = 'Error getting reward block, please try again later.';
          miner.minerRewards.showGetReward = 1;
          return;
        }
        const walletAccount = await this.walletService.getWalletAccount(qlcAddress);
        //this.showPreparingBlock = 0;
        //this.showProcessingBlock = 1;
        const processRewardSend = await this.blockService.processBlockWithPov(rewardSendBlock.result,walletAccount.keyPair);
        if (!processRewardSend.result) {
          miner.minerRewards.showProcessingReward = 0;
          miner.minerRewards.showError = 1;
          miner.minerRewards.errorTxt = 'Error processing reward block. (' + processRewardSend.error.message + ')';
          miner.minerRewards.showGetReward = 1;
          return;
        }
        miner.minerRewards.rewardProcessHash = processRewardSend.result;
        miner.minerRewards.showProcessingReward = 0;
        miner.minerRewards.showBlockProcessed = 1;
        
        //console.log(processRewardSend);
      } else {
        miner.minerRewards.showProcessingReward = 0;
        miner.minerRewards.showError = 1;
        miner.minerRewards.errorTxt = 'The reward was already claimed, try again tomorrow.';
      }
    }

    return;
    
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

}
