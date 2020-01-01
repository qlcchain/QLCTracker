import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeoImportComponent } from './neo-import.component';

describe('NeoImportComponent', () => {
  let component: NeoImportComponent;
  let fixture: ComponentFixture<NeoImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeoImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeoImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
