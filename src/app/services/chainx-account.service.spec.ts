import { TestBed } from '@angular/core/testing';

import { ChainxAccountService } from './chainx-account.service';

describe('ChainxAccountService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChainxAccountService = TestBed.get(ChainxAccountService);
    expect(service).toBeTruthy();
  });
});
