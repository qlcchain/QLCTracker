import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakingRevokeComponent } from './staking-revoke.component';

describe('StakingRevokeComponent', () => {
  let component: StakingRevokeComponent;
  let fixture: ComponentFixture<StakingRevokeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakingRevokeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakingRevokeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
