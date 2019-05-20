import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { WalletService } from 'src/app/services/wallet.service';
import { AddressBookService } from 'src/app/services/address-book.service';
import { NeoWalletService } from 'src/app/services/neo-wallet.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-staking-create',
  templateUrl: './staking-create.component.html',
  styleUrls: ['./staking-create.component.scss']
})
export class StakingCreateComponent implements OnInit {

  accounts = this.walletService.wallet.accounts;
  neowallets = this.walletService.wallet.neowallets;
  stakingTypes = [
    {
      minAmount : 1,
      minTime: 10
    },
    {
      minAmount : 2000,
      minTime: 90
    },
    {
      minAmount : 500000,
      minTime: 180
    }
  ];
  

  stakingForm = new FormGroup({
    stakingType: new FormControl('0'),
    fromNEOWallet: new FormControl(''),
    toQLCWallet: new FormControl(''),
    availableQLCBalance: new FormControl('0'),
    endDate: new FormControl(''),
    amounToStake: new FormControl(''),
    durationInDays: new FormControl(''),
    tokenName: new FormControl(''),
    tokenSymbol: new FormControl(''),
    tokenSupply: new FormControl(''),
    tokenDecimals: new FormControl('')
  });

  constructor(
    private walletService: WalletService,
    private addressBookService: AddressBookService,
    private neoService: NeoWalletService
  ) { }

  ngOnInit() {
    this.loadBalances();
  }

  async loadBalances() {
		for (let i = 0; i < this.neowallets.length; i++) {
			this.neowallets[i].balances = [];
			this.neowallets[i].addressBookName = this.addressBookService.getAccountName(this.neowallets[i].id);
			const balance:any = await this.neoService.getBalance(this.neowallets[i].id);
			for (const asset of balance.assetSymbols) {
				this.neowallets[i].balances[asset] = new BigNumber(balance.assets[asset].balance).toFixed();
      }
			for (const token of balance.tokenSymbols) {
				let newTokenBalance = new BigNumber(balance.tokens[token]).toFixed();
				if (newTokenBalance == 'NaN')
					newTokenBalance = '0';
        this.neowallets[i].balances[token] = newTokenBalance;
			}
    }
    this.selectAccount();
    this.setDuration();
  }
  
  selectAccount() {
		if (this.stakingForm.value.fromNEOWallet == '') {
      if (this.neowallets[0] != undefined && this.neowallets[0].id != undefined) {
        this.stakingForm.get('fromNEOWallet').setValue(this.neowallets[0].id);
        
      }
    }
    if (this.stakingForm.value.toQLCWallet == '') {
      if (this.accounts[0] != undefined && this.accounts[0].id != undefined) {
        this.stakingForm.get('toQLCWallet').setValue(this.accounts[0].id);
      }
    }

    const selectedNEOWallet = this.neowallets.find(a => a.id === this.stakingForm.value.fromNEOWallet);

    this.stakingForm.get('availableQLCBalance').setValue((selectedNEOWallet.balances['QLINK TOKEN'] != undefined? selectedNEOWallet.balances['QLINK TOKEN'] : 0));
        


		
  }
  
  setDuration() {
    let now = new Date();
    if (this.stakingForm.value.durationInDays == '') {
      this.stakingForm.get('durationInDays').setValue(this.stakingTypes[this.stakingForm.value.stakingType].minTime);
    }
    now.setDate(now.getDate() + Number(this.stakingForm.value.durationInDays));
    this.stakingForm.get('endDate').setValue(now);
  }

}
