import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';

import * as bip from 'bip39';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createwallet',
  templateUrl: './createwallet.component.html',
  styleUrls: ['./createwallet.component.scss']
})
export class CreatewalletComponent implements OnInit {
  wallet = this.walletService.wallet;
	activePanel = 0;

  newWalletSeed = '';
	newWalletMnemonic = '';
	importSeedModel = '';
	importSeedMnemonicModel = '';
	walletPasswordModel = '';
  walletPasswordConfirmModel = '';
  agree = false;
  
  selectedImportOption = 'seed';
	importOptions = [
		{ name: 'seed', value: 'seed' },
		{ name: 'mnemonic', value: 'mnemonic' },
		{ name: 'file', value: 'file' }
	];

  msg1 = '';
	msg2 = '';
	msg3 = '';
	msg4 = '';
	msg5 = '';
	msg6 = '';
	msg7 = '';
	msg8 = '';
	msg9 = '';
	msg10 = '';
	msg11 = '';
	msg12 = '';
	msg13 = '';
	msg14 = '';
	msg15 = '';
	msg16 = '';
	msg17 = '';
	msg18 = '';
	msg19 = '';
	msg20 = '';
	msg21 = '';

  constructor(
	//	private router: ActivatedRoute,
		public walletService: WalletService,
		private notifications: NotificationService,
		private route: Router,
		// private ledgerService: LedgerService,
		private trans: TranslateService
	) {
	}

  ngOnInit() {
    this.loadLang();
    this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadLang();
		});
  }

  loadLang() {
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg6').subscribe((res: string) => { this.msg6 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg7').subscribe((res: string) => { this.msg7 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg8').subscribe((res: string) => { this.msg8 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg9').subscribe((res: string) => { this.msg9 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg10').subscribe((res: string) => { this.msg10 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg11').subscribe((res: string) => { this.msg11 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg12').subscribe((res: string) => { this.msg12 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg13').subscribe((res: string) => { this.msg13 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg14').subscribe((res: string) => { this.msg14 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg15').subscribe((res: string) => { this.msg15 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg16').subscribe((res: string) => { this.msg16 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg17').subscribe((res: string) => { this.msg17 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg18').subscribe((res: string) => { this.msg18 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg19').subscribe((res: string) => { this.msg19 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg20').subscribe((res: string) => { this.msg20 = res; });
		this.trans.get('CONFIGURE_WALLET_WARNINGS.msg21').subscribe((res: string) => { this.msg21 = res; });
		this.importOptions = [
			{ name: this.msg1, value: 'seed' },
			{ name: this.msg2, value: 'mnemonic' },
			{ name: this.msg3, value: 'file' }
		];
	}

  setPanel(panel) {
		this.activePanel = panel;
	}

	copied() {
		this.notifications.sendSuccess(this.msg19);
  }
  
  async createNewWallet() {
		const newSeed = await this.walletService.createNewWallet();
		this.newWalletSeed = newSeed;
		this.newWalletMnemonic = bip.entropyToMnemonic(newSeed);

		this.activePanel = 3;
		this.notifications.sendSuccess(this.msg15);
  }
  
  confirmNewSeed() {
		this.newWalletSeed = '';
		this.activePanel = 4;
  }
  
  saveWalletPassword() {
		if (this.walletPasswordConfirmModel !== this.walletPasswordModel) {
			return this.notifications.sendError(this.msg16);
		}
		if (this.walletPasswordModel.length < 1) {
			return this.notifications.sendWarning(this.msg17);
		}
		const newPassword = this.walletPasswordModel;
		this.walletService.wallet.password = newPassword;

		this.walletService.saveWalletExport();

		this.walletPasswordModel = '';
		this.walletPasswordConfirmModel = '';

		this.activePanel = 5;
		this.notifications.sendSuccess(this.msg18);
  }
  
  async importExistingWallet() {
		let importSeed = '';
		if (this.selectedImportOption === 'seed') {
      const existingSeed = this.importSeedModel.trim();
			if (existingSeed.length !== 64) {
				return this.notifications.sendError(this.msg4);
			} 
			importSeed = existingSeed;
		} else if (this.selectedImportOption === 'mnemonic') {
			const mnemonic = this.importSeedMnemonicModel.toLowerCase().trim();
			const words = mnemonic.split(' ');
			if (words.length < 12) {
				return this.notifications.sendError(this.msg5);
			}

			// Try and decode the mnemonic
			try {
				const newSeed = bip.mnemonicToEntropy(mnemonic);
				if (!newSeed || newSeed.length !== 64) {
					return this.notifications.sendError(this.msg6);
				}
				importSeed = newSeed.toUpperCase(); // Force uppercase, for consistency
			} catch (err) {
				return this.notifications.sendError(this.msg7);
			}
		} else {
			return this.notifications.sendError(this.msg8);
		}

		this.notifications.sendInfo(this.msg9, { identifier: 'importing-loading' });
		await this.walletService.createWalletFromSeed(importSeed);

		this.notifications.removeNotification('importing-loading');

		this.activePanel = 4;
		this.notifications.sendSuccess(this.msg10);
  }
  
  importFromFile(files) {
		if (!files.length) {
			return;
		}

		const file = files[0];
		const reader = new FileReader();
		reader.onload = event => {
			const fileData = event.target['result'];
			try {
				const importData = JSON.parse(String(fileData));
				if (!importData.seed || !importData.hasOwnProperty('accountsIndex')) {
					return this.notifications.sendError(this.msg20);
				}

				const walletEncrypted = btoa(JSON.stringify(importData));
				this.route.navigate(['import-wallet'], { fragment: walletEncrypted });
			} catch (err) {
				this.notifications.sendError(this.msg21);
			}
		};

		reader.readAsText(file);
	}

}
