import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MystakingsComponent } from './mystakings.component';

describe('MystakingsComponent', () => {
  let component: MystakingsComponent;
  let fixture: ComponentFixture<MystakingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MystakingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MystakingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
