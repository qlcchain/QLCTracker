import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainxStakingComponent } from './chainx-staking.component';

describe('ChainxStakingComponent', () => {
  let component: ChainxStakingComponent;
  let fixture: ComponentFixture<ChainxStakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainxStakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainxStakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
