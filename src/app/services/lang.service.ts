import { Injectable } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppSettingsService } from './app-settings.service';

@Injectable({
	providedIn: 'root'
})
export class LangService {
	lang = 'en';
	languages = ['en', 'cn'];
	currentUrl = '';
	activeLinkClassString = 'active';
	enActive = 'active';
	cnActive = '';
	langClass = '';

	emailsendbutton = 'Subscribe for updates';
	emailsendStatus = false;
	emailsendbuttonDefault = 'Subscribe for updates';
	emailsendbuttonSending = 'Sending, please wait';
	emailsendbuttonSuccessmsg = 'CHECK YOUR E-MAIL FOR CONFIRMATION';

	constructor(private translate: TranslateService, private router: Router, private appSettings: AppSettingsService) {
		translate.setDefaultLang('en');
		this.currentUrl = this.getUrlSlug();
		const settings = this.appSettings.settings;

		// console.log('langService');
		this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
			this.changeLang(event.lang);
			this.loadSubscribeTranslation();
		});
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.currentUrl = this.getUrlSlug();
				// console.log('currentUrl: ' + this.currentUrl);
				this.changeLang(this.appSettings.settings.lang);
				/*this.translate.get('NAV.accounts').subscribe((res: string) => {
                    console.log(res);
                   });*/
			}
		});
	}

	loadSubscribeTranslation() {
		this.translate.get('SUBSCRIBE.EMAILSENDBUTTON').subscribe((res: string) => {
			this.emailsendbutton = res;
			this.emailsendbuttonDefault = res;
		});
		this.translate.get('SUBSCRIBE.EMAILSENDBUTTONSENDING').subscribe((res: string) => {
			this.emailsendbuttonSending = res;
		});
		this.translate.get('SUBSCRIBE.EMAILSENDBUTTONSUCCESSMSG').subscribe((res: string) => {
			this.emailsendbuttonSuccessmsg = res;
		});
	}

	getUrlSlug() {
		const hash = this.router.url.split('#');
		const path = hash[0].split('/');
		if (path[1] === '401.shtml') {
			path[1] = '';
		}
		let currentUrlSlug = path[1];
		if (this.slugIsLang(currentUrlSlug)) {
			// console.log('lang: ' + path[1]);
			if (path[2] != null && path[2] !== '401.shtml') {
				currentUrlSlug = path[2];
			} else {
				currentUrlSlug = '';
			}
		}
		// console.log(currentUrlSlug);
		return currentUrlSlug;
	}

	getCustomUrlSlug(slug) {
		const hash = slug.split('#');
		const path = hash[0].split('/');
		if (path[1] === '401.shtml') {
			path[1] = '';
		}
		let currentUrlSlug = path[1];
		if (this.slugIsLang(currentUrlSlug)) {
			// console.log('lang: ' + path[1]);
			if (path[2] != null && path[2] !== '401.shtml') {
				currentUrlSlug = path[2];
			} else {
				currentUrlSlug = '';
			}
		}
		// console.log(currentUrlSlug);
		return currentUrlSlug;
	}

	slugIsLang(lang) {
		if (this.languages.indexOf(lang) !== -1) {
			if (lang !== this.lang) {
				this.changeLang(lang);
			}
			return true;
		}
		return false;
	}

	changeLang(lang: string) {
		// console.log('changeLang' + lang);
		this.enActive = '';
		this.cnActive = '';
		this.langClass = '';
		switch (lang) {
			case 'cn':
				this.lang = 'cn';
				this.cnActive = this.activeLinkClassString;
				this.translate.use('cn');
				break;
			case 'en':
				this.lang = 'en';
				this.enActive = this.activeLinkClassString;
				this.translate.use('en');
				break;
			default:
				this.lang = 'en';
				this.enActive = this.activeLinkClassString;
				this.translate.use('en');
		}
	}
}
