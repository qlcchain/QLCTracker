import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainxSendComponent } from './chainx-send.component';

describe('ChainxSendComponent', () => {
  let component: ChainxSendComponent;
  let fixture: ComponentFixture<ChainxSendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainxSendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainxSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
