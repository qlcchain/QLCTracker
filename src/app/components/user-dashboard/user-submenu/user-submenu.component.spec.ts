import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubmenuComponent } from './user-submenu.component';

describe('UserSubmenuComponent', () => {
  let component: UserSubmenuComponent;
  let fixture: ComponentFixture<UserSubmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSubmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
