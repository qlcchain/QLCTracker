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
	pageSize = 25;

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
			
			
			console.log(this.accountId);
			const tokenMap = {};
			const tokens = await this.api.tokens();
			if (!tokens.error) {
				tokens.result.forEach(token => {
					tokenMap[token.tokenId] = token;
				});
			}
			const accountInfo = await this.api.accountInfo(this.accountId);
			console.log(accountInfo);
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
			console.log(tokens);
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
						this.pendingBlocks.push({
							account: pending.pendingInfo.source,
							amount: pending.pendingInfo.amount,
							token: pending.tokenName,
							// TODO: fill timestamp
							// timestamp: accountPending.blocks[block].timestamp,
							//addressBookName: this.addressBook.getAccountName(pending.pendingInfo.source) || null,
							hash: pending.hash
						});
						this.pendingSum += parseInt(pending.pendingInfo.amount)
					});
				}
				console.log(this.pendingBlocks);
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
				
				// Set fiat values?
				// this.accountMeta.balanceRaw = new BigNumber(this.accountMeta.balance || 0).mod(this.qlc);
				// this.accountMeta.pendingRaw = new BigNumber(this.accountMeta.pending || 0).mod(this.qlc);
				// this.accountMeta.balanceFiat = this.util.qlc
				// 	.rawToMqlc(this.accountMeta.balance || 0)
				// 	.times(this.price.price.lastPrice)
				// 	.toNumber();
				// this.accountMeta.pendingFiat = this.util.qlc
				// 	.rawToMqlc(this.accountMeta.pending || 0)
				// 	.times(this.price.price.lastPrice)
				// 	.toNumber();
				this.accountHistory = [];
				await this.getAccountHistory(this.accountId);
				console.log(this.accountHistory);
				console.log(this.pendingBlocks);
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
				this.pageSize = 25;
			}
			const accountHistory = await this.api.accountHistory(account, this.pageSize);
			// const additionalBlocksInfo = [];
			
			this.accountHistory = [];
			if (!accountHistory.error) {
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
							console.log(link_as_account.result);
							block.link_as_account = link_as_account.result;
						}
					}
					this.accountHistory.push(block);
				}
				this.accountHistory = this.accountHistory.filter(h => h.type !== 'Change');
			}
			console.log('accountHistory');
			console.log(this.accountHistory);
		}
		openModal(template: TemplateRef<any>) {
			this.modalRef = this.modalService.show(template);
		}
	}
		