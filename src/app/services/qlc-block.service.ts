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
		const processResponse = await this.procesBlock(changeBlock, walletAccount.keyPair);

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
		const processResponse = await this.procesBlock(sendBlock, walletAccount.keyPair);

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
			// console.log('find block info of ' + sourceBlock);
		} else {
			// console.log('can not find block info of ' + sourceBlock);
			return null;
		}
		const sendBlock = srcBlockInfo.result[0];

		const receiveBlock = await this.api.c.buildinLedger.generateReceiveBlock(sendBlock);
		const processResponse = await this.procesBlock(receiveBlock, walletAccount.keyPair);

		if (processResponse && processResponse.result) {
			const header = processResponse.result;
			walletAccount.header = header;
			return header;
		} else {
			return null;
		}
	}

	async procesBlock(block, keyPair) {
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
			this.workPool.addWorkToCache(processResponse.result); // Add new hash into the work pool
			this.workPool.removeFromCache(generateWorkFor);
			return processResponse;
		} else {
			return null;
		}
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
