import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { ClipboardModule } from 'ngx-clipboard';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { NavComponent } from './components/nav/nav.component';
import { HeaderComponent } from './components/header/header.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { RepresentativesComponent } from './components/qlc/representation/representatives/representatives.component';
import { TokensComponent } from './components/tokens/tokens.component';
import { AccountComponent } from './components/account/account.component';
import { TransactionComponent } from './components/transaction/transaction.component';
import { TopwalletsComponent } from './components/topwallets/topwallets.component';
import { LoginComponent } from './components/login/login.component';
import { CreatewalletComponent } from './components/createwallet/createwallet.component';
import { MyaccountComponent } from './components/myaccount/myaccount.component';

import {HttpClientModule, HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { QlcPipe } from './pipes/qlc.pipe';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ImportWalletComponent } from './components/import-wallet/import-wallet.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { MyaccountsComponent } from './components/myaccounts/myaccounts.component';
import { SendComponent } from './components/send/send.component';
import { FiatPipe } from './pipes/fiat.pipe';
import { SearchComponent } from './components/search/search.component';
import { SettingsComponent } from './components/settings/settings.component';
import { MyrepresentativesComponent } from './components/qlc/representation/myrepresentatives/myrepresentatives.component';
import { SqueezePipe } from './pipes/squeeze.pipe';
import { ManageRepresentativesComponent } from './components/qlc/representation/manage-representatives/manage-representatives.component';
import { ImportAddressBookComponent } from './components/import-address-book/import-address-book.component';
import { NeoImportComponent } from './components/neo/neo-import/neo-import.component';
import { NeoCreateComponent } from './components/neo/neo-create/neo-create.component';
import { MyneowalletComponent } from './components/neo/myneowallet/myneowallet.component';
import { SendneoComponent } from './components/neo/sendneo/sendneo.component';
import { StakingCreateComponent } from './components/staking-create/staking-create.component';
import { MystakingsComponent } from './components/mystakings/mystakings.component';
import { StakingRevokeComponent } from './components/staking-revoke/staking-revoke.component';
import { AmountValidatorDirective } from './directives/amount-validator.directive';
import { ModalUnlockComponent } from './components/modal-unlock/modal-unlock.component';
import { DesktopComponent } from './components/desktop/desktop.component';
import { NeoSettingsComponent } from './components/neo/neo-settings/neo-settings.component';
import { ChainxCreateComponent } from './components/chainx/chainx-create/chainx-create.component';
import { ChainxStakingComponent } from './components/chainx/chainx-staking/chainx-staking.component';
import { ChainxAccountComponent } from './components/chainx/chainx-account/chainx-account.component';
import { ChainxSendComponent } from './components/chainx/chainx-send/chainx-send.component';
import { MiningComponent } from './components/qlc/mining/mining/mining.component';
import { PovViewComponent } from './components/pov-view/pov-view.component';
import { PovExplorerComponent } from './components/pov-explorer/pov-explorer.component';
import { NewsComponent } from './components/news/news.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';

import { ChartjsModule } from '@ctrl/ngx-chartjs';
import { NoCommaPipe } from './pipes/no-comma.pipe';
import { CanActivateRouteGuard } from './app-routing.guard';
import { RepresentationRewardComponent } from './components/qlc/representation/representation-reward/representation-reward.component';
import { MiningRewardComponent } from './components/qlc/mining/mining-reward/mining-reward.component';
import { UserSubmenuComponent } from './components/user-dashboard/user-submenu/user-submenu.component';
import { StakingDashboardComponent } from './components/staking-dashboard/staking-dashboard.component';
import { SqueezeNumberPipe } from './pipes/squeeze-number.pipe';
import { PortalComponent } from './components/portal/portal.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavComponent,
    HeaderComponent,
    TransactionsComponent,
    AccountsComponent,
    RepresentativesComponent,
    TokensComponent,
    AccountComponent,
    TransactionComponent,
    TopwalletsComponent,
    LoginComponent,
    CreatewalletComponent,
    MyaccountComponent,
    QlcPipe,
    NotificationsComponent,
    ImportWalletComponent,
    AutofocusDirective,
    MyaccountsComponent,
    SendComponent,
    FiatPipe,
    SearchComponent,
    SettingsComponent,
    MyrepresentativesComponent,
    SqueezePipe,
    ManageRepresentativesComponent,
    ImportAddressBookComponent,
    NeoImportComponent,
    NeoCreateComponent,
    MyneowalletComponent,
    SendneoComponent,
    StakingCreateComponent,
    MystakingsComponent,
    StakingRevokeComponent,
    AmountValidatorDirective,
    ModalUnlockComponent,
    DesktopComponent,
    NeoSettingsComponent,
    ChainxCreateComponent,
    ChainxStakingComponent,
    ChainxAccountComponent,
    ChainxSendComponent,
    MiningComponent,
    PovViewComponent,
    PovExplorerComponent,
    NewsComponent,
    UserDashboardComponent,
    NoCommaPipe,
    RepresentationRewardComponent,
    MiningRewardComponent,
    UserSubmenuComponent,
    StakingDashboardComponent,
    SqueezeNumberPipe,
    PortalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    ChartjsModule,
		TooltipModule.forRoot(),
		BsDropdownModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
    PopoverModule.forRoot(),
    AlertModule.forRoot(),
    CarouselModule.forRoot(),
    ProgressbarModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    }),
    DeviceDetectorModule.forRoot(),
    LoggerModule.forRoot({
			serverLoggingUrl: `${environment.rpcUrl}/logs`,
			level: NgxLoggerLevel.DEBUG,
			serverLogLevel: NgxLoggerLevel.ERROR
		})
  ],
  providers: [
    {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpErrorInterceptor,
    multi: true
    },
    CanActivateRouteGuard
],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalUnlockComponent    
  ]
})
export class AppModule { }
