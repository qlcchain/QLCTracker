import {
  Component,
  OnInit,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { WalletService } from 'src/app/services/wallet.service';
import { UtilService } from 'src/app/services/util.service';
import { NodeService } from 'src/app/services/node.service';
import { AppSettingsService } from 'src/app/services/app-settings.service';
import { TranslateService } from '@ngx-translate/core';
import { AddressBookService } from 'src/app/services/address-book.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { timer, Subscription, combineLatest } from 'rxjs';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import * as QRCode from 'qrcode';
import BigNumber from 'bignumber.js';
import { EtherWalletService } from 'src/app/services/ether-wallet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-myneowallet',
  templateUrl: './myneowallet.component.html',
  styleUrls: ['./myneowallet.component.scss'],
})
export class MyneowalletComponent implements OnInit {
  neotubeSite = environment.neotubeSite[environment.neoNetwork];
  etherscan = environment.etherscan[environment.neoNetwork];
  wallet = this.walletService.wallet;
  walletAccount = {
    balances: [],
    encryptedwif: '',
  };
  claimableGas = '0';

  walletHistory: any[] = [];
  swapHistory: any[] = [];
  pageSize = 15;
  accountBlocksCount = 0;
  maxPageSize = 200;

  reloadTimer = null;
  routerSub = null;

  addressBookEntry: any = null;
  accountMeta: any = {};
  walletId = '';

  modalRef: BsModalRef;

  qrCodeImage = null;

  showEditName = false;
  addressBookTempName = '';
  addressBookModel = '';

  subscriptions: Subscription[] = [];
  neoPrivateCode = '';
  neoPrivateCodeButton = 'Recover private key';
  neoPrivateCodeRecoverStatus = 0;

  isNaN = isNaN;

  msg1 = '';
  msg2 = '';
  msg3 = '';
  msg4 = '';
  msg5 = '';
  msgEdit1 = '';
  msgEdit2 = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private api: ApiService,
    private notifications: NotificationService,
    private walletService: WalletService,
    public neoService: NeoWalletService,
    private util: UtilService,
    private node: NodeService,
    public settings: AppSettingsService,
    // private qlcBlock: QLCBlockService,
    private trans: TranslateService,
    private notificationService: NotificationService,
    private addressBook: AddressBookService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private etherService: EtherWalletService
  ) {}

  ngOnInit() {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof ChildActivationEnd) {
        this.load(); // Reload the state when navigating to itself from the transactions page
      }
    });
    this.load();

    this.loadLang();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    if (this.reloadTimer) {
      this.reloadTimer.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  loadLang() {
    this.trans.get('RECEIVE_WARNINGS.msg1').subscribe((res: string) => {
      this.msg1 = res;
    });
    this.trans.get('RECEIVE_WARNINGS.msg2').subscribe((res: string) => {
      this.msg2 = res;
    });
    this.trans.get('RECEIVE_WARNINGS.msg3').subscribe((res: string) => {
      this.msg3 = res;
    });
    this.trans.get('RECEIVE_WARNINGS.msg4').subscribe((res: string) => {
      this.msg4 = res;
    });
    this.trans.get('RECEIVE_WARNINGS.msg5').subscribe((res: string) => {
      this.msg5 = res;
    });
    this.trans.get('ACCOUNT_DETAILS_WARNINGS.msg5').subscribe((res: string) => {
      this.msgEdit1 = res;
    });
    this.trans.get('ACCOUNT_DETAILS_WARNINGS.msg6').subscribe((res: string) => {
      this.msgEdit2 = res;
    });
  }

  load() {
    if (this.node.status === true) {
      this.loadWallet();
    } else {
      this.reload();
    }
  }

  async reload() {
    const source = timer(200);
    this.reloadTimer = source.subscribe(async (val) => {
      this.load();
    });
  }

  async loadWallet() {
    this.walletId = this.route.snapshot.params.wallet;
    // tslint:disable-next-line: triple-equals
    if (this.walletId == undefined || this.walletId == '') {
      this.walletId = this.wallet.accounts[0].accountMeta.account;
    }

    this.walletAccount = this.wallet.neowallets.find(
      (a) => a.id === this.walletId
    );

    this.addressBookEntry = this.addressBook.getAccountName(this.walletId);
    this.addressBookModel = this.addressBookEntry || '';

    const balance: any = await this.neoService.getNeoScanBalance(this.walletId);

    for (const asset of balance) {
      this.walletAccount.balances[asset.asset_hash] = {
        amount: new BigNumber(asset.amount).toFixed(),
        asset: asset.asset,
        asset_symbol: asset.asset_symbol,
      };
    }
    this.claimableGas = await this.neoService.getClaimAmount(this.walletId);
    const transactions = await this.neoService.getLastTransactions(
      this.walletId
    );
    this.walletHistory = transactions.entries;
    const qrCode = await QRCode.toDataURL(`${this.walletId}`);
    this.qrCodeImage = qrCode;
    const swaptransactions: any = await this.etherService.swapInfosByAddress(
      this.walletId,
      1,
      3
    );
    this.swapHistory = swaptransactions.data.infos;
    console.log('swapHistory', this.swapHistory);
  }

  editName() {
    this.showEditName = true;
    this.addressBookTempName = this.addressBookModel;
  }
  editNameCancel() {
    this.showEditName = false;
    this.addressBookModel = this.addressBookTempName;
    this.addressBookTempName = '';
  }
  async editNameSave() {
    const addressBookName = this.addressBookModel.trim();
    if (!addressBookName) {
      this.addressBook.deleteAddress(this.walletId);
      this.notificationService.sendSuccess(this.msgEdit1);
      this.showEditName = false;
      return;
    }

    try {
      await this.addressBook.saveAddress(this.walletId, addressBookName);
    } catch (err) {
      this.notificationService.sendError(err.message);
      return;
    }

    this.notificationService.sendSuccess(this.msgEdit2);
    this.showEditName = false;
  }

  openModal(template: TemplateRef<any>) {
    const _combine = combineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());
    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.neoPrivateCode = '';
        this.neoPrivateCodeRecoverStatus = 0;
        this.neoPrivateCodeButton = 'Recover private key';
      })
    );

    this.modalRef = this.modalService.show(template);
  }

  async claim() {
    await this.neoService.claimGas(this.walletId);
    this.loadWallet();
  }

  deleteWallet() {
    const existingAccountIndex = this.wallet.neowallets.findIndex(
      (a) => a.id === this.walletId
    );
    if (existingAccountIndex === -1) {
      return;
    }

    this.wallet.neowallets.splice(existingAccountIndex, 1);

    this.walletService.saveWalletExport();
    this.router.navigate(['/wallets/']);
  }

  async recoverPrivateKey(recover) {
    if (this.walletService.walletIsLocked()) {
      return this.notifications.sendWarning('ERROR wallet locked');
    }
    if (this.neoPrivateCodeRecoverStatus == 1) {
      return this.notifications.sendInfo('Preparing, please wait a moment.');
    }

    this.neoPrivateCodeRecoverStatus = 1;
    this.neoPrivateCodeButton = 'Preparing, please wait.';

    const wif = await this.neoService.decrypt(
      this.walletAccount.encryptedwif,
      this.wallet.password
    );
    if (wif != false) {
      this.neoPrivateCode = wif;
      this.openModal(recover);
    } else {
      this.neoPrivateCodeButton = 'ERROR - Wrong password';
    }
  }
}
