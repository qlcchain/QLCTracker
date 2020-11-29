import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcswapComponent } from './ccswap.component';

describe('CcswapComponent', () => {
  let component: CcswapComponent;
  let fixture: ComponentFixture<CcswapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcswapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcswapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
