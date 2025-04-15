import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { SharedModule } from '../../../../shared/shared.module';
import { StatsCardComponent } from '../../../../shared/components/stats-card/stats-card.component';
import { UnderConstructionComponent } from '../../../../shared/components/under-construction/under-construction.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-dashboard-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    SharedModule,
    StatsCardComponent,
    UnderConstructionComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dashboard-container">
      <!-- Page Header -->
      <div class="dashboard-header mb-4">
        <h1>Analytics Dashboard</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary">
            <mat-icon>calendar_today</mat-icon>
            Filter
          </button>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div class="stats-cards-grid mb-4">
        <div class="stats-card-wrapper" *ngFor="let card of statsCards">
          <app-stats-card
            [title]="card.title"
            [value]="card.value"
            [icon]="card.icon"
            [cardColor]="card.cardColor"
            [trend]="card.trend"
            [trendLabel]="card.trendLabel">
          </app-stats-card>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-grid">
        <!-- Left Column -->
        <div class="main-grid-left">
          <!-- Charts Section -->
          <mat-card class="dashboard-card mb-4">
            <mat-card-header>
              <mat-card-title>Work Order Analytics</mat-card-title>
              <div class="card-header-actions">
                <button mat-button color="primary">
                  <mat-icon>calendar_today</mat-icon>
                  Filter
                </button>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-placeholder">
                <app-under-construction
                  title="Chart Coming Soon"
                  message="The analytics chart is currently under development and will be available soon.">
                </app-under-construction>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Table Section -->
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Recent Work Orders</mat-card-title>
              <div class="card-header-actions">
                <button mat-button color="primary">View All</button>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="work-orders-table-placeholder">
                <app-under-construction
                  title="Work Orders Table Coming Soon"
                  message="The work orders table is currently under development and will be available soon.">
                </app-under-construction>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right Column -->
        <div class="main-grid-right">
          <!-- Recent Activity -->
          <mat-card class="activity-card right-card">
            <div class="card-title">
              <h3>Recent Activity</h3>
            </div>
            <div class="activity-list">
              <div *ngIf="recentActivities.length === 0" class="no-activities">
                <p>No recent activities in the last 12 hours</p>
              </div>
              <div *ngFor="let activity of recentActivities" class="activity-item">
                <div class="activity-icon" [ngClass]="getIconColorClass(activity.action)">
                  <mat-icon>{{ getActivityIcon(activity.action) }}</mat-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.description }}</div>
                  <div class="activity-meta">
                    <span class="activity-user">{{ activity.userName }}</span> •
                    <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        font-size: var(--font-size-xxl);
        font-weight: 500;
        color: var(--text-primary);
      }

      .header-actions {
        display: flex;
        gap: 12px;

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .stats-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 24px;

      .stats-card-wrapper {
        height: 100%;
      }
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;

      @media (min-width: 992px) {
        grid-template-columns: 2fr 1fr;
      }
    }

    .main-grid-left, .main-grid-right {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .main-grid-right {
      .activity-card {
        flex: 1;
        min-height: 450px;
        max-height: 600px;
        display: flex;
        flex-direction: column;

        mat-card-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .activity-list {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 12px;
        }
      }
    }

    .dashboard-card {
      background-color: var(--card-background);
      border-radius: var(--border-radius-base);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      transition: all var(--transition-duration) ease;
      height: 100%;

      &:hover {
        box-shadow: var(--shadow-drawer);
        transform: translateY(-2px);
      }

      mat-card-header {
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--card-background);

        mat-card-title {
          margin: 0;
          font-size: var(--font-size-md);
          font-weight: 500;
          color: var(--text-primary);
        }

        .card-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      mat-card-content {
        padding: 24px;
      }
    }

    .chart-placeholder, .work-orders-table-placeholder {
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      padding: 16px;
      border-radius: var(--border-radius-sm);
      background-color: var(--background);
      transition: all var(--transition-duration) ease;

      &:hover {
        background-color: var(--primary-light);
      }
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;

      mat-icon {
        color: var(--white);
      }
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      margin: 0 0 4px 0;
      font-size: var(--font-size-base);
      font-weight: 500;
      color: var(--text-primary);
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);

      .activity-user {
        font-weight: 500;
        color: var(--primary);
      }
    }

    .no-activities {
      text-align: center;
      padding: 24px;
      color: var(--text-secondary);
    }

    // Icon colors
    .icon-primary {
      background: rgba(63, 81, 181, 0.12);
      color: #3f51b5;
    }

    .icon-success {
      background: rgba(76, 175, 80, 0.12);
      color: #4caf50;
    }

    .icon-info {
      background: rgba(33, 150, 243, 0.12);
      color: #2196f3;
    }

    .icon-warning {
      background: rgba(255, 152, 0, 0.12);
      color: #ff9800;
    }

    .icon-danger {
      background: rgba(244, 67, 54, 0.12);
      color: #f44336;
    }

    .icon-default {
      background: rgba(158, 158, 158, 0.12);
      color: #9e9e9e;
    }
  `]
})
export class DashboardAnalyticsComponent implements OnInit {
  // Stats data
  statsCards = [
    {
      title: 'Total Work Orders',
      value: 125,
      icon: 'description',
      cardColor: 'primary' as const,
      trend: 12,
      trendLabel: 'since last month'
    },
    {
      title: 'Active Work Orders',
      value: 89,
      icon: 'fact_check',
      cardColor: 'success' as const,
      trend: 8,
      trendLabel: 'since last month'
    },
    {
      title: 'Pending Work Orders',
      value: 15,
      icon: 'schedule',
      cardColor: 'warning' as const,
      trend: -5,
      trendLabel: 'since last month'
    },
    {
      title: 'Overdue',
      value: 3,
      icon: 'warning',
      cardColor: 'error' as const,
      trend: -2,
      trendLabel: 'since last month'
    }
  ];

  // Recent activities data
  recentActivities: {
    action: string;
    description: string;
    userName: string;
    timestamp: Date;
  }[] = [];

  ngOnInit(): void {
    // Initialize with empty activities
    this.recentActivities = [];
  }

  /**
   * Get the appropriate icon for an activity based on its action
   */
  getActivityIcon(action: string): string {
    switch (action) {
      case 'create':
        return 'add_circle';
      case 'update':
        return 'edit';
      case 'delete':
        return 'delete';
      case 'complete':
        return 'task_alt';
      case 'assign':
        return 'person_add';
      default:
        return 'notifications';
    }
  }

  /**
   * Get the appropriate color class for an activity based on its action
   */
  getIconColorClass(action: string): string {
    switch (action) {
      case 'create':
        return 'icon-primary';
      case 'update':
        return 'icon-info';
      case 'delete':
        return 'icon-danger';
      case 'complete':
        return 'icon-success';
      case 'assign':
        return 'icon-warning';
      default:
        return 'icon-default';
    }
  }
}