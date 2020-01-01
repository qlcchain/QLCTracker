import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Injectable({
	providedIn: 'root'
})
export class AddressBookService {
	storeKey = `qlcTracker-addressbook`;

	msg1 = '';

	addressBook = [];

	addressBook$ = new BehaviorSubject([]);

	constructor(private trans: TranslateService) {
		this.loadLang();
		this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadLang();
		});
	}

	loadLang() {
		this.trans.get('SERVICE_WARNINGS_ADDRESS_BOOK.msg1').subscribe((res: string) => {
			// console.log(res);
			this.msg1 = res;
		});
	}

	loadAddressBook() {
		let addressBook = [];
		const addressBookStore = localStorage.getItem(this.storeKey);
		if (addressBookStore) {
			addressBook = JSON.parse(addressBookStore);
		}
		this.addressBook = addressBook;
		this.addressBook$.next(this.addressBook);

		return this.addressBook;
	}

	async saveAddress(account, name) {
		const existingName = this.addressBook.find(a => a.name.toLowerCase() === name.toLowerCase());
		if (existingName) {
			throw new Error(this.msg1);
		}

		const existingAccount = this.addressBook.find(a => a.account.toLowerCase() === account.toLowerCase());
		if (existingAccount) {
			existingAccount.name = name;
		} else {
			this.addressBook.push({
				account,
				name
			});
		}
		this.saveAddressBook();
		this.addressBook$.next(this.addressBook);
	}

	deleteAddress(account) {
		const existingAccountIndex = this.addressBook.findIndex(a => a.account.toLowerCase() === account.toLowerCase());
		if (existingAccountIndex === -1) {
			return;
		}

		this.addressBook.splice(existingAccountIndex, 1);

		this.saveAddressBook();

		this.addressBook$.next(this.addressBook);
	}

	saveAddressBook(): void {
		localStorage.setItem(this.storeKey, JSON.stringify(this.addressBook));
	}

	clearAddressBook(): void {
		this.addressBook = [];
		this.addressBook$.next(this.addressBook);
		localStorage.removeItem(this.storeKey);
	}

	setAddressBookOrder(addressList) {
		this.addressBook = addressList
			.map(address => ({
				account: address,
				name: this.getAccountName(address)
			}))
			.filter(entry => entry.name !== null);

		this.saveAddressBook();
		this.addressBook$.next(this.addressBook);
	}

	getAccountName(account: string): string | null {
		if (!account || !account.length) {
			return null;
		}
		const match = this.addressBook.find(a => a.account.toLowerCase() === account.toLowerCase());
		return (match && match.name) || null;
	}

	nameExists(name: string): boolean {
		return this.addressBook.findIndex(a => a.name.toLowerCase() === name.toLowerCase()) !== -1;
	}
}
