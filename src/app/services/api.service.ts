import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { NodeService } from './node.service';

import { httpProvider } from 'qlc.js/provider/HTTP';
import Client from 'qlc.js/client';
import { methods } from 'qlc.js/common';
import { timer } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	rpcUrl = environment.apiUrl;
	alive = true;
	
	private HTTP_RPC = new httpProvider(this.rpcUrl);
	c = new Client(this.HTTP_RPC, () => {});
	
	//private connectInterval = interval(1000);

	qlcTokenHash = '';

	constructor(private http: HttpClient, private node: NodeService) {
		//this.connectInterval.pipe(takeUntil(() => this.node.status)).subscribe()
		this.connect();
	}

	async connect() {
		const source = timer(200);
		const abc =  source.subscribe(async val => {
			try {
				const returns = await this.c.request( methods.ledger.blocksCount );
				console.log(returns);
				this.node.setOnline();
			} catch (error) {
				console.log(error);
				this.connect();
			}
			/*if (this.node.status !== true)
				this.connect();*/
		});
	}

	async accounts(count:Number = 0, offset:Number = 0): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request( methods.ledger.accounts, count, offset );
		} catch (err) {
			return err;
		}
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

	async accountsPending(accounts: string[], count: number = 50): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountsPending, accounts, count);
		} catch (err) {
			return err;
		}
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

	async blockCount(): Promise<{ count: number; unchecked: number }> {
		try {
			return await this.c.request(methods.ledger.blocksCount);
		} catch (err) {
			return err;
		}
	}

	async process(block): Promise<{ result: string; error?: string }> {
		try {
			return await this.c.request(methods.ledger.process, block);
		} catch (err) {
			return err;
		}
	}

	async accountHistory(account, count = 25): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.accountHistoryTopn, account, count);
		} catch (err) {
			return err;
		}
	}

	async accountInfo(account): Promise<{ result: any; error?: string }> {
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

	async pending(account, count): Promise<{ result: any; error?: string }> {
		try {
			return await this.accountsPending([account], count);
		} catch (err) {
			return err;
		}
	}

	async tokens(): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request(methods.ledger.tokens);
		} catch (err) {
			return err;
		}
	}

	async blocks(count:Number = 0, offset:Number = 0): Promise<{ result: any; error?: string }> {
		try {
			return await this.c.request( methods.ledger.blocks, count, offset );
		} catch (err) {
			return err;
		}
	}
	
	async blocksCount(): Promise<{ result: any; error?: string }> {
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
	async accountInfoByToken(account, tokenHash): Promise<any> {
		const am = await this.accountInfo(account);
		/*if (am.error) {
			return null;
		}*/
		const tokens = am.result.tokens;
		
		return Array.isArray(tokens) ? tokens.filter(tokenMeta => tokenMeta.type === tokenHash)[0] : null;
	}
}
