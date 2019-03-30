import { Component, OnInit, TemplateRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { WalletService } from 'src/app/services/wallet.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

declare var particlesJS: any;
declare var jQuery: any;
declare var require: any;

declare global {
  interface Window { jQuery: any; $: any; }
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  wallet = this.walletService.wallet;
  search_text = '';

  modalRef: BsModalRef;

  unlockPassword = '';

  msg1 = '';
	msg2 = '';
	msg3 = '';
	msg4 = '';
	msg5 = '';

  constructor(
    public walletService: WalletService,
    private notificationService: NotificationService,
    private trans: TranslateService,
    private router: Router,
		private modalService: BsModalService
  ) 
  { 
    this.loadLang();
  }

  ngOnInit() {
    
    if (environment.desktop) {
      window.jQuery = window.$ = require('node_modules/jquery/dist/jquery.js');
      particlesJS.load('particles-js', 'assets/data/particles.json', function() { console.log('callback - particles.js config loaded'); });
    } else {
      particlesJS.load('particles-js', '../../assets/data/particles.json', function() { console.log('callback - particles.js config loaded'); });
    }
    (function ($) {
      var myTarget;
      $('.menu-close').on('click', function (e) {
        e.preventDefault();
        $('.menu-sub-holder').removeClass('active');
      });
      $('.sub-left').on('click', function (e) {
        e.preventDefault();
        $('.menu-sub-holder').removeClass('active');
      });
      $('.menu-item').on('click', function (e) {
        e.preventDefault();
        myTarget = $(this).attr('data-link');
        $('.'+myTarget).addClass('active');
        if(myTarget == 'menu-sub-search') $('.search-text').focus();
      });
      $('.menu-search-field').on('click', function (e) {
        e.preventDefault();
        myTarget = $(this).attr('data-link');
        $('.'+myTarget).addClass('active');
        $('.search-text').focus();
      });
    
    
    
    
      $(window).click(function() {
        //Hide the menus if visible
        $('.menu-sub-holder').removeClass('active');
      });
      
      $('.qlc-menu').click(function(event){
        event.stopPropagation();
      });
    
    
    
    
    
    
      $('.navbar-toggler').on('click', function (e) {
        e.preventDefault();
        $('.navbar').toggleClass('open');
      });
      
      $('.table-button-expand').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass('closed');
        $(this).closest('div').next().toggleClass('open');
      });
      
      $('.table-button-tokens').on('click', function (e) {
        e.preventDefault();
        $('.qlc-table-extra-token').toggleClass('closed');
        $('.link-token-toggle').toggleClass('closed');
      });
      
      /* LANG SELECT */
      $('.qlc-top-language').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).toggleClass('open');
        $('.qlc-top-language-selector').toggleClass('open');
      });	
      
      $(window).click(function() {
        var langMenuState = $('.qlc-top-language-selector').hasClass('open');
        if (langMenuState === true) {
          $('.qlc-top-language').toggleClass('open');
          $('.qlc-top-language-selector').toggleClass('open');
        }
      });
    
      $('.qlc-top-language-selector').click(function(e){
        e.stopPropagation();
      });
      $('.qlc-top-language-but').click(function(e){
        e.preventDefault();
        e.stopPropagation();
        $('.qlc-top-language').toggleClass('open');
        $('.qlc-top-language-selector').toggleClass('open');
      });
      
      /* TOOLTIP INIT */
      /*$(function () {
          $('[data-toggle="tooltip"]').tooltip();
      });*/
    })(jQuery);
  }


  async lockWallet() {
		if (this.wallet.type === 'ledger') {
			return; // No need to lock a ledger wallet, no password saved
		}
		if (!this.wallet.password) {
			return this.notificationService.sendWarning(this.msg3);
		}
		const locked = await this.walletService.lockWallet();
		if (locked) {
      this.notificationService.sendSuccess(this.msg4);
		} else {
			this.notificationService.sendError(this.msg5);
		}
  }

  async unlockWalletConfirm() {
		const unlocked = await this.walletService.unlockWallet(this.unlockPassword);
		this.unlockPassword = '';

		if (unlocked) {
      this.notificationService.sendSuccess(this.msg1);
      this.modalRef.hide();
		} else {
			this.notificationService.sendError(this.msg2);
		}

    this.unlockPassword = '';
  }
  
  loadLang() {
    this.trans.get('WALLET_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res; });
		this.trans.get('WALLET_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res; });
		this.trans.get('WALLET_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res; });
		this.trans.get('WALLET_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res; });
		this.trans.get('WALLET_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res; });
	}

  
  search() {
    if ((this.search_text.startsWith('qlc_1') || this.search_text.startsWith('qlc_3')) && this.search_text.length === 64) {
      this.router.navigate(['/account/'+this.search_text]);
    } else if(this.search_text.length === 64) {
      this.router.navigate(['/transaction/'+this.search_text]);
    } else {
      this.router.navigate(['/search/'+btoa(this.search_text)]);
    }
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
}
