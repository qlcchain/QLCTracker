import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NewsComponent } from './components/news/news.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { RepresentativesComponent } from './components/qlc/representation/representatives/representatives.component';
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
import { MyrepresentativesComponent } from './components/qlc/representation/myrepresentatives/myrepresentatives.component';
import { ManageRepresentativesComponent } from './components/qlc/representation/manage-representatives/manage-representatives.component';
import { ImportAddressBookComponent } from './components/import-address-book/import-address-book.component';
import { NeoCreateComponent } from './components/neo/neo-create/neo-create.component';
import { NeoImportComponent } from './components/neo/neo-import/neo-import.component';
import { MyneowalletComponent } from './components/neo/myneowallet/myneowallet.component';
import { SendneoComponent } from './components/neo/sendneo/sendneo.component';
import { MystakingsComponent } from './components/mystakings/mystakings.component';
import { StakingCreateComponent } from './components/staking-create/staking-create.component';
import { StakingRevokeComponent } from './components/staking-revoke/staking-revoke.component';
import { ChainxCreateComponent } from './components/chainx/chainx-create/chainx-create.component';
import { ChainxAccountComponent } from './components/chainx/chainx-account/chainx-account.component';
import { ChainxSendComponent } from './components/chainx/chainx-send/chainx-send.component';
import { ChainxStakingComponent } from './components/chainx/chainx-staking/chainx-staking.component';
import { NeoSettingsComponent } from './components/neo/neo-settings/neo-settings.component';
import { MiningComponent } from './components/qlc/mining/mining/mining.component';
import { PovExplorerComponent } from './components/pov-explorer/pov-explorer.component';
import { PovViewComponent } from './components/pov-view/pov-view.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { CanActivateRouteGuard } from './app-routing.guard';
import { RepresentationRewardComponent } from './components/qlc/representation/representation-reward/representation-reward.component';
import { MiningRewardComponent } from './components/qlc/mining/mining-reward/mining-reward.component';
import { StakingDashboardComponent } from './components/staking-dashboard/staking-dashboard.component';

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
  { path: 'login', component: LoginComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'createwallet', component: CreatewalletComponent },
  { path: 'import-wallet', component: ImportWalletComponent },
  { path: 'search/:hash', component: SearchComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'representation', component: MyrepresentativesComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'representation/manage', component: ManageRepresentativesComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'representation/reward', component: RepresentationRewardComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'representation/list', component: RepresentativesComponent },
  { path: 'import-address-book', component: ImportAddressBookComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets', component: MyaccountsComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/qlc/send', component: SendComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/qlc/send/:account', component: SendComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/qlc', component: MyaccountComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/qlc/:account', component: MyaccountComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/neo/create', component: NeoCreateComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/neo/send', component: SendneoComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/neo/send/:wallet', component: SendneoComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/neo/import', component: NeoImportComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/neo/settings', component: NeoSettingsComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/neo/:wallet', component: MyneowalletComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/chainx/account/create', component: ChainxCreateComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/chainx/account/:address', component: ChainxAccountComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/chainx/send', component: ChainxSendComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'wallets/chainx/send/:address', component: ChainxSendComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'staking', component: StakingDashboardComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'staking/qlc', component: MystakingsComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'staking/qlc/create', component: StakingCreateComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'staking/qlc/revoke', component: StakingRevokeComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'staking/chainx', component: ChainxStakingComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'staking/chainx/invoke', component: ChainxStakingComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'mining', component: MiningComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'mining/reward', component: MiningRewardComponent, canActivate: [CanActivateRouteGuard] },
  { path: 'pov-explorer', component: PovExplorerComponent },
  { path: 'pov-explorer/:page', component: PovExplorerComponent },
  { path: 'pov', component: PovViewComponent },
  { path: 'pov/:type/:hash', component: PovViewComponent },
  { path: 'news', component: NewsComponent },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [CanActivateRouteGuard] },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
