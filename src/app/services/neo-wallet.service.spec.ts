import { TestBed } from '@angular/core/testing';

import { NeoWalletService } from './neo-wallet.service';

describe('NeoWalletService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NeoWalletService = TestBed.get(NeoWalletService);
    expect(service).toBeTruthy();
  });
});
