import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';

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
    const phoneNumber = atob(this.route.snapshot.params.hash);
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
      element.senderNumber = atob(element.sender)
      element.receiverNumber = atob(element.receiver)
    });
    this.phoneBlocks.receive.forEach(element => {
      element.senderNumber = atob(element.sender)
      element.receiverNumber = atob(element.receiver)
    });
    console.log(phoneBlocks);
    console.log(this.phoneBlocks);
  }

}
/**
 * 
 * address: "qlc_1sbk8f8bgfwk1agohqyh386goqpsc7b3jyjb5chp61f51sag97d6fhyzk7q6"
amount: "3"
balance: "200000000016"
extra: "0000000000000000000000000000000000000000000000000000000000000000"
hash: "012d0bd4d74e354c8e322d9e1283003950cc141ae0ed7f6665e17c9086b82df8"
link: "55180ebbe5d5cb2779d58bf3533a68322f1ad9c2c93e1f6ad21410fc529fcf1e"
message: "3ce0e28651f22272465bbffb43bd65d2dc07749c580fc80ed7d247c6b87460cd"
network: "0"
oracle: "0"
povHeight: 0
previous: "4ffa82af30730d441c619e2f18bb5106617514e1b565e6efdbbe3661e6160e1a"
receiver: "Kzg2IDEzMjMyOTMxOTQ2"
representative: "qlc_3hw8s1zubhxsykfsq5x7kh6eyibas9j3ga86ixd7pnqwes1cmt9mqqrngap4"
sender: "Kzg2IDEzMTMxNzIxOTU4"
signature: "68a461d93b5617ecb00ea0f6d203dab17df97df3d2b21047c22895df9e28b252c0cc0acf5c3d138e95dbcfc140c920c1dc882f544addf0786a79e22a5fc62403"
storage: "0"
timestamp: 1553862217
token: "a7e8fa30c063e96a489a47bc43909505bd86735da4a109dca28be936118a8582"
tokenName: "QLC"
type: "Send"
vote: "0"
work: "00000000004be0dd"
 */