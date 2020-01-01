import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiningRewardComponent } from './mining-reward.component';

describe('MiningRewardComponent', () => {
  let component: MiningRewardComponent;
  let fixture: ComponentFixture<MiningRewardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiningRewardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiningRewardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
