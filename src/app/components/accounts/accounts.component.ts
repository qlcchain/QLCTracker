import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  accounts: any[] = [];
  accountsCreated = 0;
	pendingBlocks = [];
  pageSize = 10;
  pages = [];
  allPages = 0;
  activePage = 0;
  offSet = 0;

  routerSub = null;

  constructor(
    private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
		private node: NodeService
  ) { }

  async ngOnInit() {
    this.routerSub = this.router.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.load(); // Reload the state when navigating to itself from the accounts page
			}
    });
    this.load();
  }

  load() {
		if (this.node.status === true) {
      var page = this.route.snapshot.params.page;
      if (page == undefined || page == 0) 
        page = 1;
    
			this.setPage(page);
		} else {
			this.reload();
		}
	}

	async reload() {
		const source = timer(200);
		const abc =  source.subscribe(async val => {
				this.load();
		});
	}

  setPages() {
		this.activePage = Math.floor((this.offSet + this.pageSize)/this.pageSize);
		var displayPages = 7;
    var pages = this.accountsCreated/this.pageSize;
    if (this.accountsCreated%this.pageSize != 0) {
      pages = Math.floor(this.accountsCreated/this.pageSize)+1;
    }
		
		this.allPages = pages;
		if (pages < 7)
			displayPages = pages;
		
		this.pages = Array(displayPages).fill(0).map((pages,i)=>i+1) ;

		if (pages > 5 && this.activePage > 3 && this.activePage < pages -3) {
			this.pages[1] = this.activePage -2;
			this.pages[2] = this.activePage -1;
			this.pages[3] = this.activePage;
			this.pages[4] = this.activePage +1;
			this.pages[5] = this.activePage +2;
		} else if (pages > 5 && this.activePage > 3 && this.activePage >= pages -3) {
			this.pages[1] = pages -5;
			this.pages[2] = pages -4;
			this.pages[3] = pages -3;
			this.pages[4] = pages -2;
			this.pages[5] = pages -1;
		}

		this.pages[displayPages-1] = pages;
		this.pages[0] = 1;
		if (this.pages[displayPages-2] != pages -1) {
			this.pages[displayPages-2] = '...';
		}

		if (this.pages[1] && this.pages[1] != 2) {
			this.pages[1] = '...';
    }
  }

  setPage(page) {
    this.activePage = page;
    this.offSet = page*this.pageSize-this.pageSize;
    this.loadAccounts();
  }

  goTo(page) {
    this.router.navigate(['/accounts/'+page]);
  }

  async loadAccounts() {
    this.accounts = [];
    const accountsCreated = await this.api.accountsCount();
    
		if (!accountsCreated.error) {
      this.accountsCreated = accountsCreated.result;
      this.setPages();
		}
    const accounts = await this.api.accounts(this.pageSize,this.offSet);

    const tokenMap = {};
		const tokens = await this.api.tokens();
		if (!tokens.error) {
			tokens.result.forEach(token => {
				tokenMap[token.tokenId] = token;
			});
    }
    if (!accounts.error && accounts.result) {
      accounts.result.forEach(async am => {
        let accountInfo = await this.api.accountInfo(am);
        for (const token of accountInfo.result.tokens) {
          if (tokenMap.hasOwnProperty(token.type)) {
            token.tokenInfo = tokenMap[token.type];
          }
        }
        this.accounts.push(accountInfo.result);
      })
    }
  }

}
