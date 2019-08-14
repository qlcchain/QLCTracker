import { Component, OnInit, TemplateRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { Router, ChildActivationEnd, ActivatedRoute } from '@angular/router';
import { timer, interval } from 'rxjs';
import { RepresentativeService } from 'src/app/services/representative.service';
import { NotificationService } from 'src/app/services/notification.service';
import { WalletService, WalletAccount } from 'src/app/services/wallet.service';
import { UtilService } from 'src/app/services/util.service';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { TranslateService } from '@ngx-translate/core';
import BigNumber from 'bignumber.js';
import { AddressBookService } from 'src/app/services/address-book.service';
import * as QRCode from 'qrcode';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalUnlockComponent } from '../modal-unlock/modal-unlock.component';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss']
})
export class MyaccountComponent implements OnInit {

  wallet = this.walletService.wallet;

  accountHistory: any[] = [];
	pendingBlocks = [];
	successfulBlocks = [];
  pageSize = 10;
  accountBlocksCount = 0;
	maxPageSize = 200;

  routerSub = null;

  repLabel: any = '';
	addressBookEntry: any = null;
	//accountMeta: any = {};
	//otherTokens: any = [];
	accountId = '';

  walletAccount:WalletAccount ;
  
	modalRef: BsModalRef;
  
  qrCodeImage = null;
  
  showEditName = false;
	addressBookTempName = '';
	addressBookModel = '';
	showEditRepresentative = false;
	representativeModel = '';
	//representativeResults$ = new BehaviorSubject([]);
	showRepresentatives = false;
	representativeListMatch = '';
  isNaN = isNaN;

  processingPending = false;
  processingPendingBlocks = [];
  
  msg1 = '';
	msg2 = '';
	msg3 = '';
	msg4 = '';
	msg5 = '';
	msgEdit1 = '';
  msgEdit2 = '';
  
  constructor(
		private router: ActivatedRoute,
		private route: Router,
		private api: ApiService,
		private repService: RepresentativeService,
		private notifications: NotificationService,
		public walletService: WalletService,
    private util: UtilService,
    private node: NodeService,
		public settings: AppSettingsService,
		private trans: TranslateService,
		private notificationService: NotificationService,
		private addressBook: AddressBookService,
		private modalService: BsModalService
  ) {  }

  async ngOnInit() {
    this.routerSub = this.route.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.load(); // Reload the state when navigating to itself from the transactions page
			}
		});
    this.load();
        this.loadLang();
  }
  
  ngOnDestroy() {
		if (this.routerSub) {
			this.routerSub.unsubscribe();
		}
  }
  
  loadLang() {
		this.trans.get('RECEIVE_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res;	});
		this.trans.get('RECEIVE_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res;	});
		this.trans.get('RECEIVE_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res;	});
		this.trans.get('RECEIVE_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res;	});
		this.trans.get('RECEIVE_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res;	});
		this.trans.get('ACCOUNT_DETAILS_WARNINGS.msg5').subscribe((res: string) => {	this.msgEdit1 = res; });
		this.trans.get('ACCOUNT_DETAILS_WARNINGS.msg6').subscribe((res: string) => {	this.msgEdit2 = res; });
	}

	showUnlock() {
		this.modalRef = this.modalService.show(ModalUnlockComponent, {class: 'modal-lg'}); 
	}

	load() {
		if (this.node.status === true) {
			this.loadAccount();
		} else {
			this.reload();
		}
	}

	async reload() {
		const source = timer(200);
		const abc =  source.subscribe(async val => {
				this.load();
		});
  }
  
  async loadAccount() {
    //this.pendingBlocks = [];
    this.accountId = this.router.snapshot.params.account;
    if (this.accountId == undefined || this.accountId == '')
      this.accountId = this.wallet.accounts[0].accountMeta.account;

    this.walletAccount = this.wallet.accounts.find(a => a.id === this.accountId);
    this.addressBookEntry = this.addressBook.getAccountName(this.accountId);
		this.addressBookModel = this.addressBookEntry || '';
		const tokenMap = {};
		const tokens = await this.api.tokens();
		if (!tokens.error) {
			tokens.result.forEach(token => {
				tokenMap[token.tokenId] = token;
			});
		}

		// fill account meta
		const accountInfo = await this.api.accountInfo(this.accountId);
		if (!accountInfo.error) {
			const am = accountInfo.result;
			for (const token of am.tokens) {
				if (tokenMap.hasOwnProperty(token.type)) {
					token.tokenInfo = tokenMap[token.type];
				}
			}
			this.walletAccount.accountMeta = am;
    }
    
		let accountMeta = [];
		this.walletAccount.otherTokens = [];
    if (accountInfo.result && accountInfo.result.tokens && Array.isArray(accountInfo.result.tokens)) {
      accountInfo.result.tokens.forEach(token => {
				accountMeta[token.tokenName] = token;
				if (token.tokenInfo.tokenSymbol != 'QLC' && token.tokenInfo.tokenSymbol != 'QGAS') {
					this.walletAccount.otherTokens.push(token);
				}
      });
    }
		this.walletAccount.balances = accountMeta;

		/*if (this.walletAccount.accountMeta && this.walletAccount.accountMeta.tokens) {
			this.repLabel = null;
			const filter = this.walletAccount.accountMeta.tokens.filter(token => {
				return token.type === this.api.qlcTokenHash;
			});
			if (filter.length > 0) {
				const knownRepresentative = this.repService.getRepresentative(filter.rep);
				this.repLabel = knownRepresentative ? knownRepresentative.name : null;
			}
		}*/

		if (this.walletAccount.accountMeta.error) {
			const pendingRaw = this.pendingBlocks.reduce(
				(prev: BigNumber, current: any) => prev.plus(new BigNumber(current.amount)),
				new BigNumber(0)
			);
			this.walletAccount.accountMeta.pending = pendingRaw;
		}

		await this.getAccountHistory(this.accountId);

    const qrCode = await QRCode.toDataURL(`${this.accountId}`);
    this.qrCodeImage = qrCode;

    
    const accountBlocksCount = await this.api.accountBlocksCount(this.accountId);
    if (typeof(accountBlocksCount.result) == 'number')
      this.accountBlocksCount = accountBlocksCount.result;
      
    
  }

  checkIfPending(token) {
    if (typeof(this.walletAccount) != 'undefined' && typeof(this.walletAccount.pendingPerTokenCount) != 'undefined' && typeof(this.walletAccount.pendingPerTokenCount[token]) != 'undefined')
      return true;
    else
      return false;

  }


  async getAccountHistory(account, resetPage = true) {

		if (resetPage) {
			this.pageSize = 25;
		}
		const accountHistory = await this.api.accountHistory(account, this.pageSize);
		// const additionalBlocksInfo = [];

		this.walletAccount.latestTransactions = [];
		if (!accountHistory.error) {
			const tokenMap = {};
			const tokens = await this.api.tokens();
			if (!tokens.error) {
				tokens.result.forEach(token => {
					tokenMap[token.tokenId] = token;
				});
			}
			const historyResult = accountHistory.result;
			for (const block of historyResult) {
				// For Open and receive blocks, we need to look up block info to get originating account
				if (block.type === 'Open' || block.type === 'Receive' || block.type === 'ContractReward') {
					const preBlock = await this.api.blocksInfo([block.link]);
					if (!preBlock.error) {
						block.link_as_account = preBlock.result[0].address;
					}
				} else if (block.type === 'ContractSend') {
					block.link_as_account = block.address;
				} else {
					block.link_as_account = this.util.account.getPublicAccountID(this.util.hex.toUint8(block.link));
				}
				if (tokenMap.hasOwnProperty(block.token)) {
					block.tokenInfo = tokenMap[block.token];
				}
				this.walletAccount.latestTransactions.push(block);
			}
			this.walletAccount.latestTransactions = this.walletAccount.latestTransactions.filter(h => h.type !== 'Change');
		}
  }

  editName() {
		this.showEditName = true;
		this.addressBookTempName = this.addressBookModel;
	}
	editNameCancel() {
		this.showEditName = false;
		this.addressBookModel = this.addressBookTempName;
		this.addressBookTempName = '';
	}
	async editNameSave() {
		const addressBookName = this.addressBookModel.trim();
		if (!addressBookName) {
			this.addressBook.deleteAddress(this.accountId);
			this.notificationService.sendSuccess(this.msgEdit1);
			this.showEditName = false;
			return;
		}

		try {
			await this.addressBook.saveAddress(this.accountId, addressBookName);
		} catch (err) {
			this.notificationService.sendError(err.message);
			return;
		}

		this.notificationService.sendSuccess(this.msgEdit2);
		this.showEditName = false;
  }
  
  openModal(template: TemplateRef<any>) {
		this.modalRef = this.modalService.show(template);
  }
  
  claim(token) {

  }

  async receive(token) {
		if (this.walletService.walletIsLocked()) {
			this.modalRef = this.modalService.show(ModalUnlockComponent, {class: 'modal-lg'}); 
		}
  }


}
