import { Component, OnInit, TemplateRef } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-submenu',
  templateUrl: './user-submenu.component.html',
  styleUrls: ['./user-submenu.component.scss']
})
export class UserSubmenuComponent implements OnInit {
  wallet = this.walletService.wallet;
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
  ) { 
    this.loadLang();
  }

  ngOnInit() {
  }
  
  loadLang() {
    this.trans.get('WALLET_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res; });
		this.trans.get('WALLET_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res; });
		this.trans.get('WALLET_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res; });
		this.trans.get('WALLET_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res; });
		this.trans.get('WALLET_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res; });
	}

  async lockWallet() {
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
  
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
}
