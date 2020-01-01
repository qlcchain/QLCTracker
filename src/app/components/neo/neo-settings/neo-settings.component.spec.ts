import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeoSettingsComponent } from './neo-settings.component';

describe('NeoSettingsComponent', () => {
  let component: NeoSettingsComponent;
  let fixture: ComponentFixture<NeoSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeoSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeoSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
