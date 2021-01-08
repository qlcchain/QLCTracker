import { TestBed } from '@angular/core/testing';

import { EtherWalletService } from './ether-wallet.service';

describe('EtherWalletService', () => {
  let service: EtherWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtherWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
