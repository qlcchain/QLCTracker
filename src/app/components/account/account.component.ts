import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

import BigNumber from 'bignumber.js';
import { timer } from 'rxjs';
import { NodeService } from 'src/app/services/node.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import * as QRCode from 'qrcode';

@Component({
	selector: 'app-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
	
	accountHistory: any[] = [];
	pendingBlocks = [];
	pendingSum = 0;
	pageSize = 10;

	accountBlocksCount = 0;
	
	accountMeta: any = {};
	accountId = '';
	
	routerSub = null;
	
	modalRef: BsModalRef;
	
	qrCodeImage = null;
	
	showEditName = false;
	addressBookTempName = '';
	addressBookModel = '';
	
	
	constructor(
		private router: ActivatedRoute,
		private route: Router,
		private api: ApiService,
		private node: NodeService,
		private modalService: BsModalService
		) 
	{
		
	}
	
	async ngOnInit() {
		this.routerSub = this.route.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.loadAccountDetails(); // Reload the state when navigating to itself from the transactions page
			}
		});
		this.load();
	}
	
	load() {
		if (this.node.status === true) {
			this.loadAccountDetails();
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
	
	async loadAccountDetails() {
		this.accountId = this.router.snapshot.params.account;
		try {
			const tokenMap = {};
			const tokens = await this.api.tokens();
			if (!tokens.error) {
				tokens.result.forEach(token => {
					if (token.tokenSymbol != 'QLC' && token.tokenSymbol != 'QGAS') {
						token.image = 'none';
					} else {
						token.image = token.tokenSymbol;
					}
					tokenMap[token.tokenId] = token;
				});
			}
			const accountInfo = await this.api.accountInfo(this.accountId);
			this.accountMeta = {};
			if (!accountInfo.error) {
				const am = accountInfo.result;
				for (const token of am.tokens) {
					if (tokenMap.hasOwnProperty(token.type)) {
						token.tokenInfo = tokenMap[token.type];
					}
				}
				this.accountMeta = am;
			}
			console.log(this.accountMeta);
			
			this.pendingBlocks = [];
			this.pendingSum = 0;
			
			const accountPending = await this.api.accountsPending([this.accountId], 25);
			if (!accountPending.error && accountPending.result) {
				const pendingResult = accountPending.result;
				
				for (const account in pendingResult) {
					if (!pendingResult.hasOwnProperty(account)) {
						continue;
					}
					
					
					pendingResult[account].forEach(pending => {
						if (tokenMap.hasOwnProperty(pending.type)) {
							pending.tokenInfo = tokenMap[pending.type];
						}
						this.pendingBlocks.push({
							account: pending.source,
							amount: pending.amount,
							token: pending.tokenName,
							timestamp: pending.timestamp,
							//addressBookName: this.addressBook.getAccountName(pending.source) || null,
							tokenInfo: pending.tokenInfo,
							hash: pending.hash
						});
						this.pendingSum += Number(pending.amount)
					});
				}
			}
			// }
			
			// If the account doesnt exist, set the pending balance manually
			if (this.accountMeta.error) {
				const pendingRaw = this.pendingBlocks.reduce(
					(prev: BigNumber, current: any) => prev.plus(new BigNumber(current.amount)),
					new BigNumber(0)
					);
					this.accountMeta.pending = pendingRaw;
				}
				
				this.accountHistory = [];
				await this.getAccountHistory(this.accountId);
				const accountBlocksCount = await this.api.accountBlocksCount(this.accountId);
				this.accountBlocksCount = accountBlocksCount.result;

			} catch (error) {
				console.log(error);
			}
			const qrCode = await QRCode.toDataURL(`${this.accountId}`);
			this.qrCodeImage = qrCode;
		}
		
		async getAccountHistory(account, resetPage = true) {
			if (resetPage) {
				this.pageSize = 10;
			}
			const accountHistory = await this.api.accountHistory(account, this.pageSize, 0);
			// const additionalBlocksInfo = [];
			
			this.accountHistory = [];
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
					if (block.type === 'Open' || block.type === 'Receive') {
						const preBlock = await this.api.blocksInfo([block.link]);
						if (!preBlock.error && typeof(preBlock.result[0]) != 'undefined' && preBlock.result.length > 0 ) {
							block.link_as_account = preBlock.result[0].address;
						}
					} else {
						const link_as_account = await this.api.accountForPublicKey(block.link);
						if (!link_as_account.error && typeof(link_as_account.result) != 'undefined') {
							block.link_as_account = link_as_account.result;
						}
					}
					if (tokenMap.hasOwnProperty(block.token)) {
						block.tokenInfo = tokenMap[block.token];
					}
					this.accountHistory.push(block);
				}
				this.accountHistory = this.accountHistory.filter(h => h.type !== 'Change');
			}
		}
		openModal(template: TemplateRef<any>) {
			this.modalRef = this.modalService.show(template);
		}
	}
		