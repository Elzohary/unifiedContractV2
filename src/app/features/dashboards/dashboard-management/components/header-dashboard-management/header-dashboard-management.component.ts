import { Component, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-header-dashboard-management',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatTooltipModule,
    RouterModule,
    NotificationPanelComponent
  ],
  template: `
    <mat-toolbar>
      <button 
        mat-icon-button 
        (click)="toggleDrawer.emit()" 
        class="drawer-toggle-button"
        matTooltip="Toggle menu">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="toolbar-spacer"></span>
      
      <div class="toolbar-actions">
        <!-- Notification Panel -->
        <app-notification-panel></app-notification-panel>
        
        <!-- Profile Menu -->
        <button mat-icon-button matTooltip="Account">
          <mat-icon>account_circle</mat-icon>
        </button>
        
        <!-- Settings -->
        <button mat-icon-button matTooltip="Settings">
          <mat-icon>settings</mat-icon>
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      height: var(--toolbar-height, 64px);
      padding: 0 16px;
      position: relative;
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
      z-index: 100;
      background-color: var(--bg-toolbar, #ffffff);
    }
    
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    @media (prefers-color-scheme: dark) {
      :host {
        --bg-toolbar: #1e1e1e;
      }
    }
  `]
})
export class HeaderDashboardManagementComponent {
  @Output() toggleDrawer = new EventEmitter<void>();
} 