import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

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

import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { QlcPipe } from './pipes/qlc.pipe';
import { NotificationsComponent } from './components/notifications/notifications.component';

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
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
		TooltipModule.forRoot(),
		BsDropdownModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		AlertModule.forRoot(),
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
