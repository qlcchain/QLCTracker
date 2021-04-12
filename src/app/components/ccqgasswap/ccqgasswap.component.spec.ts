import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcqgasswapComponent } from './ccqgasswap.component';

describe('CcqgasswapComponent', () => {
  let component: CcqgasswapComponent;
  let fixture: ComponentFixture<CcqgasswapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcqgasswapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcqgasswapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
