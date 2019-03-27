import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyaccountsComponent } from './myaccounts.component';

describe('MyaccountsComponent', () => {
  let component: MyaccountsComponent;
  let fixture: ComponentFixture<MyaccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyaccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyaccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
