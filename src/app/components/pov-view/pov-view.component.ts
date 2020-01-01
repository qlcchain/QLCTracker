import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';
import { BlockingProxy } from 'blocking-proxy';

@Component({
  selector: 'app-pov-view',
  templateUrl: './pov-view.component.html',
  styleUrls: ['./pov-view.component.scss']
})
export class PovViewComponent implements OnInit {

  routerSub = null;

  type = '';
  param = '';
  block = {
    "header": {
      "basHdr": {
        "version": 0,
        "previous": "0000000000000000000000000000000000000000000000000000000000000000",
        "merkleRoot": "0000000000000000000000000000000000000000000000000000000000000000",
        "timestamp": 0,
        "bits": 0,
        "nonce": 0,
        "hash": "0000000000000000000000000000000000000000000000000000000000000000",
        "height": 0
      },
      "auxHdr": null,
      "cbtx": {
        "version": 0,
        "txIns": [
        ],
        "txOuts": [
        ],
        "stateHash": "0000000000000000000000000000000000000000000000000000000000000000",
        "txNum": 0,
        "hash": "0000000000000000000000000000000000000000000000000000000000000000"
      }
    },
    "body": {
      "txs": [
      ]
    },
    "algoName": "",
    "algoEfficiency": 0,
    "normBits": 0,
    "normDifficulty": 0,
    "algoDifficulty": 0
  };
  blockJSON = '';

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

  
  load() {
    this.type = '';
    this.param = '';
		if (this.node.status === true) {
      this.type = this.route.snapshot.params.type;
      this.param = this.route.snapshot.params.hash;
      
      //console.log('type');
      //console.log(this.type);
      //console.log('param');
      //console.log(this.param);
      this.loadBlock();
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

  async loadBlock() {
    this.block = null;
    this.blockJSON = '';
    if (this.type != 'hash' && this.type != 'height') {

      //console.log('wrong type');
      return;
    }

    if (this.type == 'hash') {
      const blockQuery = await this.api.getBlockByHash(this.param);
      if (!blockQuery.error) {
        this.block = blockQuery.result;
      }
    }
    if (this.type == 'height') {
      const blockQuery = await this.api.getBlockByHeight(this.param);
      if (!blockQuery.error) {
        this.block = blockQuery.result;
      }
    }
    this.blockJSON = JSON.stringify(this.block, null, 4);
    //console.log(this.block);

  }

}
