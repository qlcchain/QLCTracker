import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiConfidantService {

  explorerUrl = 'https://myconfidant.io/api/explorer';

  constructor(private http: HttpClient) { }

  private async request(action, data): Promise<any> {
		data.action = action;

		return await this.http
			.post(this.explorerUrl, data)
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

  
  async sendSecurityCode(email_address): Promise<{ any }> {
    console.log('sendSecurityCode')
		return await this.request('sendSecurityCode', { email_address });
  }

  async checkSecurityCode(email_address, security_code): Promise<{ valid: Number, mac_addresses?: any }> {
    console.log('checkSecurityCode')
		return await this.request('checkSecurityCode', { email_address, security_code });
  }

  async confirmMacAddresses(email_address, security_code, mac_addresses, qlc_address, neo_address, txid): Promise<{ any }> {
    console.log('confirmMacAddresses')
		return await this.request('confirmMacAddresses', { email_address, security_code, mac_addresses , qlc_address, neo_address, txid });
  }
  

}
