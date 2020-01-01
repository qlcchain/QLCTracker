import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainxAccountComponent } from './chainx-account.component';

describe('ChainxAccountComponent', () => {
  let component: ChainxAccountComponent;
  let fixture: ComponentFixture<ChainxAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainxAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainxAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
