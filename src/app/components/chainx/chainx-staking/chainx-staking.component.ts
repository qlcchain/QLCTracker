import { Component, OnInit } from '@angular/core';
import { ChainxAccountService } from '../../../services/chainx-account.service';
import { NotificationService } from '../../../services/notification.service';
import { WalletService } from '../../../services/wallet.service';
import { CurrencyPipe } from '@angular/common';
import BigNumber from 'bignumber.js';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressBookService } from '../../../services/address-book.service';
import { NoCommaPipe } from '../../../pipes/no-comma.pipe';

export interface NominationUnfreeze {
  sender: string;
  target: string;
  revocations: Revocations[];
}

export interface Revocations {
  value: number;
  blockNumber: number;
}

export interface NominationTotal {
  staking: number;
  unfreezeLocked: number;
  unclaimed: number;
}

@Component({
  selector: 'app-chainx-staking',
  templateUrl: './chainx-staking.component.html',
  styleUrls: ['./chainx-staking.component.scss'],
  providers: [CurrencyPipe, NoCommaPipe]
})
export class ChainxStakingComponent implements OnInit {
  chainxAccounts = this.walletService.wallet.chainxAccounts;
  chainxAccount = {
    id: '',
    addressBookName: null,
    balances: null,
    wif: null
  };
  nominationRecords = [];
  nominationRecordsUnfreeze: NominationUnfreeze;
  nominationTotal: NominationTotal;
  amount = null;
  accountFrom = '';
  memo = '';
  candidates;
  candidate = null;
  candidateStaked = 0;
  loading = true;
  defaultLogo = false;
  step: number;
  alreadyInvoking = false;
  alreadyClaiming = false;
  changeStaking = 'increase';
  stakingWarning = false;
  unfreezing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private currencyPipe: CurrencyPipe,
    private addressBookService: AddressBookService,
    private notificationService: NotificationService,
    private walletService: WalletService,
    public chainxAccountService: ChainxAccountService,
    public noCommaPipe: NoCommaPipe
  ) {
  }

  async ngOnInit() {
    const route = this.route.snapshot.url;

    // await this.chainxAccountService.getTransfers(3416020);
    // await this.chainxAccountService.getTransfers(3365865); // expired
    // await this.chainxAccountService.getTransfers(3365885); // expired
    // await this.chainxAccountService.getTransfers(3365961); // expired
    // await this.chainxAccountService.getTransfers(3365981); // expired
    // await this.chainxAccountService.getTransfers(3422428);
    // await this.chainxAccountService.getTransfers(3423063);
    // await this.chainxAccountService.getTransfers(3423078);
    // await this.chainxAccountService.getTransfers(3423304);
    // await this.chainxAccountService.getTransfers(3437693);

    switch (route[route.length - 1].path) {
      case 'invoke' : {
        this.step = 2;
        this.loadCandidates();
      }
        break;
      default : {
        this.step = 1;
        await this.loadCandidates(false);
        await this.getNominatioRecords();
      }
    }
  }

  private transformAmount(amount): string {
    return this.currencyPipe.transform(amount, '', '', '1.2-8');
  }

  async loadCandidates(invoking = true) {
    this.candidates = await this.chainxAccountService.getCandidates();
    this.candidates = this.candidates.filter(e => e.isActive).sort((a, b) => b.selfVote - a.selfVote);

    if (invoking) {
      this.loading = false;
    }
  }

  async getNominatioRecords() {
    let stakingTotal = 0;
    let unfreezeLockedTotal = 0;
    let unclaimedTotal = 0;

    for (const chainxAccount of this.chainxAccounts) {
      const stakingDividend = await this.chainxAccountService.getStakingDividendByAccount(chainxAccount.id);
      const nominationRecords = await this.chainxAccountService.getNominationRecords(chainxAccount.id);

      for (const nominationRecord of nominationRecords) {
        const candidate = this.candidates.find(e => e.account === nominationRecord[0]);

        nominationRecord.candidate = candidate;
        nominationRecord.candidateAddress = this.chainxAccountService.getPublicAddress(nominationRecord[0]);
        nominationRecord.jackpot = candidate.jackpot;
        nominationRecord.unclaimed = (Object.entries(stakingDividend).find(e => e[0] === nominationRecord[0]))[1];
        nominationRecord.unfreezeReserved = 0;
        nominationRecord.unfreezeReserved = nominationRecord[1].revocations.reduce(
          (prev: BigNumber, current: any) => prev.plus(new BigNumber(current.value)),
          new BigNumber(0)
        );

        stakingTotal += Number(nominationRecord[1].nomination);
        unfreezeLockedTotal += Number(nominationRecord.unfreezeReserved);
        unclaimedTotal += Number(nominationRecord.unclaimed);
      }

      this.nominationRecords.push({
        address: chainxAccount.id,
        publicKey: this.chainxAccountService.getPublicKey(chainxAccount.id),
        name: this.addressBookService.getAccountName(chainxAccount.id),
        nominations: nominationRecords
      });
    }

    this.nominationTotal = {
      staking: stakingTotal,
      unfreezeLocked: unfreezeLockedTotal,
      unclaimed: unclaimedTotal
    };
  }

  async loadAccount(refresh = false) {
    const account = this.chainxAccounts.find(a => a.id === this.chainxAccounts[0].id);

    if (account === undefined) {
      return this.notificationService.sendError('Address does not exists.');
    }

    this.chainxAccount = account;
    this.accountFrom = account.id;
    const assets = await this.chainxAccountService.getAssetsByAccount(this.chainxAccount.id);

    for (const asset of assets.data) {
      this.chainxAccount.balances = asset.details;
    }
  }

  async updateStakingData() {
    if (!this.nominationTotal) {
      return this.getNominatioRecords();
    }

    let stakingTotal = 0;
    let unfreezeLockedTotal = 0;
    let unclaimedTotal = 0;

    for (const nominationRecord of this.nominationRecords) {
      const stakingDividend = await this.chainxAccountService.getStakingDividendByAccount(nominationRecord.address);
      const nominationRecords = await this.chainxAccountService.getNominationRecords(nominationRecord.address);

      for (const nomination of nominationRecord.nominations) {
        nomination.unclaimed = (Object.entries(stakingDividend).find(e => e[0] === nomination[0]))[1];
        nomination[1].nomination = nominationRecords.find(e => e[0] === nomination[0])[1].nomination;
        nomination.unfreezeReserved = 0;
        nomination.unfreezeReserved = nominationRecords.find(e => e[0] === nomination[0])[1].revocations.reduce(
          (prev: BigNumber, current: any) => prev.plus(new BigNumber(current.value)),
          new BigNumber(0)
        );

        stakingTotal += Number(nomination[1].nomination);
        unfreezeLockedTotal += Number(nomination.unfreezeReserved);
        unclaimedTotal += Number(nomination.unclaimed);
      }
    }

    this.nominationTotal.staking = stakingTotal;
    this.nominationTotal.unfreezeLocked = unfreezeLockedTotal;
    this.nominationTotal.unclaimed = unclaimedTotal;
  }

  async claim(sender, target) {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    this.alreadyClaiming = true;

    try {
      const data = {
        sender,
        target
      };

      await this.chainxAccountService.claim(data);
      this.notificationService.sendSuccess(`Claim asset type: PCX`);
    } catch (err) {
      console.log(err);
      this.alreadyInvoking = false;

      if (typeof err.message !== 'undefined') {
        this.notificationService.sendError(err.message);
      } else if (typeof err.result !== 'undefined') {
        this.notificationService.sendError(`Some error occurred: ${err.result}`);
      }
    }

    this.alreadyClaiming = false;

    this.updateStakingData();
  }

  async invoke() {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    if (!this.accountFrom) {
      return this.notificationService.sendWarning('Missing account of sender.');
    }

    this.amount = this.noCommaPipe.transform(this.amount);

    if (!this.amount || parseFloat(this.amount) === 0) {
      return this.notificationService.sendWarning('Amount is missing.');
    }

    this.alreadyInvoking = true;

    try {
      const amount = this.amount * this.chainxAccountService.divisor;
      const data = {
        sender: this.accountFrom,
        target: this.chainxAccountService.getPublicAddress(this.candidate.account),
        memo: this.memo,
        amount
      };

      await this.chainxAccountService.nominate(data);
      this.notificationService.sendSuccess(`Invoke amount: ${this.transformAmount(amount / this.chainxAccountService.divisor)}. PCX: Memo: ${this.memo}`);

    } catch (err) {
      console.log(err);

      if (typeof err.message !== 'undefined') {
        this.notificationService.sendError(err.message);
      } else if (typeof err.result !== 'undefined') {
        this.notificationService.sendError(`Some error occurred: ${err.result}. Please try again later`);
      }
    }

    this.resetFields();
    this.updateStakingData();
    this.step = 1;
    this.router.navigateByUrl('/staking/chainx');
  }

  async revoke() {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    if (!this.accountFrom) {
      return this.notificationService.sendWarning('Missing account of sender.');
    }

    if (!this.candidate) {
      return this.notificationService.sendWarning('Missing account of candidate.');
    }

    this.amount = this.noCommaPipe.transform(this.amount);

    if (!this.amount || parseFloat(this.amount) === 0) {
      return this.notificationService.sendWarning('Amount is missing.');
    }

    this.alreadyInvoking = true;

    try {
      const amount = this.amount * this.chainxAccountService.divisor;
      const data = {
        sender: this.accountFrom,
        target: this.chainxAccountService.getPublicAddress(this.candidate.account),
        memo: this.memo,
        amount
      };

      await this.chainxAccountService.unnominate(data);
      this.notificationService.sendSuccess(`Revoke amount: ${this.transformAmount(amount / this.chainxAccountService.divisor)}. PCX: Memo: ${this.memo}`);
    } catch (err) {
      console.log(err);

      if (typeof err.message !== 'undefined') {
        this.notificationService.sendError(err.message);
      } else if (typeof err.result !== 'undefined') {
        this.notificationService.sendError(`Some error occurred: ${err.result}`);
      }
    }

    this.resetFields();
    this.updateStakingData();
    this.step = 1;
  }

  async invokeChange(sender, target, staked) {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    this.accountFrom = sender;
    this.candidate = target;
    this.candidateStaked = staked;
    this.step = 4;
    this.chainxAccount = this.chainxAccounts.find(e => e.id === this.accountFrom);
    const assets = await this.chainxAccountService.getAssetsByAccount(this.chainxAccount.id);

    for (const asset of assets.data) {
      this.chainxAccount.balances = asset.details;
    }
  }

  async unfreeze(sender, target, revocationIndex) {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }
    this.unfreezing = true;

    try {
      const data = {
        sender,
        target,
        revocationIndex
      };

      await this.chainxAccountService.unfreeze(data);
      this.notificationService.sendSuccess(`Unfreeze success.`);

      this.unfreezeDetails(sender, this.chainxAccountService.getPublicKey(target));
    }
    catch (err) {
      console.log(err);

      if (typeof err.message !== 'undefined') {
        this.notificationService.sendError(err.message);
      } else if (typeof err.result !== 'undefined') {
        this.notificationService.sendError(`Some error occurred: ${err.result}. You can unfreeze your assets after 3 days.`);
      }
    }
    finally {
      this.unfreezing = false;
    }
  }

  async unfreezeDetails(sender, candidateAccount) {
    if (this.walletService.walletIsLocked()) {
      return this.notificationService.sendWarning('ERROR wallet locked');
    }

    this.accountFrom = sender;
    this.candidate = candidateAccount;
    this.step = 5;

    const nominationRecords = await this.chainxAccountService.getNominationRecords(this.accountFrom);
    const nominationRecord = nominationRecords.find(e => e[0] === this.candidate);
    const target = this.chainxAccountService.getPublicAddress(nominationRecord[0]);

    this.nominationRecordsUnfreeze = {
      revocations: nominationRecord[1].revocations,
      sender,
      target
    };
  }

  async selectAccount() {
    this.chainxAccount = this.chainxAccounts.find(e => e.id === this.accountFrom);
    const assets = await this.chainxAccountService.getAssetsByAccount(this.chainxAccount.id);

    for (const asset of assets.data) {
      this.chainxAccount.balances = asset.details;
    }

    this.amount = null;
  }

  backToNominates(): void {
    this.resetFields();
    this.step = 2;
  }

  checkAmount(action = '') {
    let amount = Number(this.noCommaPipe.transform(this.amount)) * this.chainxAccountService.divisor;

    if (this.chainxAccount.balances === null || !amount || amount < 0) {
      amount = 0;
    } else if (new BigNumber(amount).gt(new BigNumber(this.chainxAccount.balances.Free))) {
      amount = this.chainxAccount.balances.Free;
    }

    if (this.step === 3 || this.step === 4) {
      if (!action) {
        const availableAmount = (this.candidate.selfVote * 10) - this.candidate.totalNomination;

        if (new BigNumber(amount).gt(new BigNumber(availableAmount))) {
          this.stakingWarning = true;
        } else {
          this.stakingWarning = false;
        }
      }
      else {
        if (new BigNumber(amount).gt(new BigNumber(this.candidateStaked))) {
          amount = this.candidateStaked;
        }
      }
    }

    this.amount = this.transformAmount(amount / this.chainxAccountService.divisor);
  }

  vote(account): void {
    this.candidate = account;
    this.loadAccount();
    this.step = 3;
  }

  async setMaxAmount(action = 'invoke') {
    const amount = new BigNumber(this.amount * this.chainxAccountService.divisor);

    switch (action) {
      case 'invoke': {
        const availableAmount = new BigNumber((this.candidate.selfVote * 10) - this.candidate.totalNomination);

        if (amount.eq(0)) {
          if (this.chainxAccount.balances) {
            if (new BigNumber(this.chainxAccount.balances.Free).gt(availableAmount)) {
              this.amount = availableAmount;
            }
            else {
              this.amount = this.chainxAccount.balances.Free;
            }
          }
        }
        else if (amount.gt(availableAmount)) {
          this.amount = availableAmount;
        }

        this.stakingWarning = false;
      } break;
      case 'revoke' : {
        this.amount = this.candidateStaked;
      } break;
      default : {
        this.amount = this.chainxAccount.balances === null ? 0 : this.chainxAccount.balances.Free;
      }
    }

    this.amount = this.transformAmount(Number(this.amount) / this.chainxAccountService.divisor);
  }

  private resetFields(): void {
    this.amount = null;
    this.accountFrom = '';
    this.memo = '';
    this.candidate = null;
    this.alreadyInvoking = false;
  }

  // private async request(url): Promise<any> {
  //   return await this.http
  //     .get(url)
  //     .toPromise()
  //     .then(res => {
  //       return res;
  //     })
  //     .catch(err => {
  //       if (err.status === 500 || err.status === 0) {
  //       }
  //       throw err;
  //     });
  // }

  checkImage() {
    this.defaultLogo = !this.defaultLogo;

    // console.log(this.candidates);
    // const status = await this.request('https://chainx-validators-logo.oss-cn-hangzhou.aliyuncs.com/hotbit.png');
    // console.log(status);

    return this.defaultLogo;
  }
}
