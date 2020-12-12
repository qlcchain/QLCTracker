import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { combineLatest, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressBookService } from '../../../services/address-book.service';
import { NotificationService } from '../../../services/notification.service';
import { EtherWalletService } from 'src/app/services/ether-wallet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-erc20-wallet',
  templateUrl: './erc20-wallet.component.html',
  styleUrls: ['./erc20-wallet.component.scss']
})
export class Erc20WalletComponent implements OnInit {
  neotubeSite = environment.neotubeSite[environment.neoNetwork];
  etherscan = environment.etherscan[environment.neoNetwork];
  swapHistory: any[] = [];
  address = this.etherService.selectedAddress;
  addresslc: string;
  loading = true;
  showEditName = false;
  addressBookNameTemp = '';
  recoverPrivateKeyText = 'Recover private key';
  recoveredPrivateKey = null;
  subscriptions: Subscription[] = [];
  balances: any[] = [];
  transactions: any[];
  erc20Transactions: any[];
  internalTransactions: any[];
  noWallet = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private changeDetection: ChangeDetectorRef,
    private addressBookService: AddressBookService,
    private notificationService: NotificationService,
    private walletService: WalletService,
    public etherService: EtherWalletService
  ) {
  }

  async ngOnInit() {
    // this.getEtherAccounts();
    this.addresslc = this.address.toLowerCase();
    this.loadWallet();
  }
  // async getEtherAccounts() {
  //   const accounts: any[] = await this.etherService.getAccounts();
  //   const swaptransactions: any = await this.etherService.swapInfosByAddress(
  //     accounts[0],
  //     1,
  //     20
  //   );
  //   this.swapHistory = swaptransactions.data.infos;
  // }
  async loadWallet() {
    if (this.etherService.selectedAddress) {
      this.noWallet = false;
    }
    this.loading = false;
  }

  async getBalances() {
    console.log(this.address);
    // const balances = await this.etherService.getBalances(this.address);
  }

  deleteWallet() {
    this.router.navigate(['myaccounts/']);
  }

}
