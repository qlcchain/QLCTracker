import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PovExplorerComponent } from './pov-explorer.component';

describe('PovExplorerComponent', () => {
  let component: PovExplorerComponent;
  let fixture: ComponentFixture<PovExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PovExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PovExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
