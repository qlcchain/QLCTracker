import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeoCreateComponent } from './neo-create.component';

describe('NeoCreateComponent', () => {
  let component: NeoCreateComponent;
  let fixture: ComponentFixture<NeoCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeoCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
