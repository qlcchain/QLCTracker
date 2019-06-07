import { TestBed } from '@angular/core/testing';

import { ApiNEP5Service } from './api-nep5.service';

describe('ApiNEP5Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiNEP5Service = TestBed.get(ApiNEP5Service);
    expect(service).toBeTruthy();
  });
});
