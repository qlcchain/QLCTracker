import { map } from 'rxjs/operators';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AddressBookService } from '../../../../services/address-book.service';
import { WalletService } from '../../../../services/wallet.service';
import { NotificationService } from '../../../../services/notification.service';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import { RepresentativeService } from '../../../../services/representative.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-manage-representatives',
  templateUrl: './manage-representatives.component.html',
  styleUrls: ['./manage-representatives.component.scss']
})
export class ManageRepresentativesComponent implements OnInit {
  	activePanel = 0;

	msg1 = '';
	msg2 = '';
	msg3 = '';
	msg4 = '';
	msg5 = '';
	msg6 = '';
	msg7 = '';
  	msg8 = '';

  	newRepAccount = '';
	newRepName = '';
	newRepTrusted = false;
	newRepWarn = false;

	onlineReps = [];
  // Set the online status of each representative
	representatives$ = this.repService.representatives$.pipe(
		map(reps => {
			return reps.map(rep => {
				rep.online = this.onlineReps.indexOf(rep.id) !== -1;
				return rep;
			});
		})
	);

  constructor(
		private api: ApiService,
		private addressBookService: AddressBookService,
		private walletService: WalletService,
		private notificationService: NotificationService,
		private repService: RepresentativeService,
		private router: Router,
		private nodeApi: ApiService,
    private trans: TranslateService
  ) { }

  async ngOnInit() {
    this.repService.loadRepresentativeList();
		this.onlineReps = await this.getOnlineRepresentatives();
		this.repService.representatives$.next(this.repService.representatives); // Forcefully repush rep list once we have online status
		this.trans.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadLang();
		});
    this.loadLang();
  }

  loadLang() {
		this.trans.get('MANAGE_REPS_WARNINGS.msg1').subscribe((res: string) => { this.msg1 = res;	});
		this.trans.get('MANAGE_REPS_WARNINGS.msg2').subscribe((res: string) => { this.msg2 = res;	});
		this.trans.get('MANAGE_REPS_WARNINGS.msg3').subscribe((res: string) => { this.msg3 = res;	});
		this.trans.get('MANAGE_REPS_WARNINGS.msg4').subscribe((res: string) => { this.msg4 = res;	});
		this.trans.get('MANAGE_REPS_WARNINGS.msg5').subscribe((res: string) => { this.msg5 = res;	});
		this.trans.get('MANAGE_REPS_WARNINGS.msg6').subscribe((res: string) => { this.msg6 = res;	});
		this.trans.get('MANAGE_REPS_WARNINGS.msg7').subscribe((res: string) => { this.msg7 = res;	});
		this.trans.get('MANAGE_REPS_WARNINGS.msg8').subscribe((res: string) => { this.msg8 = res;	});
	}
  editEntry(representative) {
		this.newRepAccount = representative.id;
		this.newRepName = representative.name;
		this.newRepTrusted = !!representative.trusted;
		this.newRepWarn = !!representative.warn;
		this.activePanel = 1;
		setTimeout(() => {
			document.getElementById('new-address-name').focus();
		}, 150);
	}

	async saveNewRepresentative() {
		if (!this.newRepAccount || !this.newRepName) {
			const invalidAccountMsg = this.msg1;
			return this.notificationService.sendError(invalidAccountMsg);
		}

		this.newRepAccount = this.newRepAccount.replace(/ /g, ''); // Remove spaces

		// Make sure the address is valid
		const valid = await this.nodeApi.validateAccountNumber(this.newRepAccount);
		if (!valid.result) {
			const invalidAccountMsg = this.msg2;
			return this.notificationService.sendWarning(invalidAccountMsg);
		}

		try {
			await this.repService.saveRepresentative(
				this.newRepAccount,
				this.newRepName,
				this.newRepTrusted,
				this.newRepWarn
			);
			this.notificationService.sendSuccess(this.msg3);

			this.cancelNewRep();
		} catch (err) {
			this.notificationService.sendError(this.msg4 + ` ${err.message}`);
		}
	}

	cancelNewRep() {
		this.newRepName = '';
		this.newRepAccount = '';
		this.newRepTrusted = false;
		this.newRepWarn = false;
		this.activePanel = 0;
	}

	copied() {
		this.notificationService.sendSuccess(this.msg5);
	}

	async getOnlineRepresentatives() {
		const representatives = [];
		const reps = await this.api.onlineRepresentatives();
		if (reps.result) {
			for (const rep of reps.result) {
				representatives.push(rep);
			}
		}

		return representatives;
	}

	async deleteRepresentative(accountID) {
		try {
			this.repService.deleteRepresentative(accountID);
			this.notificationService.sendSuccess(this.msg7);
		} catch (err) {
			this.notificationService.sendError(this.msg8 + ` ${err.message}`);
		}
	}
}
