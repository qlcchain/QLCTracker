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
	private c = new Client(this.HTTP_RPC, () => {});
	
	//private connectInterval = interval(1000);

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
		
		return await this.c.request( methods.ledger.accounts, count, offset );
	}
	
	async accountsCount(): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.ledger.accountsCount );
	}
	
	
	
	async blocks(count:Number = 0, offset:Number = 0): Promise<{ result: any; error?: string }> {
		//this.node.setOffline('error');
		return await this.c.request( methods.ledger.blocks, count, offset );
	}
	
	async blocksCount(): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.ledger.blocksCount );
	}
	
	
	
	async accountsBalances(accounts: string[]): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.qlcclassic.accountsBalances, accounts );
		//return await this.request('qlcclassic_accountsBalances', { params: [accounts] });
	}
	
	async accountForPublicKey(account: string): Promise<{ result: any; error?: any }> {
		return await this.c.request( methods.account.accountForPublicKey, account );
	}
	
	
	
	async accountsFrontiers(accounts: string[]): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.qlcclassic.accountsFrontiers, accounts );
		//return await this.request('qlcclassic_accountsFrontiers', { params: [accounts] });
	}
	
	async accountsPending(accounts: string[], count: number = 50): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.qlcclassic.accountsPending, accounts, count );
	}
	
	
	async onlineRepresentatives(): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.net.onlineRepresentatives )
	}
	
	async representatives(): Promise<any> {
		return await this.c.request( methods.ledger.representatives )
	}
	
	async accountVotingWeight(address): Promise<string> {
		return await this.c.request( methods.ledger.accountVotingWeight, address )
	}
	
	
	
	async blocksInfo(blocks): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.ledger.blocksInfo, blocks );
	}
	
	async blockAccount(account): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.ledger.blockAccount, account );
	}
	
	async process(block): Promise<{ result: string; error?: string }> {
		return await this.c.request( methods.qlcclassic.process, block )
		//return await this.request('qlcclassic_process', { params: [block] });
	}
	
	async accountHistory(account, count = 25): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.ledger.accountHistoryTopn, account, count );
	}
		
	async accountInfo(account): Promise<{ result: any ; error?: any }> {
		console.log('accountInfo ' + account);
		try {
			const returns = await this.c.request( methods.ledger.accountInfo, account );
			console.log(returns);
			return returns;
		} catch (error) {
			console.log(error);
			return error;
		}
	}
	
	async validateAccountNumber(account): Promise<{ result: true | false }> {
		return await this.c.request( methods.qlcclassic.validateAccount, account );
		//return await this.request('qlcclassic_validateAccount', { params: [account] });
	}
	
	async tokens(): Promise<{ result: any; error?: string }> {
		return await this.c.request( methods.ledger.tokens );
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
