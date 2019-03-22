import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopwalletsComponent } from './topwallets.component';

describe('TopwalletsComponent', () => {
  let component: TopwalletsComponent;
  let fixture: ComponentFixture<TopwalletsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopwalletsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopwalletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
