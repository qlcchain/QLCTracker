import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakingDashboardComponent } from './staking-dashboard.component';

describe('StakingDashboardComponent', () => {
  let component: StakingDashboardComponent;
  let fixture: ComponentFixture<StakingDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakingDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
