import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { NodeService } from './node.service';

import { httpProvider } from 'qlc.js/provider/HTTP';
import Client from 'qlc.js/client';
import { methods } from 'qlc.js/common';
import { timer } from 'rxjs';

import  uuid from 'uuid/v4';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	rpcUrl = environment.rpcUrl[environment.qlcChainNetwork];
	alive = true;
	connectTimer = null;
	reconnectTime = 1000;
	reconnectInterval = 500;
	reconnectTimeMax = 10000;

	public nodeBlocksCount = 0;
	public nodeMainBlocksCount = 0;
	
	private HTTP_RPC = new httpProvider(this.rpcUrl);
	c = new Client(this.HTTP_RPC, () => {});
	
	qlcTokenHash = 'a7e8fa30c063e96a489a47bc43909505bd86735da4a109dca28be936118a8582';

	constructor(private http: HttpClient, private node: NodeService) {
		//this.connectInterval.pipe(takeUntil(() => this.node.status)).subscribe()
		this.connect();
	}

	async connect() {
		const source = timer(this.reconnectTime);
		this.connectTimer = source.subscribe(async val => {
			if (!environment.desktop || (environment.desktop && this.node.running)) {
				this.reconnectTime = this.reconnectTime + this.reconnectInterval;
					if (this.reconnectTime > this.reconnectTimeMax)
						this.reconnectTime = this.reconnectTimeMax;

				try {
					const syncQuery = await this.syncing();
					//console.log(syncQuery);
					if (typeof syncQuery.result != undefined) {
						this.node.setOnline();
						
						if ( syncQuery.result == true) {
							this.node.setSynchronizing();
							this.connect();
						} else {
							if (this.rpcUrl != environment.mainRpcUrl) {
								const blocksMainQuery = await this.blocksCountMain();
								const blocksQuery = await this.blocksCount();
								this.nodeMainBlocksCount = blocksMainQuery.result.count;
								this.nodeBlocksCount = blocksQuery.result.count;
								//console.log('mainBlocksCount ' + ' ' + mainBlocksCount + ' nodeBlocksCount ' + ' ' + nodeBlocksCount + ' unchecked ' + ' ' + blocksQuery.result.unchecked)
								if (this.nodeBlocksCount < this.nodeMainBlocksCount) {
									this.node.setSynchronizing();
									this.connect();
								} else {
									this.node.setSynchronized();
								}
								return;
								
							} else {
								this.node.setSynchronized();
							}
						}
					} else if (syncQuery.error) {
						console.log(syncQuery.error);
						this.connect();
					} else {
						console.log('error connecting');
						this.connect();
					}
				} catch (error) {
					console.log('error connecting');
					console.log(error);
					this.node.setOffline('ERROR - Node offline, reconnecting ...');
					this.connect();
				}
			} else {
				this.connect();
			}

			

			
		});
	}

	async reconnect(error = 'error') {
		console.log('reconnect ' + error);
		this.node.setOffline('ERROR - connection problem. Reconnecting.');
		this.connect();
	}

	async accountPublicKey(account: string): Promise<{ result: string; error?: string }> {
		try {
			return await this.c.request(methods.account.accountPublicKey, account);
		} catch (err) {
			return err;
		}
	}

	async accounts(count:Number = 0, offset:Number = 0): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.accounts(count,offset);
		if (!result.result && !result.error) 
			this.reconnect();
		return result;
	}
	
	async accountsCount(): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request( methods.ledger.accountsCount );
		} catch (err) {
			return err;
		}
	}

	async accountsBalances(accounts: string[]): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountsBalances, accounts);
		} catch (err) {
			return err;
		}
	}

	async accountsFrontiers(accounts: string[]): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountsFrontiers, accounts);
		} catch (err) {
			return err;
		}
	}

	async accountsPending(accounts: string[], count: number = 500): Promise<{ result?: any; error?: string }> {
		if (environment.desktop && !this.node.running) {
			const errorMsg = {
				error: 'Node is not running.'
			}
			return errorMsg;
		}
		if (this.node.synchronized === false) {
			const errorMsg = {
				error: 'Node is not synchronized.'
			}
			return errorMsg;
		}
		const result = await this.c.buildinLedger.accountsPending(accounts,count);
		if (!result.result && !result.error) 
			this.reconnect('accountsPending');
		return result;
	}

	async delegatorsCount(account: string): Promise<{ count: string }> {
		try {
			return await this.c.request(methods.ledger.delegatorsCount, account);
		} catch (err) {
			return err;
		}
	}

	async onlineRepresentatives(): Promise<{ result: any }> {
		try {
			return await this.c.request(methods.net.onlineRepresentatives);
		} catch (err) {
			return err;
		}
	}

	async representatives(order = true): Promise<{ result: any }> {
		try {
			return await this.c.request(methods.ledger.representatives, order);
		} catch (err) {
			return err;
		}
	}

	async accountVotingWeight(account): Promise<{ result: any }> {
		try {
			return await this.c.request(methods.ledger.accountVotingWeight, account);
		} catch (err) {
			return err;
		}
	}

	async blocksInfo(blocks): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.blocksInfo, blocks);
		} catch (err) {
			return err;
		}
	}

	async blockHash(block): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.blockHash, block);
		} catch (err) {
			return err;
		}
	}

	async process(block): Promise<{ result?: string; error?: string }> {
		if (this.node.synchronized === false) {
			const errorMsg = {
				error: 'Node is not synchronized.'
			}
			return errorMsg;
		}
		if (this.node.break === true) {
			const errorMsg = {
				error: 'Don\'t process.'
			}
			return errorMsg;
		}
		try {
			return await this.c.request(methods.ledger.process, block);
		} catch (err) {
			return err;
		}
	}

	async accountBlocksCount(account): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.accountBlocksCount(account);
		if (typeof(result.result) != 'number' && !result.error) 
			this.reconnect('accountBlocksCount');
		return result;
	}

	

	async accountHistory(account, count = 25, offset = 0): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountHistoryTopn, account, count, offset);
		} catch (err) {
			return err;
		}
	}

	async accountInfo(account): Promise<{ result?: any; error?: any }> {
		if (environment.desktop && !this.node.running) {
			const errorMsg = {
				error: 'Node is not running.'
			}
			return errorMsg;
		}
		try {
			return await this.c.request(methods.ledger.accountInfo, account);
		} catch (err) {
			return err;
		}
	}

	async validateAccountNumber(account): Promise<{ result: true | false }> {
		try {
			return await this.c.request(methods.account.accountValidate, account);
		} catch (err) {
			return err;
		}
	}

	async tokens(): Promise<{ result?: any; error?: string }> {
		if (environment.desktop && !this.node.running) {
			const errorMsg = {
				error: 'Node is not running.'
			}
			return errorMsg;
		}
		try {
			return await this.c.request(methods.ledger.tokens);
		} catch (err) {
			return err;
		}
	}

	async blocks(count:Number = 0, offset:Number = 0): Promise<{ result?: any; error?: string }> {
		if (environment.desktop && !this.node.running) {
			const errorMsg = {
				error: 'Node is not running.'
			}
			return errorMsg;
		}
		const result = await this.c.buildinLedger.blocks(count,offset);
		if (!result.result && !result.error) 
			this.reconnect('blocks');

		return result;
	}
	
	async blocksCount(): Promise<{ result?: any; error?: string }> {
		if (environment.desktop && !this.node.running) {
			const errorMsg = {
				error: 'Node is not running.'
			}
			return errorMsg;
		}
		try {
			return await this.c.request( methods.ledger.blocksCount );
		} catch (err) {
			return err;
		}
	}
	
	async accountForPublicKey(account: string): Promise<{ result: any; error?: any }> {
		try {
			return await this.c.request( methods.account.accountForPublicKey, account );
		} catch (err) {
			return err;
		}
	}
	
	async blockAccount(account): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request( methods.ledger.blockAccount, account );
		} catch (err) {
			return err;
		}
	}

	async tokenInfoByName(tokenName): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.tokenInfoByName(tokenName);
		if (!result.result && !result.error) 
			this.reconnect('tokenInfoByName');
		return result;
	}
	
	async tokenByHash(tokenHash): Promise<any> {
		const tokens = await this.tokens();
		if (!tokens.error) {
			const tokenResult = tokens.result;
			return tokenResult.filter(token => {
				if (token.tokenId === tokenHash) {
					return token;
				}
			});
		}
		
		return null;
	}
	
	//TODO: remove token hash
	async accountInfoByToken(account, tokenHash = this.qlcTokenHash): Promise<any> {
		const am = await this.accountInfo(account);
		/*if (am.error) {
			return null;
		}*/
		const tokens = am.result.tokens;
		
		return Array.isArray(tokens) ? tokens.filter(tokenMeta => tokenMeta.type === tokenHash)[0] : null;
	}


	// sms
	async phoneBlocks(phoneNumber:string): Promise<{ result: any; error?: string }> {
		const result = await this.c.buildinLedger.phoneBlocks(phoneNumber);
		if (!result.result && !result.error) 
			this.reconnect('phoneBlocks');

		return result;
	}

	

	private async request(action, data, rpc = ''): Promise<any> {
		data.jsonrpc = '2.0';
		data.method = action;
		data.id = uuid();
		const url = (rpc != '')? rpc : this.rpcUrl;

		return await this.http
			.post(url, data)
			.toPromise()
			.then(res => {
				return res;
			})
			.catch(err => {
				if (err.status === 500 || err.status === 0) {
				}
				throw err;
			});
	}
	
	// rewards 
	async getTotalRewards(txid: string): Promise<{ result: any; error?: any }> {
		return await this.request('rewards_getTotalRewards', { params: [txid] });
	}

	async getReceiveRewardBlock(txid: string): Promise<{ result?: any; error?: any }> {
		if (this.node.break === true) {
			const errorMsg = {
				error: 'Don\'t process.'
			}
			return errorMsg;
		}
		return await this.request('rewards_getReceiveRewardBlock', { params: [txid] });
	}

	async getConfidantRewardsDetail(account: string): Promise<{ result: any; error?: any }> {
		return await this.request('rewards_getConfidantRewordsDetail', { params: [account] });
	}

	async getConfidantRewards(account: string): Promise<{ result: any; error?: any }> {
		return await this.request('rewards_getConfidantRewards', { params: [account] });
	}
	
	async getTotalPledgeAmount(): Promise<{ result: any; error?: any }> {
		return await this.request('pledge_getTotalPledgeAmount', { params: [] });
	}

	
	async messageHash(message:string): Promise<{ result: any; error?: any }> {
		const result = await this.c.buildinLedger.messageHash(message);
		if (!result.result && !result.error) 
			this.reconnect('messageHash');

		return result;
	}

	async messageBlocks(messageHash:string): Promise<{ result: any; error?: any }> {
		const result = await this.c.buildinLedger.messageBlocks(messageHash);
		if (!result.result && !result.error) 
			this.reconnect('messageBlocks');

		return result;
	}

	async blockConfirmedStatus(hash:string): Promise<{ result: any; error?: any }> {
		const result = await this.request('ledger_blockConfirmedStatus', { params: [hash] });
		if (typeof result.result == 'undefined' && typeof result.error == 'undefined') 
			this.reconnect('blockConfirmedStatus');

		return result;
	}	

	// pow
	async getPow(hash:string): Promise<{ result: any; error?: string }> {
		return await this.request('work', { params: [hash] }, 'https://explorer.qlcchain.org/api/node');
	}
	// pow END

	// net
	async syncing(): Promise<{ result: any; error?: any }> {
		return await this.request('net_syncing', { params: [] });
	}

	async connectPeersInfo(): Promise<{ result: any; error?: any }> {
		return await this.request('net_connectPeersInfo', { params: [] });
	}
	// net END

	// desktop
	async blocksCountMain(): Promise<{ result: any; error?: string }> {
		return await this.request('ledger_blocksCount', { params: [] }, environment.mainRpcUrl[environment.qlcChainNetwork]);
	}
	

	async updates(): Promise<{ result: any; error?: string }> {
		const type = environment.desktop ? 'desktop' : 'web';
		const version = environment.version;

		return await this.request('updates', { params: [type,version] }, 'https://explorer.qlcchain.org/api/updates');
	}

	async nodeInfo(): Promise<{ result: any; error?: string }> {
		return await this.request('info', { params: [] }, 'https://explorer.qlcchain.org/api/node');
	}

	async nodeVersion(desktopVersion, nodeVersion, platform, arch): Promise<{ result: any; error?: string }> {
		return await this.request('version', { params: [desktopVersion, nodeVersion, platform, arch] }, 'https://explorer.qlcchain.org/api/node');
	}

	// desktop END


}
