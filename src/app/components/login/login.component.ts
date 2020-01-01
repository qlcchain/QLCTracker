import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  wallet = this.walletService.wallet;

  unlockPassword = '';

  msg1 = '';
	msg2 = '';
	msg3 = '';
	msg4 = '';
	msg5 = '';
	msg6 = '';
	msg7 = '';

  constructor(
    public walletService: WalletService,
    private notificationService: NotificationService,
    private trans: TranslateService,
    private router: Router
  ) 
  { 
    this.loadLang();
  }

  ngOnInit() {
  }

  async unlockWalletConfirm() {
		const unlocked = await this.walletService.unlockWallet(this.unlockPassword);
		this.unlockPassword = '';

		if (unlocked) {
			this.notificationService.sendSuccess(this.msg1);
		} else {
			this.notificationService.sendError(this.msg2);
		}

    this.unlockPassword = '';
    this.router.navigate(['/wallets']);
  }
  
  loadLang() {
		this.trans.get('WALLET_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res; });
		this.trans.get('WALLET_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res; });
		this.trans.get('WALLET_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res; });
		this.trans.get('WALLET_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res; });
		this.trans.get('WALLET_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res; });
		this.trans.get('WALLET_WARNINGS.msg6').subscribe((res: string) => { this.msg6 = res; });
		this.trans.get('WALLET_WARNINGS.msg7').subscribe((res: string) => { this.msg7 = res; });
	}
}
