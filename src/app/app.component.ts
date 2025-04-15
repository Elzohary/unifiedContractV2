import { Component, inject, OnInit, HostListener, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { ThemeService } from './shared/services/theme.service';
import { filter } from 'rxjs/operators';
import { SideMenuContentComponent } from './features/dashboards/dashboard-management/components/side-menu-content/side-menu-content.component';
import { HeaderDashboardManagementComponent } from './features/dashboards/dashboard-management/layouts/header-dashboard-management/header-dashboard-management.component';
import { WORK_ORDER_PROVIDERS } from './domains/work-order/work-order.providers';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    SideMenuContentComponent,
    HeaderDashboardManagementComponent
  ],
  providers: [
    ...WORK_ORDER_PROVIDERS
  ],
  template: `
    <div class="dashboard-container">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'"
                     [opened]="!isMobile"
                     [fixedInViewport]="true"
                     class="app-sidenav">
          <div class="sidenav-header">
            <div class="logo-container">
              <img src="assets/logo.png" alt="Logo" class="logo-img" />
              <h2 class="app-title">Work Order Management</h2>
            </div>
          </div>
          <mat-divider></mat-divider>
          <app-side-menu-content></app-side-menu-content>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <mat-toolbar color="primary" class="app-toolbar">
            <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle menu">
              <mat-icon>menu</mat-icon>
            </button>
            <span class="toolbar-spacer"></span>
            <app-header-dashboard-management></app-header-dashboard-management>
          </mat-toolbar>

          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .sidenav-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .app-sidenav {
      width: 256px;
      border-right: none;
      box-shadow: var(--shadow-drawer);
      background-color: var(--sidebar-background);
      z-index: 1000;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .sidenav-header {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      background-color: var(--primary);
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .logo-container {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }

    .logo-img {
      height: 32px;
      width: auto;
      margin-right: 12px;
    }

    .app-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 5;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      height: 64px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      background-color: var(--background);
      padding: 24px;
      height: calc(100vh - 64px);
    }

    @media (max-width: 992px) {
      .app-sidenav {
        width: 80%;
        max-width: 280px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  private _themeService = inject(ThemeService);
  private isBrowser: boolean;
  private router = inject(Router);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  isMobile = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.checkScreenSize();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile && this.sidenav?.opened) {
        this.sidenav.close();
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 992;
      if (this.sidenav) {
        if (this.isMobile) {
          this.sidenav.close();
          this.sidenav.mode = 'over';
        } else {
          this.sidenav.open();
          this.sidenav.mode = 'side';
        }
      }
    }
  }
}
