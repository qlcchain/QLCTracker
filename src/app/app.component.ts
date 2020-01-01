import { Component } from '@angular/core';
import { WorkPoolService } from './services/work-pool.service';
import { AppSettingsService } from './services/app-settings.service';
import { NotificationService } from './services/notification.service';
import { NodeService } from './services/node.service';
import { LangService } from './services/lang.service';
import { WalletService } from './services/wallet.service';
import { PriceService } from './services/price.service';
import { AddressBookService } from './services/address-book.service';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service';

import { environment } from '../environments/environment';
import { QLCWebSocketService } from './services/qlc-websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
	wallet = this.walletService.wallet;
	showUpdate = false;
	updateText = '';
	updateLink = '';
	updateBreak = 0;

	desktop = false;

	constructor(
		private walletService: WalletService,
		private addressBook: AddressBookService,
		public settings: AppSettingsService,
		private notifications: NotificationService,
		public node: NodeService,
		private router: Router,
		private workPool: WorkPoolService,
		public price: PriceService,
		private lang: LangService,
		private api: ApiService,
		private webSocket: QLCWebSocketService
	) {
		if (environment.desktop) {
			this.desktop = true;
		}
		//this.desktop = true;
	}

	async ngOnInit() {
		// When the page closes, determine if we should lock the wallet
		window.addEventListener('beforeunload', e => {
			if (this.wallet.locked) {
				return; // Already locked, nothing to worry about
			}
			if (this.settings.settings.lockOnClose === 1) {
				this.walletService.lockWallet();
			}
		});
		window.addEventListener('unload', e => {
			if (this.wallet.locked) {
				return; // Already locked, nothing to worry about
			}
			if (this.settings.settings.lockOnClose === 1) {
				this.walletService.lockWallet();
			}
		});
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				//(<any>window).ga('set', 'page', event.urlAfterRedirects);
				//(<any>window).ga('send', 'pageview');
				//googleAnalytics(event.urlAfterRedirects);
			}
			if (!(event instanceof NavigationEnd)) {
				return;
			}
			window.scrollTo(0, 0);
		});
		this.webSocket.connect();
    	this.addressBook.loadAddressBook();
		await this.walletService.loadStoredWallet();
		this.settings.loadAppSettings();
		this.workPool.loadWorkCache();

		this.updates();
	}

	async updates() {
		const updatesQuery = await this.api.updates();
		if (updatesQuery.result && updatesQuery.result != '') {
			this.showUpdate = true;
			this.updateText = updatesQuery.result.title;
			this.updateLink = updatesQuery.result.link;
			this.updateBreak = updatesQuery.result.break;
			if (this.updateBreak == 1) {
				this.node.break = true;
			} else {
				this.node.break = false;
			}
		}
	}

	closeUpdate() {
		this.showUpdate = false;
	}

}
