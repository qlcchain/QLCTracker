import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class RepresentativeService {
	storeKey = `sms-billing-representatives`;

	representatives$ = new BehaviorSubject([]);
	representatives = [];

	loaded = false;

	// Default representatives list
	defaultRepresentatives = [
		/*{
			id: 'qlc_1t1uynkmrs597z4ns6ymppwt65baksgdjy1dnw483ubzm97oayyo38ertg44',
			name: 'QLCChain genesis Rep',
			trusted: true
		},
		{
			id: 'qlc_13y4fhit91okrjej7593ufbdbb96fh91rpg9byirg47yg9k9q7yxmhmebkrr',
			name: 'QLCChain Wallet Rep 1',
			trusted: true
		},
		{
			id: 'qlc_16itxekp4tfd415jzghfbyigujdtstn4jz6s19ne965am4jq91nx9yuz9wca',
			name: 'QLCChain Wallet Rep 2',
			trusted: true
		},
		{
			id: 'qlc_359bm4fjhfp9ayxnugw49mdytjjfq9dyty6taugonsfc33cza48b1p4kis5b',
			name: 'QLCChain Wallet Rep 3',
			trusted: true
		},
		{
			id: 'qlc_3becyh5w8qzmesd6a75yh1azneotjjgfpj1hkfi9zrj7fuf9cyr7qy5wt1fc',
			name: 'QLCChain Wallet Rep 4',
			trusted: true
		},
		{
			id: 'qlc_3nygrrfooudn69uw6sbqr3nkcyndta4oqy4938t1eqxr6yjtpi3fndad1gr7',
			name: 'QLCChain Wallet Rep 5',
			trusted: true
		}*/
		{
			id: 'qlc_3hw8s1zubhxsykfsq5x7kh6eyibas9j3ga86ixd7pnqwes1cmt9mqqrngap4',
			name: 'QLCChain genesis Rep',
			trusted: true
		},
		{
			id: 'qlc_1awe9yegmfkgt1znczg9noet1n3zhkfqfukwfh5cuf5gtjpcjczg7yfwwsp7',
			name: 'QLCChain Wallet Rep 1',
			trusted: true
		},
		{
			id: 'qlc_1h14ymitgs6x5895b57wdi7gedop7jmnihxwryhgnr8ry1ecmpg9io6kkbha',
			name: 'QLCChain Wallet Rep 2',
			trusted: true
		}
	];

	constructor() {
		this.representatives = this.defaultRepresentatives;
	}

	loadRepresentativeList() {
		if (this.loaded) {
			return this.representatives;
		}

		let list = this.defaultRepresentatives;
		const representativeStore = localStorage.getItem(this.storeKey);
		if (representativeStore) {
			list = JSON.parse(representativeStore);
		}
		this.representatives = list;
		this.representatives$.next(list);
		this.loaded = true;

		return list;
	}

	getRepresentative(id) {
		return this.representatives.find(rep => rep.id === id);
	}

	saveRepresentative(accountID, name, trusted = false, warn = false) {
		const newRepresentative: any = {
			id: accountID,
			name: name
		};
		if (trusted) {
			newRepresentative.trusted = true;
		}
		if (warn) {
			newRepresentative.warn = true;
		}

		const existingRepresentative = this.representatives.find(
			r => r.name.toLowerCase() === name.toLowerCase() || r.id.toLowerCase() === accountID.toLowerCase()
		);

		if (existingRepresentative) {
			this.representatives.splice(this.representatives.indexOf(existingRepresentative), 1, newRepresentative);
		} else {
			this.representatives.push(newRepresentative);
		}

		this.saveRepresentatives();
		this.representatives$.next(this.representatives);
	}

	deleteRepresentative(accountID) {
		const existingIndex = this.representatives.findIndex(a => a.id.toLowerCase() === accountID.toLowerCase());
		if (existingIndex === -1) {
			return;
		}

		this.representatives.splice(existingIndex, 1);

		this.saveRepresentatives();
		this.representatives$.next(this.representatives);
	}

	saveRepresentatives(): void {
		localStorage.setItem(this.storeKey, JSON.stringify(this.representatives));
	}

	getSortedRepresentatives() {
		const weightedReps = this.representatives.map(r => {
			if (r.trusted) {
				r.weight = 2;
			} else if (r.warn) {
				r.weight = 0;
			} else {
				r.weight = 1;
			}
			return r;
		});

		return weightedReps.sort((a, b) => b.weight - a.weight);
	}
}
