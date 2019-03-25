import { TestBed, inject } from '@angular/core/testing';

import { QLCBlockService } from './qlc-block.service';

describe('QlcBlockService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QLCBlockService]
    });
  });

  it('should be created', inject([QLCBlockService], (service: QLCBlockService) => {
    expect(service).toBeTruthy();
  }));
});
