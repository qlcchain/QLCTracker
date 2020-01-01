import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendneoComponent } from './sendneo.component';

describe('SendneoComponent', () => {
  let component: SendneoComponent;
  let fixture: ComponentFixture<SendneoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendneoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendneoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
