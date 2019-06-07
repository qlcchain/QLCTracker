import { Component, OnInit } from '@angular/core';
import { Router, ChildActivationEnd, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { timer } from 'rxjs';
import { NodeService } from 'src/app/services/node.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {


  transaction: any = {};
  pendingBlocks = [];
  pageSize = 25;

  accountMeta: any = {};
  transactionHash = '';
  transactionJSON = '';

  routerSub = null;


  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private api: ApiService,
    private node: NodeService
  ) { }

  async ngOnInit() {
    this.routerSub = this.route.events.subscribe(event => {
      if (event instanceof ChildActivationEnd) {
        this.load(); // Reload the state when navigating to itself from the transactions page
      }
    });
    this.load();
  }

  load() {
    if (this.node.status === true) {
      this.loadTransactionDetails();
    } else {
      this.reload();
    }
  }

  async reload() {
    const source = timer(200);
    const abc = source.subscribe(async val => {
      this.load();
    });
  }

  async loadTransactionDetails() {
    this.transactionHash = this.router.snapshot.params.transaction;

    const tokenMap = {};
    const tokens = await this.api.tokens();
    if (!tokens.error) {
      tokens.result.forEach(token => {
        tokenMap[token.tokenId] = token;
      });
    }

    const transaction = await this.api.blocksInfo([this.transactionHash]);

    this.transaction = transaction.result[0];
    console.log(this.transaction);
    this.transactionJSON = JSON.stringify(this.transaction, null, 4);

    if (tokenMap.hasOwnProperty(this.transaction.token)) {
      this.transaction.tokenInfo = tokenMap[this.transaction.token];
    }

    if (this.transaction.type == 'Open' || this.transaction.type == 'ContractReward') { // link is block hash
      const link_as_account = await this.api.blockAccount(this.transaction.link);
      if (!link_as_account.error && typeof (link_as_account.result[0]) != 'undefined' && link_as_account.result.length > 0) {
        this.transaction.link_as_account = this.transaction.address;
        this.transaction.address = link_as_account.result;
      }
    } else { // link is pub key
      const link_as_account = await this.api.accountForPublicKey(this.transaction.link);
      if (!link_as_account.error && typeof (link_as_account.result[0]) != 'undefined' && link_as_account.result.length > 0) {
        this.transaction.link_as_account = link_as_account.result;
      }
    }

  }



}
