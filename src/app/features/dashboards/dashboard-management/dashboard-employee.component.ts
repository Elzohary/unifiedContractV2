import { Component, inject, OnInit, HostListener, ViewChild, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SideMenuContentComponent } from './components/side-menu-content/side-menu-content.component';
import { RouterOutlet } from '@angular/router';
import { HeaderDashboardManagementComponent } from './layouts/header-dashboard-management/header-dashboard-management.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../shared/services/theme.service';

@Component({
  selector: 'app-dashboard-employee',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    SideMenuContentComponent,
    RouterOutlet,
    HeaderDashboardManagementComponent,
    MatGridListModule
  ],
  templateUrl: './dashboard-employee.component.html',
  styleUrl: './dashboard-employee.component.scss'
})
export class DashboardEmployeeComponent implements OnInit {
  private _themeService = inject(ThemeService);
  private isBrowser: boolean;
  
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  isDrawerOpen = signal(true);
  isMobile = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    // Only access window if in browser environment
    if (this.isBrowser) {
      const isMobileView = window.innerWidth < 992;
      this.isMobile.set(isMobileView);
      
      // Auto-close drawer on mobile screens
      if (isMobileView && this.isDrawerOpen()) {
        this.isDrawerOpen.set(false);
      }
    } else {
      // Default values for SSR
      this.isMobile.set(false);
      this.isDrawerOpen.set(true);
    }
  }

  sideMenuToggle() {
    this.isDrawerOpen.set(!this.isDrawerOpen());
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }
}
