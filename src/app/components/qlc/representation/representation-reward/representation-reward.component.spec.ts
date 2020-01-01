import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepresentationRewardComponent } from './representation-reward.component';

describe('RepresentationRewardComponent', () => {
  let component: RepresentationRewardComponent;
  let fixture: ComponentFixture<RepresentationRewardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepresentationRewardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepresentationRewardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
