import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import { ApiNEP5Service } from 'src/app/services/api-nep5.service';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { WorkPoolService } from 'src/app/services/work-pool.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { timer } from 'rxjs';
import { QLCBlockService } from 'src/app/services/qlc-block.service';

const nacl = window['nacl'];

@Component({
  selector: 'app-mystakings',
  templateUrl: './mystakings.component.html',
  styleUrls: ['./mystakings.component.scss']
})

export class MystakingsComponent implements OnInit {
  zeroHash = '0000000000000000000000000000000000000000000000000000000000000000';

  accounts = this.walletService.wallet.accounts;
  pledges = [];
  pledgesCompleted = [];
  rewards = [];
  dateNow;
  step = 0;
  unlockPledge;

  myStakingVolume = 0;
  myStakingEarnings = 0;


  totalPledgeAmount = 0;

  revokeSteps = [];
  invokeSteps = [];

  constructor(
    private walletService: WalletService,
    private neoService: NeoWalletService,
    private nep5api: ApiNEP5Service,
    private api: ApiService,
		private util: UtilService,
		private workPool: WorkPoolService,
		private notifications: NotificationService,
		private trans: TranslateService,
    private blockService: QLCBlockService
  ) {

  }

  msg3 = '';

  async ngOnInit() {
    this.getStakings();
    this.loadLang();
  }

  
  loadLang() {
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg3').subscribe((res: string) => {
			this.msg3 = res;
		});
	}

  async getStakings() {
    this.pledges = [];
    this.pledgesCompleted = [];
    this.rewards = [];
    this.myStakingEarnings = 0;
    this.myStakingVolume = 0;
    const totalPledgeAmount = await this.api.getTotalPledgeAmount();
    this.totalPledgeAmount = totalPledgeAmount.result;
    this.dateNow = Date.now();
    this.accounts.forEach(async (account) => {
      //console.log(account);
      const pledges = await this.nep5api.pledgeInfoByBeneficial(account.id);
      if (pledges.result) {
        for(let element of pledges.result) {
          if (element.nep5TxId) {
            const rewardsResult = await this.api.getTotalRewards(element.nep5TxId);
            element.earnings = rewardsResult.result;
            this.myStakingEarnings += element.earnings;
            //const lockInfo = await this.nep5api.getLockInfo(element.nep5TxId);
            //console.log(lockInfo.result);
            //console.log(lockInfo.result.unLockTimestamp*1000);
            if (element.state == 'PledgeDone') {
              this.myStakingVolume += Number(element.amount);
            }
            
            if (element.state == 'WithdrawDone') {
              this.pledgesCompleted.push(element);
            } else {
              this.pledges.push(element);
            }
          }
        }
      }

      const rewards = await this.api.getConfidantRewards(account.id);
      //console.log(rewards);
      const rewardsValues = Object.values(rewards.result);

      let totalAccountReward = 0;
      for(let reward of rewardsValues) {
        //console.log(reward);
        totalAccountReward += Number(reward);
        /*for(let subreward of Object.values(reward)) {
        this.rewards.push(subreward);
        }*/
      }
      if (totalAccountReward > 0) {
        const rewardLine = {
          amount: totalAccountReward,
          account: account.id
        }
        this.rewards.push(rewardLine);
      }

    });

  }

  async continueRevoke(index) {
    this.revokeSteps = [];
    const pledge = this.pledges[index];
    console.log(pledge);
    const walletAccount = await this.walletService.getWalletAccount(pledge.beneficial);
		if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.revokeSteps.push({ msg: 'Continuing revoke.'});
    this.revoke(index);
  }

  async continueInvoke(index) {
    this.invokeSteps = [];
    const pledge = this.pledges[index];
    const walletAccount = await this.walletService.getWalletAccount(pledge.beneficial);
		if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }
    this.step = 3;
    this.invokeSteps.push({ msg: 'Continuing invoke.'});
    this.invokeSteps.push({ msg: 'Checking TXID on NEO network.', checkimg: 1});

    this.confirmInvokeWaitForTXIDConfirm(pledge,walletAccount);

  }

  async confirmInvokeWaitForTXIDConfirm(pledge,walletAccount) {
    const txid = pledge.nep5TxId;
    const transaction = await this.neoService.getTransaction(txid);
    console.log('txid is ');
    console.log(txid);

    const pType = pledge.pType;
    
    if (transaction.txid) {
      const waitTimer = timer(20000).subscribe( async (data) => {
      console.log(transaction);
      console.log('txid confirmed');
      this.invokeSteps.push({ msg: 'TXID confirmed. Preparing QLC Chain pledge.', checkimg: 1});

      const pledgeResult = (pType == 'mintage') 
                            ? await this.nep5api.mintagePledge(txid)
                            : await this.nep5api.benefitPledge(txid)
                            ;
      if (!pledgeResult.result) {
        this.invokeSteps.push({ msg: 'Pledge ERROR.', link: '/staking/qlc/create', linkText: 'Please use RECOVER to recover a failed TX.'});
        return;
      }
      const preparedPledge = pledgeResult.result;
      
      
      this.invokeSteps.push({ msg: 'Pledge prepared. Processing ...', checkimg: 1});
      const pledgetxid = await this.processInvokeBlock(preparedPledge,walletAccount.keyPair,txid);
      
      this.invokeSteps.push({ msg: 'Pledge succesfully processed. Txid on QLC Chain is: ' + pledgetxid.result, checkimg: 1 });
      this.step = 4;
      });
    } else {
      //console.log('error repeating');
      // wait for neoscan to confirm transaction
      const waitTimer = timer(5000).subscribe( (data) => {
        this.confirmInvokeWaitForTXIDConfirm(pledge,walletAccount);
      });
    }
  }

  async revoke(index) {
    this.revokeSteps = [];
    const pledge = this.pledges[index];
    const walletAccount = await this.walletService.getWalletAccount(pledge.beneficial);
		if (this.walletService.walletIsLocked()) {
			return this.notifications.sendWarning('ERROR wallet locked');
    }

    this.step = 1;
    this.unlockPledge = pledge;
    
//console.log('call contractUnlockPrepare');
    this.revokeSteps.push({ msg: 'Preparing revoke.'});
    const txData = await this.neoService.contractUnlockPrepare(pledge);
    if (txData === false) {
      this.revokeSteps.push({ msg: 'ERROR - Connected NEO wallet was not found.'});
      this.step = 0;
      return this.notifications.sendWarning('ERROR - Connected NEO wallet was not found.');
    }
    this.revokeSteps.push({ msg: 'Revoke prepared.', checkimg: 1});

    //console.log(txData);
    //console.log('call contractUnlockPrepare end');
    //console.log('call getWithdraw');
    
    if (pledge.pType == 'mintage') {
      this.revokeSteps.push({ msg: 'Calling withdraw.'});
      const withdrawBlock = await this.getMintageWithdraw(pledge,txData);
      this.revokeSteps.push({ msg: 'Revoke processed.', checkimg: 1});
      this.step = 2;
      return;
    }
    this.revokeSteps.push({ msg: 'Preparing revoke block.', checkimg: 1});

    const withdrawBlock = await this.getWithdraw(pledge);
    //console.log(withdrawBlock);
    //console.log('call getWithdraw end');
    this.revokeSteps.push({ msg: 'Revoke block prepared. Processing ...', checkimg: 1});

    const txid = await this.processBlock(withdrawBlock.result,walletAccount.keyPair,pledge.nep5TxId,txData);
    this.revokeSteps.push({ msg: 'Revoke processed. Waiting for TXID confirmation.', checkimg: 1});

    this.confirmRevokeWaitForTXIDConfirm(txData.unlockTxId);
  }

  async confirmRevokeWaitForTXIDConfirm(txid) {

    const transaction = await this.neoService.getTransaction(txid);
    console.log('txid is ');
    console.log(txid);
    
    if (transaction.txid) {
      this.revokeSteps.push({ msg: 'TXID confirmed.', checkimg: 1});
      this.step = 2;
    } else {
      //console.log('error repeating');
      // wait for neoscan to confirm transaction
      const waitTimer = timer(5000).subscribe( (data) => {
        this.confirmRevokeWaitForTXIDConfirm(txid);
      });
    }
  }
  

  backToOverview() {
    this.step = 0;
    this.getStakings();
  }

  async getMintageWithdraw(pledge, unlockTxParams) {
    const tokens = await this.api.tokens();
    let tokenId = '';

		if (!tokens.error) {
      const findToken = tokens.result.find((token) => token.NEP5TxId == pledge.nep5TxId)
			tokenId = findToken.tokenId;
    }
    /*if (tokenId == '') {
      return false;
    }*/
    return await this.nep5api.mintageWithdraw(tokenId, pledge.nep5TxId, unlockTxParams);
  }
   
  async getWithdraw(pledge) {
    const request1 = {
      beneficial: pledge.beneficial,
      amount: pledge.amount,
      pType: pledge.pType
    }
    return await this.nep5api.benefitWithdraw(request1,pledge.nep5TxId);
  }

  async processBlock(block, keyPair, txid, txData) {
    const povFittest = await this.api.getFittestHeader();
    if (povFittest.error || !povFittest.result) {
      console.log('ERROR - no fittest header');
      return;
    }
    block.poVHeight = povFittest.result.height;
		const blockHash = await this.api.blockHash(block);
		const signed = nacl.sign.detached(this.util.hex.toUint8(blockHash.result), keyPair.secretKey);
		const signature = this.util.hex.fromUint8(signed);

		block.signature = signature;
		let generateWorkFor = block.previous;
		if (block.previous === this.zeroHash) {
			const publicKey = await this.api.accountPublicKey(block.address);
			generateWorkFor = publicKey.result;
		}

		if (!this.workPool.workExists(generateWorkFor)) {
			this.notifications.sendInfo(this.msg3);
		}
		//console.log('generating work');
		const work = await this.workPool.getWork(generateWorkFor);
		//console.log('work >>> ' + work);
		block.work = work;

    const processResponse = await this.nep5api.process(block,txid,txData);

		if (processResponse && processResponse.result) {
			this.workPool.addWorkToCache(processResponse.result); // Add new hash into the work pool
			this.workPool.removeFromCache(generateWorkFor);
			return processResponse;
		} else {
			return null;
		}
  }
  
  async processInvokeBlock(block, keyPair, txid) {
    const povFittest = await this.api.getFittestHeader();
    if (povFittest.error || !povFittest.result) {
      console.log('ERROR - no fittest header');
      return;
    }
    block.poVHeight = povFittest.result.height;
		const blockHash = await this.api.blockHash(block);
		const signed = nacl.sign.detached(this.util.hex.toUint8(blockHash.result), keyPair.secretKey);
		const signature = this.util.hex.fromUint8(signed);

		block.signature = signature;
		let generateWorkFor = block.previous;
		if (block.previous === this.zeroHash) {
			const publicKey = await this.api.accountPublicKey(block.address);
			generateWorkFor = publicKey.result;
		}

		if (!this.workPool.workExists(generateWorkFor)) {
			this.notifications.sendInfo(this.msg3);
		}
		//console.log('generating work');
		const work = await this.workPool.getWork(generateWorkFor);
		//console.log('work >>> ' + work);
    block.work = work;
    
    const processResponse = await this.nep5api.process(block,txid);

		if (processResponse && processResponse.result) {
			this.workPool.addWorkToCache(processResponse.result); // Add new hash into the work pool
			this.workPool.removeFromCache(generateWorkFor);
			return processResponse;
		} else {
			return null;
		}
	}

}
