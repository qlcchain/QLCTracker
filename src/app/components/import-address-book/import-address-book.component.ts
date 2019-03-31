import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { AddressBookService } from '../../services/address-book.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-import-address-book',
  templateUrl: './import-address-book.component.html',
  styleUrls: ['./import-address-book.component.scss']
})
export class ImportAddressBookComponent implements OnInit {
  activePanel = 'error';

  msg1 = '';
  msg2 = '';
  msg3 = '';
  msg4 = '';
  msg5 = '';

  validImportData = false;
  importData: any = null;

  conflictingEntries = 0;
  newEntries = 0;
  existingEntries = 0;

  constructor(
    private route: ActivatedRoute,
    private notifications: NotificationService,
    private addressBook: AddressBookService,
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
      if (!importBlob || !importBlob.length) {
        return this.importDataError(this.msg2);
      }
      this.validImportData = true;
      this.importData = importBlob;
      this.activePanel = 'import';

      // Now, find conflicting accounts
      for (const entry of importBlob) {
        if (!entry.account || !entry.name) {
          continue; // Data missing?
        }
        entry.originalName = this.addressBook.getAccountName(entry.account);
        if (!entry.originalName) {
          this.newEntries++;
        } else if (entry.originalName === entry.name) {
          this.existingEntries++;
        } else {
          this.conflictingEntries++;
        }
      }

    } catch (err) {
      return this.importDataError(this.msg3);
    }
    this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadLang();
    });
  }

  loadLang() {
    this.trans.get('IMPORT_ADDRESS_BOOK_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res; });
    this.trans.get('IMPORT_ADDRESS_BOOK_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res; });
    this.trans.get('IMPORT_ADDRESS_BOOK_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res; });
    this.trans.get('IMPORT_ADDRESS_BOOK_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res; });
    this.trans.get('IMPORT_ADDRESS_BOOK_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res; });
  }

  async confirmImport() {
    // Go through our address book and see which ones need to be saved
    let importedCount = 0;
    for (const entry of this.importData) {
      if (!entry.originalName) {
        await this.addressBook.saveAddress(entry.account, entry.name);
        importedCount++;
      } else if (entry.originalName && entry.originalName !== entry.name) {
        await this.addressBook.saveAddress(entry.account, entry.name);
        importedCount++;
      }
    }

    this.notifications.sendSuccess(this.msg4 + ` ${importedCount} ` + this.msg5);
    this.activePanel = 'imported';
  }

  importDataError(message) {
    this.activePanel = 'error';
    return this.notifications.sendError(message);
  }

}
