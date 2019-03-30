import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { ClipboardModule } from 'ngx-clipboard';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';
import { NavComponent } from './components/nav/nav.component';
import { HeaderComponent } from './components/header/header.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { RepresentativesComponent } from './components/representatives/representatives.component';
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
    SearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ClipboardModule,
		TooltipModule.forRoot(),
		BsDropdownModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
    AlertModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    }),
    DeviceDetectorModule.forRoot(),
    LoggerModule.forRoot({
			serverLoggingUrl: `${environment.apiUrl}/logs`,
			level: NgxLoggerLevel.DEBUG,
			serverLogLevel: NgxLoggerLevel.ERROR
		})
  ],
  providers: [
    {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpErrorInterceptor,
    multi: true
  }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
