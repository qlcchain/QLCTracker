import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { forEach } from '@angular/router/src/utils/collection';
import { ActivatedRoute, Router, ChildActivationEnd } from '@angular/router';
import { NodeService } from 'src/app/services/node.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-representatives',
  templateUrl: './representatives.component.html',
  styleUrls: ['./representatives.component.scss']
})
export class RepresentativesComponent implements OnInit {

  representatives: any;
	representativesCount = 0;

  routerSub = null;
	
  pageSize = 10;
	pages = [];
	allPages = 0;
  activePage = 0;
  offSet = 0;

  constructor(
    private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
		private node: NodeService
  ) { }

  async ngOnInit() {
    this.routerSub = this.router.events.subscribe(event => {
			if (event instanceof ChildActivationEnd) {
				this.load(); // Reload the state when navigating to itself from the transactions page
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
	
	goTo(page) {
    this.router.navigate(['/representatives/'+page], { relativeTo: this.route });
  }

	setPage(page) {
    console.log(page);
    this.activePage = page;
    this.offSet = page*this.pageSize-this.pageSize;
    this.loadData();
	}
	
	setPages() {
		this.activePage = Math.floor((this.offSet + this.pageSize)/this.pageSize);
		var displayPages = 7;

		var pages = this.representativesCount/this.pageSize;
    if (this.representativesCount%this.pageSize != 0) {
      pages = Math.floor(this.representativesCount/this.pageSize)+1;
    }
		this.allPages = pages;
		if (pages < 7)
			displayPages = pages;
		
		this.pages = Array(displayPages).fill(0).map((pages,i)=>i+1) ;

		if (this.activePage > 3 && this.activePage < pages -3) {
			this.pages[1] = this.activePage -2;
			this.pages[2] = this.activePage -1;
			this.pages[3] = this.activePage;
			this.pages[4] = this.activePage +1;
			this.pages[5] = this.activePage +2;
		} else if (this.activePage > 3 && this.activePage >= pages -3) {
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

  async loadData() {
    const representatives = await this.api.representatives();
		if (representatives.result) {
			const onlineRepresentatives = await this.api.onlineRepresentatives();
			const onlineReps = onlineRepresentatives.result;
			const tokens = await this.api.tokenInfoByName('QLC');
      let displayReps = [];
      representatives.result.forEach(async rep => {
				const repOnline = onlineReps.indexOf(rep.address) !== -1;
				rep.online = repOnline;
				rep.votingPower = (rep.balance / tokens.result.totalSupply*100).toFixed(2);
				displayReps.push(rep);
			});
			this.representatives = displayReps;
			this.representativesCount = displayReps.length;
    }
  }

}
