import { Injectable } from '@angular/core';
import { CanActivate,
         ActivatedRouteSnapshot,
         RouterStateSnapshot, 
         Router} from '@angular/router';

import { WalletService } from './services/wallet.service';

@Injectable({
	providedIn: 'root'
})
export class CanActivateRouteGuard implements CanActivate {

    constructor(private wallet: WalletService, public router: Router) {}

    canActivate(): boolean {
        if (!this.wallet.isConfigured()) {
            this.router.navigate(['createwallet']);
            return false;
        }
        return this.wallet.isConfigured();
    }
}