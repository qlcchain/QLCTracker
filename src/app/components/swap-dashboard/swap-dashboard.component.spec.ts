import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapDashboardComponent } from './swap-dashboard.component';

describe('SwapDashboardComponent', () => {
  let component: SwapDashboardComponent;
  let fixture: ComponentFixture<SwapDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwapDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
