import { Component, OnInit, TemplateRef } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { NotificationService } from '../../services/notification.service';
import { AppSettingsService } from '../../services/app-settings.service';
import { PriceService } from '../../services/price.service';
import { PowService } from '../../services/pow.service';
import { WorkPoolService } from '../../services/work-pool.service';
import { AddressBookService } from '../../services/address-book.service';
import { ApiService } from '../../services/api.service';
import { LangService } from '../../services/lang.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import BigNumber from 'bignumber.js';
import { Router } from '@angular/router';

import * as QRCode from 'qrcode';
import * as bip from 'bip39';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  wallet = this.walletService.wallet;
  accounts = this.walletService.wallet.accounts;

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
	msg22 = '';
	msg23 = '';
	msg24 = '';
	msg25 = '';
	msg26 = '';
	msg27 = '';
	msg28 = '';
  msg29 = '';
  
  msg30 = '';
  msg31 = '';
  msg32 = '';
  msg33 = '';
  msg34 = '';
  msg35 = '';
  msg36 = '';
  msg37 = '';
  msg38 = '';
  msg39 = '';
  msg40 = '';
  msg41 = '';

  newPassword = '';
  confirmPassword = '';

  showQRExport = false;
  QRExportUrl = '';
  QRExportImg = '';
  addressBookShowQRExport = false;
  addressBookQRExportUrl = '';
  addressBookQRExportImg = '';


	denominations = [
		{ name: this.msg1, value: 'mqlc' },
		{ name: this.msg2, value: 'kqlc' },
		{ name: this.msg3, value: 'qlc' }
	];
	selectedDenomination = this.denominations[0].value;

	languages = [{ name: this.msg4, value: 'en' }, { name: this.msg5, value: 'cn' }];
	selectedLang = this.languages[0].value;

	storageOptions = [{ name: this.msg6, value: 'localStorage' }, { name: this.msg7, value: 'none' }];
	selectedStorage = this.storageOptions[0].value;

	currencies = [
		{ name: this.msg8, value: '' },
		{ name: this.msg9, value: 'USD' },
		{ name: this.msg10, value: 'BTC' },
		{ name: this.msg11, value: 'CNY' }
	];
	selectedCurrency = this.currencies[0].value;

	inactivityOptions = [
		{ name: this.msg12, value: 0 },
		{ name: this.msg13, value: 1 },
		{ name: this.msg14, value: 5 },
		{ name: this.msg15, value: 15 },
		{ name: this.msg16, value: 30 },
		{ name: this.msg17, value: 60 },
		{ name: this.msg18, value: 360 }
	];
	selectedInactivityMinutes = this.inactivityOptions[4].value;

	lockOptions = [{ name: this.msg19, value: 1 }, { name: this.msg20, value: 0 }];
	selectedLockOption = 1;

	powOptions = [
		{ name: 'Best Option Available', value: 'best' },
		{ name: 'Client Side - WebGL (Chrome/Firefox)', value: 'clientWebGL' },
		{ name: 'Client Side - CPU', value: 'clientCPU' }
	];
	selectedPoWOption = this.powOptions[0].value;

	blockOptions = [{ name: this.msg21, value: false }, { name: this.msg22, value: true }];
	selectedBlockOption = this.blockOptions[0].value;
	langService: LangService;
  modalRef: BsModalRef;
  
  constructor(
    private walletService: WalletService,
		private notifications: NotificationService,
		private appSettings: AppSettingsService,
		private addressBook: AddressBookService,
		private pow: PowService,
		private api: ApiService,
		// private ledgerService: LedgerService,
		private workPool: WorkPoolService,
		private price: PriceService,
		private lang: LangService,
		private trans: TranslateService,
    private modalService: BsModalService,
    private router: Router
  ) {
		this.langService = lang;
		this.loadLang();
	}

	async ngOnInit() {
		this.loadFromSettings();
		this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadLang();
		});
  }

  loadLang() {
		this.trans.get('CONFIGURE_APP_WARNINGS.msg1').subscribe((res: string) => {	this.msg1 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg2').subscribe((res: string) => {	this.msg2 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg3').subscribe((res: string) => {	this.msg3 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg4').subscribe((res: string) => {	this.msg4 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg5').subscribe((res: string) => {	this.msg5 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg6').subscribe((res: string) => {	this.msg6 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg7').subscribe((res: string) => {	this.msg7 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg8').subscribe((res: string) => {	this.msg8 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg9').subscribe((res: string) => {	this.msg9 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg10').subscribe((res: string) => {	this.msg10 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg11').subscribe((res: string) => {	this.msg11 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg12').subscribe((res: string) => {	this.msg12 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg13').subscribe((res: string) => {	this.msg13 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg14').subscribe((res: string) => {	this.msg14 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg15').subscribe((res: string) => {	this.msg15 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg16').subscribe((res: string) => {	this.msg16 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg17').subscribe((res: string) => {	this.msg17 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg18').subscribe((res: string) => {	this.msg18 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg19').subscribe((res: string) => {	this.msg19 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg20').subscribe((res: string) => {	this.msg20 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg21').subscribe((res: string) => {	this.msg21 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg22').subscribe((res: string) => {	this.msg22 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg23').subscribe((res: string) => {	this.msg23 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg24').subscribe((res: string) => {	this.msg24 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg25').subscribe((res: string) => {	this.msg25 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg26').subscribe((res: string) => {	this.msg26 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg27').subscribe((res: string) => {	this.msg27 = res;	});
		this.trans.get('CONFIGURE_APP_WARNINGS.msg28').subscribe((res: string) => {	this.msg28 = res;	});
    this.trans.get('CONFIGURE_APP_WARNINGS.msg29').subscribe((res: string) => {	this.msg29 = res;	});
    
    this.trans.get('MANAGE_WALLET_WARNINGS.msg1').subscribe((res: string) => { this.msg30 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg2').subscribe((res: string) => { this.msg31 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg3').subscribe((res: string) => { this.msg32 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg4').subscribe((res: string) => { this.msg33 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg5').subscribe((res: string) => { this.msg34 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg6').subscribe((res: string) => { this.msg35 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg7').subscribe((res: string) => { this.msg36 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg8').subscribe((res: string) => { this.msg37 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg9').subscribe((res: string) => { this.msg38 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg10').subscribe((res: string) => { this.msg39 = res; });
    this.trans.get('MANAGE_WALLET_WARNINGS.msg11').subscribe((res: string) => { this.msg40 = res; });
		this.denominations = [
			{ name: this.msg1, value: 'mqlc' },
			{ name: this.msg2, value: 'kqlc' },
			{ name: this.msg3, value: 'qlc' }
		];

		this.languages = [{ name: this.msg4, value: 'en' }, { name: this.msg5, value: 'cn' }];

		this.storageOptions = [{ name: this.msg6, value: 'localStorage' }, { name: this.msg7, value: 'none' }];

		this.currencies = [
			{ name: this.msg8, value: '' },
			{ name: this.msg9, value: 'USD' },
			{ name: this.msg10, value: 'BTC' },
			{ name: this.msg11, value: 'CNY' }
		];

		this.inactivityOptions = [
			{ name: this.msg12, value: 0 },
			{ name: this.msg13, value: 1 },
			{ name: this.msg14, value: 5 },
			{ name: this.msg15, value: 15 },
			{ name: this.msg16, value: 30 },
			{ name: this.msg17, value: 60 },
			{ name: this.msg18, value: 360 }
		];

		this.lockOptions = [{ name: this.msg19, value: 1 }, { name: this.msg20, value: 0 }];

		this.powOptions = [
			{ name: 'Best Option Available', value: 'best' },
			{ name: 'Client Side - WebGL (Chrome/Firefox)', value: 'clientWebGL' },
			{ name: 'Client Side - CPU', value: 'clientCPU' }
		];

		this.blockOptions = [{ name: this.msg21, value: false }, { name: this.msg22, value: true }];
	}
  
  loadFromSettings() {
		const settings = this.appSettings.settings;

		const matchingLang = this.languages.find(d => d.value === settings.lang);
		this.selectedLang = matchingLang.value || this.languages[0].value;

		const matchingCurrency = this.currencies.find(d => d.value === settings.displayCurrency);
		this.selectedCurrency = matchingCurrency.value || this.currencies[0].value;

		const matchingDenomination = this.denominations.find(d => d.value === settings.displayDenomination);
		this.selectedDenomination = matchingDenomination.value || this.denominations[0].value;

		const matchingStorage = this.storageOptions.find(d => d.value == settings.walletStore);
		this.selectedStorage = matchingStorage.value || this.storageOptions[0].value;

    const matchingInactivityMinutes = this.inactivityOptions.find(d => d.value == settings.lockInactivityMinutes);

		this.selectedInactivityMinutes = matchingInactivityMinutes
			? matchingInactivityMinutes.value
      : this.inactivityOptions[4].value;

		const matchingLockOption = this.lockOptions.find(d => d.value == settings.lockOnClose);
		this.selectedLockOption = matchingLockOption ? matchingLockOption.value : this.lockOptions[0].value;

		const matchingPowOption = this.powOptions.find(d => d.value == settings.powSource);
		this.selectedPoWOption = matchingPowOption ? matchingPowOption.value : this.powOptions[0].value;
	}

	async updateAppSettings() {
		const newStorage = this.selectedStorage;
		const resaveWallet = this.appSettings.settings.walletStore !== newStorage;
		const newCurrency = this.selectedCurrency;
		const reloadFiat = this.appSettings.settings.displayCurrency !== newCurrency;
		const newLang = this.selectedLang;
		const reloadLang = this.appSettings.settings.lang !== newLang;

		const newSettings = {
			walletStore: newStorage,
			lockOnClose: this.selectedLockOption,
			lockInactivityMinutes: this.selectedInactivityMinutes,
			displayDenomination: this.selectedDenomination,
			lang: newLang
		};
		console.log(newSettings);
		this.appSettings.setAppSettings(newSettings);
		this.notifications.sendSuccess(this.msg23);

		if (reloadLang) {
			this.langService.changeLang(newLang); // If swapping the storage engine, resave the wallet
		}

		if (resaveWallet) {
			this.walletService.saveWalletExport(); // If swapping the storage engine, resave the wallet
		}
		if (reloadFiat) {
			// Reload prices with our currency, then call to reload fiat balances.
			await this.price.getPrice(newCurrency);
			this.appSettings.setAppSetting('displayCurrency', newCurrency);
			this.walletService.reloadFiatBalances();
		}
	}

	openModal(template: TemplateRef<any>) {
		// this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
		this.modalRef = this.modalService.show(template);
	}

	async clearWorkCache() {
		try {
			this.workPool.clearCache();
			this.notifications.sendSuccess(this.msg25);
			this.modalRef.hide();
		} catch (err) {}
	}

	async clearAllWalletData() {
		try {
			this.walletService.resetWallet();
			this.walletService.removeWalletData();

			this.notifications.sendSuccess(this.msg27);
			this.modalRef.hide();
		} catch (err) {}
	}

	async clearWalletData() {
		// const UIkit = window['UIkit'];
		try {
			// const confirmMessage = this.msg26;
			// await UIkit.modal.confirm(confirmMessage);
			this.walletService.resetWallet();
			this.walletService.removeWalletData();

			this.notifications.sendSuccess(this.msg27);
		} catch (err) {}
	}

	async clearAll() {
		try {
			this.walletService.resetWallet();
			this.walletService.removeWalletData();

			this.workPool.deleteCache();
			this.addressBook.clearAddressBook();
			this.appSettings.clearAppSettings();

			this.loadFromSettings();

			this.notifications.sendSuccess(this.msg29);
			this.modalRef.hide();
		} catch (err) {}
	}

	async clearAllData() {
		// const UIkit = window['UIkit'];
		try {
			// const confirmMessage = this.msg28;
			// await UIkit.modal.confirm(confirmMessage);
			this.walletService.resetWallet();
			this.walletService.removeWalletData();

			this.workPool.deleteCache();
			this.addressBook.clearAddressBook();
			this.appSettings.clearAppSettings();

			this.loadFromSettings();

			this.notifications.sendSuccess(this.msg29);
		} catch (err) {}
	}

  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      return this.notifications.sendError(this.msg30);
    }
    if (this.newPassword.length < 1) {
      return this.notifications.sendError(this.msg31);
    }
    if (this.walletService.walletIsLocked()) {
      return this.notifications.sendWarning(this.msg32);
    }

    this.walletService.wallet.password = this.newPassword;
    this.walletService.saveWalletExport();

    this.newPassword = '';
    this.confirmPassword = '';
    this.notifications.sendSuccess(this.msg33);
  }

  async exportWallet() {
    if (this.walletService.walletIsLocked()) {
      return this.notifications.sendWarning(this.msg34);
    }

    const exportUrl = this.walletService.generateExportUrl();
    this.QRExportUrl = exportUrl;
    this.QRExportImg = await QRCode.toDataURL(exportUrl);
    this.showQRExport = true;
  }

  copied() {
    this.notifications.sendSuccess(this.msg35);
  }

  seedMnemonic() {
    return bip.entropyToMnemonic(this.wallet.seed);
  }

  async exportAddressBook() {
    const exportData = this.addressBook.addressBook;
    if (exportData.length >= 25) {
      return this.notifications.sendError(this.msg36);
    }
    const base64Data = btoa(JSON.stringify(exportData));
    const exportUrl = `https://wallet.qclchain.online/import-address-book#${base64Data}`;

    this.addressBookQRExportUrl = exportUrl;
    this.addressBookQRExportImg = await QRCode.toDataURL(exportUrl);
    this.addressBookShowQRExport = true;
  }

  exportAddressBookToFile() {
    if (this.walletService.walletIsLocked()) {
      return this.notifications.sendWarning(this.msg32);
    }
    const fileName = `QLC-AddressBook.json`;

    const exportData = this.addressBook.addressBook;
    this.triggerFileDownload(fileName, exportData);

    this.notifications.sendSuccess(this.msg37);
  }

  triggerFileDownload(fileName, exportData) {
    const blob = new Blob([JSON.stringify(exportData)], {
      type: 'application/json'
    });

    // Check for iOS, which is weird with saving files
    const iOS =
      !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      const elem = window.document.createElement('a');
      const objUrl = window.URL.createObjectURL(blob);
      if (iOS) {
        elem.href = `data:attachment/file,${JSON.stringify(exportData)}`;
      } else {
        elem.href = objUrl;
      }
      elem.download = fileName;
      document.body.appendChild(elem);
      elem.click();
      setTimeout(function() {
        document.body.removeChild(elem);
        window.URL.revokeObjectURL(objUrl);
      }, 200);
    }
  }

  exportToFile() {
    if (this.walletService.walletIsLocked()) {
      return this.notifications.sendWarning(this.msg32);
    }

    const fileName = `QLC-Wallet.json`;
    const exportData = this.walletService.generateExportData();
    this.triggerFileDownload(fileName, exportData);

    this.notifications.sendSuccess(this.msg38);
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
        const importData = JSON.parse(fileData);
        if (!importData.length || !importData[0].account) {
          return this.notifications.sendError(this.msg39);
        }

        const walletEncrypted = btoa(JSON.stringify(importData));
        this.router.navigate(['import-address-book'], {
          fragment: walletEncrypted
        });
      } catch (err) {
        this.notifications.sendError(this.msg40);
      }
    };

    reader.readAsText(file);
  }
}
