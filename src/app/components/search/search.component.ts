import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  reloadTimer = null;
  routerSub = null;

  search_text = '';

  phoneBlocks = {
    receive: [],
    send: []
  }

  constructor(
    private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
    private node: NodeService,
    private util: UtilService
  ) { }

  ngOnInit() {
    this.routerSub = this.router.events.subscribe(event => {
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
      this.search();
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
  
  async search() {
    const phoneNumber = this.util.b64.decodeUnicode(this.route.snapshot.params.hash);
    this.search_text = phoneNumber;
    this.phoneBlocks = {
      receive: [],
      send: []
    };
    const phoneBlocks = await this.api.phoneBlocks(this.search_text);
    if (!phoneBlocks.error) {
      this.phoneBlocks = phoneBlocks.result;
    }
    this.phoneBlocks.send.forEach(element => {
      element.senderNumber = this.util.b64.decodeUnicode(element.sender)
      element.receiverNumber = this.util.b64.decodeUnicode(element.receiver)
    });
    this.phoneBlocks.receive.forEach(element => {
      element.senderNumber = this.util.b64.decodeUnicode(element.sender)
      element.receiverNumber = this.util.b64.decodeUnicode(element.receiver)
    });
  }

}