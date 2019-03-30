import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.scss']
})
export class TokensComponent implements OnInit {

  reloadTimer = null;
  routerSub = null;

  tokens = {};

  constructor(
		private route: Router,
		private api: ApiService,
    private node: NodeService) 
  { }

  ngOnInit() {
    this.routerSub = this.route.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.load(); // Reload the state when navigating to itself from the transactions page
			}
    });
    this.load();
  }

  ngOnDestroy() {
		if (this.reloadTimer) {
			this.reloadTimer.unsubscribe();
    }
    if (this.routerSub) {
			this.routerSub.unsubscribe();
		}
	}

  load() {
		if (this.node.status === true) {
      this.loadTokens();
		} else {
			this.reload();
		}
	}

	async reload() {
		const source = timer(200);
		this.reloadTimer =  source.subscribe(async val => {
				this.load();
		});
	} 

  async loadTokens() {
    const tokens = await this.api.tokens();
    const tokenMap = {};

		if (!tokens.error) {
			tokens.result.forEach(token => {
				tokenMap[token.tokenId] = token;
			});
    }
    if (!tokens.error && tokens.result) {
      /*tokens.result.forEach(am => {
        for (const token of am.tokens) {
          if (tokenMap.hasOwnProperty(token.type)) {
            token.tokenInfo = tokenMap[token.type];
          }
        }
      })*/
    }
    

    this.tokens = tokens.result;
    console.log(this.tokens);
  }

}
