import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUnlockComponent } from './modal-unlock.component';

describe('ModalUnlockComponent', () => {
  let component: ModalUnlockComponent;
  let fixture: ComponentFixture<ModalUnlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalUnlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUnlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
