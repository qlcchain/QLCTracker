import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import * as CryptoJS from 'crypto-js';
import { WalletService } from '../../services/wallet.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.scss']
})
export class ImportWalletComponent implements OnInit {

  activePanel = 'error';

  msg1 = '';
  msg2 = '';
  msg3 = '';
  msg4 = '';

  walletPassword = '';
  validImportData = false;
  importData: any = null;

  constructor(
    private route: ActivatedRoute,
    private notifications: NotificationService,
    private wallet: WalletService,
    private trans: TranslateService
  ) {
    this.loadLang();
  }

  ngOnInit() {
    const importData = this.route.snapshot.fragment;
    if (!importData || !importData.length) {
      return this.importDataError(this.msg1);
    }
    const decodedData = atob(importData);

    try {
      const importBlob = JSON.parse(decodedData);
      if (!importBlob || !importBlob.seed) {
        return this.importDataError(this.msg2);
      }
      this.validImportData = true;
      this.importData = importBlob;
      this.activePanel = 'import';
    } catch (err) {
      return this.importDataError(this.msg3);
    }
    this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadLang();
    });
  }

  loadLang() {
    this.trans.get('IMPORT_WALLET_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res; });
    this.trans.get('IMPORT_WALLET_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res; });
    this.trans.get('IMPORT_WALLET_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res; });
    this.trans.get('IMPORT_WALLET_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res; });
  }

  importDataError(message) {
    this.activePanel = 'error';
    return this.notifications.sendError(message);
  }

  async decryptWallet() {
    // Attempt to decrypt the seed value using the password
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(this.importData.seed, this.walletPassword);
      const decryptedSeed = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedSeed || decryptedSeed.length !== 64) {
        this.walletPassword = '';
        return this.notifications.sendError(this.msg4);
      }

      await this.wallet.loadImportedWallet(decryptedSeed, this.walletPassword, this.importData.accountsIndex || 0);
      this.activePanel = 'imported';

    } catch (err) {
      this.walletPassword = '';
      return this.notifications.sendError(this.msg4);
    }
  }

}
