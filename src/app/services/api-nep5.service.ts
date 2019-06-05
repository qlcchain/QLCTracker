import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import  uuid from 'uuid/v4';

@Injectable({
  providedIn: 'root'
})
export class ApiNEP5Service {
	nep5Url = environment.nep5Url[environment.qlcChainNetwork];

  constructor(private http: HttpClient) { }

  private async request(action, data): Promise<any> {
		data.jsonrpc = '2.0';
		data.method = action;
		data.id = uuid();

		return await this.http
			.post(this.nep5Url, data)
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

	async prepareBenefitPledge(benefitParams, lockTxParams): Promise<{ result: any; error?: any }> {
		return await this.request('nep5_prePareBenefitPledge', { params: [benefitParams, lockTxParams] });
	}

	async benefitPledge(lockTxId): Promise<{ result: any; error?: any }> {
		return await this.request('nep5_benefitPledge', { params: [lockTxId] });
	}
	
	async benefitWithdraw(pledge,txid): Promise<{ result: any; error?: any }> {
			return await this.request('nep5_benefitWithdraw', { params: [pledge,txid] });
	}
	
	async getLockInfo(txid: string): Promise<{ result: any; error?: any }> {
			return await this.request('nep5_getLockInfo', { params: [txid] });
	}
	
	async process(block: any, txid: string, txWithdraw?: any): Promise<{ result: any; error?: any }> {
			return await this.request('ledger_process', { params: [block, txid, txWithdraw] });
	}
	
	async pledgeInfoCount(txid: string): Promise<{ result: any; error?: any }> {
			return await this.request('ledger_pledgeInfoCount', { params: [txid] });
	}
	
	async pledgeInfoList(txid: string): Promise<{ result: any; error?: any }> {
			return await this.request('ledger_pledgeInfoList', { params: [txid] });
	}
	
	async pledgeInfoByPledge(txid: string): Promise<{ result: any; error?: any }> {
			return await this.request('ledger_pledgeInfoByPledge', { params: [txid] });
	}
	
	async pledgeInfoByBeneficial(txid: string, count = 90, offset = 0): Promise<{ result: any; error?: any }> {
			return await this.request('ledger_pledgeInfoByBeneficial', { params: [txid,count,offset] });
	}
  
  	async pledgeInfoInProcess(txid: string): Promise<{ result: any; error?: any }> {
		return await this.request('ledger_ledgeInfoInProcess', { params: [txid] });
	}
	
	async prepareMintagePledge(mintagePledgeParams, lockTxParams): Promise<{ result: any; error?: any }> {
		return await this.request('nep5_prePareMintagePledge', { params: [mintagePledgeParams, lockTxParams] });
	}

	async mintagePledge(lockTxId): Promise<{ result: any; error?: any }> {
		return await this.request('nep5_mintagePledge', { params: [lockTxId] });
	}

	async mintageWithdraw(tokenId, lockTxId, unLockTxParams): Promise<{ result: any; error?: any }> {
		return await this.request('nep5_mintageWithdraw', { params: [tokenId, lockTxId, unLockTxParams] });
	}

	async pledgeInfoByTransactionID(txid: string): Promise<{ result: any; error?: any }> {
		return await this.request('ledger_pledgeInfoByTransactionID', { params: [txid] });
	}


	
	

	

}
