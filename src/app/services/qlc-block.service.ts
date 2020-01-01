import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UtilService } from './util.service';
//import * as blake from 'blakejs';
//import BigNumber from 'bignumber.js';
import { WorkPoolService } from './work-pool.service';
import { NotificationService } from './notification.service';
import { AppSettingsService } from './app-settings.service';
//import { WalletService } from './wallet.service';
// import { LedgerService } from './ledger.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { timer } from 'rxjs';

const nacl = window['nacl'];

//const STATE_BLOCK_PREAMBLE = '0000000000000000000000000000000000000000000000000000000000000000';

@Injectable({
	providedIn: 'root'
})
export class QLCBlockService {
	//representativeAccount = 'qlc_3oftfjxu9x9pcjh1je3xfpikd441w1wo313qjc6ie1es5aobwed5x4pjojic'; // QLC Representative
	zeroHash = '0000000000000000000000000000000000000000000000000000000000000000';

	msg1 = '';
	msg2 = '';
	msg3 = '';
	msg4 = '';
	msg5 = '';
	msg6 = '';
	msg7 = '';

	
	private confirmTxTimer = timer(500);

	constructor(
		private api: ApiService,
		//private util: UtilService,
		private workPool: WorkPoolService,
		private notifications: NotificationService,
		// private ledgerService: LedgerService,
		public settings: AppSettingsService,
		private trans: TranslateService,
		private util: UtilService
	) {
		this.loadLang();
		this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadLang();
		});
	}

	loadLang() {
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg1').subscribe((res: string) => {
			this.msg1 = res;
		});
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg2').subscribe((res: string) => {
			this.msg2 = res;
		});
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg3').subscribe((res: string) => {
			this.msg3 = res;
		});
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg4').subscribe((res: string) => {
			this.msg4 = res;
		});
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg5').subscribe((res: string) => {
			this.msg5 = res;
		});
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg6').subscribe((res: string) => {
			this.msg6 = res;
		});
		this.trans.get('SERVICE_WARNINGS_QLC_SERVICE.msg7').subscribe((res: string) => {
			this.msg7 = res;
		});
	}

	async generateChange(walletAccount, representativeAccount, ledger = false) {
		const changeBlock = await this.api.c.buildinLedger.generateChangeBlock(walletAccount.id, representativeAccount);
		const processResponse = await this.processBlock(changeBlock, walletAccount.keyPair);

		if (processResponse && processResponse.result) {
			const header = processResponse.result;
			walletAccount.header = header;
			return header;
		} else {
			return null;
		}
	}

	async generateSend(walletAccount, toAccountID, tokenTypeHash, rawAmount, ledger = false) {
		const blockData = {
			from: walletAccount.id,
			tokenName: tokenTypeHash,
			to: toAccountID,
			amount: rawAmount
		};

		const sendBlock = await this.api.c.buildinLedger.generateSendBlock(blockData);
		const processResponse = await this.processBlock(sendBlock, walletAccount.keyPair);

		if (processResponse && processResponse.result) {
			const header = processResponse.result;
			walletAccount.header = header;
			return header;
		} else {
			return null;
		}
	}

	async generateReceive(walletAccount, sourceBlock, ledger = false) {
		const srcBlockInfo = await this.api.blocksInfo([sourceBlock]);
		if (srcBlockInfo && !srcBlockInfo.error && srcBlockInfo.result.length > 0) {
			//console.log('find block info of ' + sourceBlock);
			//console.log(srcBlockInfo.result);
		} else {
			// console.log('can not find block info of ' + sourceBlock);
			return null;
		}

		const sendBlock = srcBlockInfo.result[0];
		// Reward contract address
		// qlc_3oinqggowa7f1rsjfmib476ggz6s4fp8578odjzerzztkrifqkqdz5zjztb3 
		// ==> d614bb9d5e20ad063316ce091148e77c99136c6194d55c7ecc7ffa9620dbcaeb
		if (sendBlock.type == 'ContractSend' && sendBlock.link == 'd614bb9d5e20ad063316ce091148e77c99136c6194d55c7ecc7ffa9620dbcaeb') {
			// proccess reward block
			const rewardReceiveBlock = await this.api.getReceiveRewardBlock(sourceBlock);
			//console.log(rewardReceiveBlock);
			if (rewardReceiveBlock.result) {
				//pov
				let block = rewardReceiveBlock.result;
				const povFittest = await this.api.getFittestHeader();
				if (povFittest.error || !povFittest.result || !povFittest.result.basHdr) {
					console.log('ERROR - no fittest header');
					return;
				}
				block.povHeight = povFittest.result.basHdr.height;
				const processResponse = await this.api.process(block);
				if (processResponse.result) {
					return processResponse.result;
				} else {
					return false;
				}
			}
			if (rewardReceiveBlock.error) {
				console.log(rewardReceiveBlock.error.message);
			}
			return;
		}

		// Miner / Rep reward
		// Miner link = 0000000000000000000000000000000000000000000000000000000000000015
		// Rep link = 0000000000000000000000000000000000000000000000000000000000000017
		if (sendBlock.type == 'ContractSend' && (sendBlock.link == '0000000000000000000000000000000000000000000000000000000000000015')) {
			// proccess Miner reward block
			
			const rewardRecvBlockQuery = await this.api.getRewardRecvBlockBySendHash(sendBlock.hash);
			if (rewardRecvBlockQuery.result) {
				const processResponse = await this.processBlockWithPov(rewardRecvBlockQuery.result, walletAccount.keyPair);
				if (processResponse.result) {
					return processResponse.result;
				} else {
					return false;
				}
			}

			if (rewardRecvBlockQuery.error) {
				console.log(rewardRecvBlockQuery.error.message);
			}
			
			return;
		}

		if (sendBlock.type == 'ContractSend' && (sendBlock.link == '0000000000000000000000000000000000000000000000000000000000000017')) {
			// proccess Rep reward block
			
			const rewardRecvBlockQuery = await this.api.rep_getRewardRecvBlockBySendHash(sendBlock.hash);
			if (rewardRecvBlockQuery.result) {
				const processResponse = await this.processBlockWithPov(rewardRecvBlockQuery.result, walletAccount.keyPair);
				if (processResponse.result) {
					return processResponse.result;
				} else {
					return false;
				}
			}

			if (rewardRecvBlockQuery.error) {
				console.log(rewardRecvBlockQuery.error.message);
			}
			
			return;
		}



		// if (srcBlockInfo.result[0].address == 'qlc_3pj83yuemoegkn6ejskd8bustgunmfqpbhu3pnpa6jsdjf9isybzffwq7s4p' || srcBlockInfo.result[0].address == 'qlc_1kk5xst583y8hpn9c48ruizs5cxprdeptw6s5wm6ezz6i1h5srpz3mnjgxao') {
		// 	// proccess reward block
		// 	const rewardReceiveBlock = await this.api.getReceiveRewardBlock(sourceBlock);
		// 	//console.log(rewardReceiveBlock);
		// 	const processResponse = await this.api.process(rewardReceiveBlock.result); 
		// 	//console.log(processResponse);

		// 	return;
		// }

		const receiveBlock = await this.api.c.buildinLedger.generateReceiveBlock(sendBlock);
		const processResponse = await this.processBlock(receiveBlock, walletAccount.keyPair);

		if (processResponse && processResponse.result) {
			const header = processResponse.result;
			walletAccount.header = header;
			return header;
		} else {
			return null;
		}
	}

	async processBlock(block, keyPair) {
		//pov
		const povFittest = await this.api.getFittestHeader();
		if (povFittest.error || !povFittest.result) {
			console.log('ERROR - no fittest header');
			return;
		}
		block.povHeight = povFittest.result.basHdr.height;
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

		const processResponse = await this.api.process(block);
		if (processResponse && processResponse.result) {
			const confirm = await this.confirmTx(processResponse.result);
			console.log('confirm');
			console.log(confirm);
			this.workPool.addWorkToCache(processResponse.result); // Add new hash into the work pool
			this.workPool.removeFromCache(generateWorkFor);
			return processResponse;
		} else {
			return null;
		}
	}

	async processBlockWithPov(block, keyPair) {
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

		const processResponse = await this.api.process(block);
		if (processResponse && processResponse.result) {
			const confirm = await this.confirmTx(processResponse.result);
			console.log('confirm');
			console.log(confirm);
			this.workPool.addWorkToCache(processResponse.result); // Add new hash into the work pool
			this.workPool.removeFromCache(generateWorkFor);
			return processResponse;
		} else if (processResponse && processResponse.error) {
			return processResponse;
		} else {
			return null;
		}
	}

	async confirmTx(hash) {
		console.log('confirmingTx ' + hash);
		let notConfirmed = true;

		while(notConfirmed) {
			const blockConfirmedQuery = await this.api.blockConfirmedStatus(hash);
			if (typeof blockConfirmedQuery.result != 'undefined') {
				if (blockConfirmedQuery.result === true) {
					console.log('confirmed');
					notConfirmed = false;
				} else {
					console.log('not confirmed');
					await this.sleep(500);
				}
			} else {
				console.log('not confirmed');
				await this.sleep(500);
			}
		}
		return hash;
	}

	sleep(ms) {
		console.log('sleep' + ms);
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	sendLedgerDeniedNotification() {
		this.notifications.sendWarning(this.msg6);
	}
	sendLedgerNotification() {
		this.notifications.sendInfo(this.msg7, { identifier: 'ledger-sign', length: 0 });
	}
	clearLedgerNotification() {
		this.notifications.removeNotification('ledger-sign');
	}
}
