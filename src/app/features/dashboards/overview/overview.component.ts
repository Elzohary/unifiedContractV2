import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { UnderConstructionComponent } from '../../../shared/components/under-construction/under-construction.component';
import { WorkOrderService } from '../../../domains/work-order/services/work-order.service';
import { ActivityLogService, ActivityLog } from '../../../shared/services/activity-log.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    StatsCardComponent,
    UnderConstructionComponent
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
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
  recentActivities: ActivityLog[] = [];

  constructor(
    private workOrderService: WorkOrderService,
    private activityLogService: ActivityLogService
  ) {}

  ngOnInit(): void {
    this.loadRecentActivities();
  }

  loadRecentActivities(): void {
    // Filter activity logs from the last 12 hours
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    this.activityLogService.getAllActivityLogs().subscribe(
      (logs) => {
        // Filter logs that occurred in the last 12 hours
        this.recentActivities = logs
          .filter(log => new Date(log.timestamp) >= twelveHoursAgo)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 6); // Limit to the 6 most recent activities
      },
      (error) => {
        console.error('Error loading recent activities:', error);
        // Fallback to empty array if there's an error
        this.recentActivities = [];
      }
    );
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
