import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PovViewComponent } from './pov-view.component';

describe('PovViewComponent', () => {
  let component: PovViewComponent;
  let fixture: ComponentFixture<PovViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PovViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PovViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
