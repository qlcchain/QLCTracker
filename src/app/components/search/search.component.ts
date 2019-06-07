import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';
import { Base64 } from 'js-base64';

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

  messageBlocks = [];



  constructor(
    private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
    private node: NodeService
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
    const phoneNumber = Base64.decode(this.route.snapshot.params.hash);
    this.search_text = phoneNumber;
    this.phoneBlocks = {
      receive: [],
      send: []
    };
    this.messageBlocks = [];
    const phoneBlocks = await this.api.phoneBlocks(this.search_text);
    if (!phoneBlocks.error) {
      this.phoneBlocks = phoneBlocks.result;
    }
    this.phoneBlocks.send.forEach(element => {
      element.senderNumber = Base64.decode(element.sender)
      element.receiverNumber = Base64.decode(element.receiver)
    });
    this.phoneBlocks.receive.forEach(element => {
      element.senderNumber = Base64.decode(element.sender)
      element.receiverNumber = Base64.decode(element.receiver)
    });

    const messageHashRequest = await this.api.messageHash(this.search_text);
    if (!messageHashRequest.error) {
      const messageHash = messageHashRequest.result;
      const messageBlocks = await this.api.messageBlocks(messageHash);
      if (!messageBlocks.error) {
        this.messageBlocks = messageBlocks.result;
        this.messageBlocks.forEach(element => {
          element.senderNumber = Base64.decode(element.sender)
          element.receiverNumber = Base64.decode(element.receiver)
        });
      }
    }
  }

}
