import { TestBed } from '@angular/core/testing';

import { ApiConfidantService } from './api-confidant.service';

describe('ApiConfidantService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiConfidantService = TestBed.get(ApiConfidantService);
    expect(service).toBeTruthy();
  });
});
