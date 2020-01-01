import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyneowalletComponent } from './myneowallet.component';

describe('MyneowalletComponent', () => {
  let component: MyneowalletComponent;
  let fixture: ComponentFixture<MyneowalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyneowalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyneowalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
