import { TestBed } from '@angular/core/testing';

import { QLCWebSocketService } from './qlc-websocket.service';

describe('QLCWebSocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QLCWebSocketService = TestBed.get(QLCWebSocketService);
    expect(service).toBeTruthy();
  });
});
