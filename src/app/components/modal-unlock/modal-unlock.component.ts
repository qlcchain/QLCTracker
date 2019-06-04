import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { WalletService } from 'src/app/services/wallet.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-unlock',
  templateUrl: './modal-unlock.component.html',
  styleUrls: ['./modal-unlock.component.scss']
})
export class ModalUnlockComponent implements OnInit {

  modalRef: BsModalRef;

  
  unlockPassword = '';

  msg1 = '';
	msg2 = '';
	msg3 = '';
	msg4 = '';
	msg5 = '';

  constructor(
    private walletService: WalletService,
    private notificationService: NotificationService,
    private trans: TranslateService, 
    private _bsModalRef: BsModalRef
  ) { 
    this.modalRef = _bsModalRef;
  }

  ngOnInit() {
    this.loadLang();
  }

  loadLang() {
    this.trans.get('WALLET_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res; });
		this.trans.get('WALLET_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res; });
		this.trans.get('WALLET_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res; });
		this.trans.get('WALLET_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res; });
		this.trans.get('WALLET_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res; });
	}

  async unlockWalletConfirm() {
    console.log('what twhafda')
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

}
