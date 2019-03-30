import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyrepresentativesComponent } from './myrepresentatives.component';

describe('MyrepresentativesComponent', () => {
  let component: MyrepresentativesComponent;
  let fixture: ComponentFixture<MyrepresentativesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyrepresentativesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyrepresentativesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
