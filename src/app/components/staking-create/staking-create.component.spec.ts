import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakingCreateComponent } from './staking-create.component';

describe('StakingCreateComponent', () => {
  let component: StakingCreateComponent;
  let fixture: ComponentFixture<StakingCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakingCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakingCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
