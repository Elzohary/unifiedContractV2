import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WoCardWithTabsComponent } from './wo-card-with-tabs.component';

describe('WoCardWithTabsComponent', () => {
  let component: WoCardWithTabsComponent;
  let fixture: ComponentFixture<WoCardWithTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WoCardWithTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WoCardWithTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
