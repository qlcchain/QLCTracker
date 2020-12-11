import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { combineLatest, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressBookService } from '../../../services/address-book.service';
import { NotificationService } from '../../../services/notification.service';
import { EtherWalletService } from 'src/app/services/ether-wallet.service';

@Component({
  selector: 'app-erc20-wallet',
  templateUrl: './erc20-wallet.component.html',
  styleUrls: ['./erc20-wallet.component.scss']
})
export class Erc20WalletComponent implements OnInit {
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
  noWallet: boolean = true;

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
    this.addresslc = this.address.toLowerCase();
    this.loadWallet();
  }
  
  loadWallet() {
    if (this.etherService.selectedAddress) {
      //return this.router.navigate(['wallets/']);
      this.noWallet = false;
    }
    this.loading = false;
  }

  async getBalances() {
    console.log(this.address)
    //const balances = await this.etherService.getBalances(this.address);
  }

  deleteWallet() {
    
    this.router.navigate(['myaccounts/']);
  }

}
