import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { RepresentativesComponent } from './components/representatives/representatives.component';
import { TokensComponent } from './components/tokens/tokens.component';
import { TransactionComponent } from './components/transaction/transaction.component';
import { AccountComponent } from './components/account/account.component';
import { TopwalletsComponent } from './components/topwallets/topwallets.component';
import { LoginComponent } from './components/login/login.component';
import { MyaccountComponent } from './components/myaccount/myaccount.component';
import { CreatewalletComponent } from './components/createwallet/createwallet.component';
import { ImportWalletComponent } from './components/import-wallet/import-wallet.component';
import { MyaccountsComponent } from './components/myaccounts/myaccounts.component';
import { SendComponent } from './components/send/send.component';
import { SearchComponent } from './components/search/search.component';
import { SettingsComponent } from './components/settings/settings.component';
import { MyrepresentativesComponent } from './components/myrepresentatives/myrepresentatives.component';
import { ManageRepresentativesComponent } from './components/manage-representatives/manage-representatives.component';
import { ImportAddressBookComponent } from './components/import-address-book/import-address-book.component';
import { NeoCreateComponent } from './components/neo-create/neo-create.component';
import { NeoImportComponent } from './components/neo-import/neo-import.component';
import { MyneowalletComponent } from './components/myneowallet/myneowallet.component';
import { SendneoComponent } from './components/sendneo/sendneo.component';
import { MystakingsComponent } from './components/mystakings/mystakings.component';
import { StakingCreateComponent } from './components/staking-create/staking-create.component';
import { StakingRevokeComponent } from './components/staking-revoke/staking-revoke.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'transactions/:page', component: TransactionsComponent },
  { path: 'transactions/:page/:account', component: TransactionsComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'transaction/:transaction', component: TransactionComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'accounts/:page', component: AccountsComponent },
  { path: 'account', component: AccountComponent },
  { path: 'account/:account', component: AccountComponent },
  { path: 'representatives', component: RepresentativesComponent },
  { path: 'tokens', component: TokensComponent },
  { path: 'topwallets', component: TopwalletsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'createwallet', component: CreatewalletComponent },
  { path: 'import-wallet', component: ImportWalletComponent },
  { path: 'myaccount', component: MyaccountComponent },
  { path: 'myaccount/:account', component: MyaccountComponent },
  { path: 'myaccounts', component: MyaccountsComponent },
  { path: 'send', component: SendComponent },
  { path: 'send/:account', component: SendComponent },
  { path: 'search/:hash', component: SearchComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'myrepresentatives', component: MyrepresentativesComponent },
  { path: 'manage-representatives', component: ManageRepresentativesComponent },
  { path: 'import-address-book', component: ImportAddressBookComponent },
  { path: 'create-neo-wallet', component: NeoCreateComponent },
  { path: 'import-neo-wallet', component: NeoImportComponent },
  { path: 'myneowallet/:wallet', component: MyneowalletComponent },
  { path: 'sendneo', component: SendneoComponent },
  { path: 'sendneo/:wallet', component: SendneoComponent },
  { path: 'mystakings', component: MystakingsComponent },
  { path: 'staking-create', component: StakingCreateComponent },
  { path: 'staking-revoke', component: StakingRevokeComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
