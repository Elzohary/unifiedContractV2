import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ActivityLog } from '../../../../../../shared/services/activity-log.service';

@Component({
  selector: 'app-wo-activity-tab',
  template: `
    <div class="activity-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>history</mat-icon>
            Activity Log
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="!activityLogs || activityLogs.length === 0" class="empty-state">
            <mat-icon>timeline</mat-icon>
            <p>No activity logs found</p>
          </div>
          
          <mat-list *ngIf="activityLogs && activityLogs.length > 0">
            <mat-list-item *ngFor="let log of activityLogs; let i = index" class="activity-item">
              <mat-icon matListItemIcon [class]="getActivityIconClass(log.action)">
                {{ getActivityIcon(log.action) }}
              </mat-icon>
              
              <div class="activity-content">
                <div class="activity-header">
                  <strong>{{ log.userName }}</strong>
                  <span class="timestamp">{{ formatTimestamp(log.timestamp) }}</span>
                </div>
                
                <p class="activity-description">{{ log.description }}</p>
                
                <div class="activity-details" *ngIf="log.details">
                  <small>{{ getDetailsText(log.details) }}</small>
                </div>
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .activity-container {
      padding: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: rgba(0, 0, 0, 0.54);
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .activity-item {
      height: auto !important;
      padding: 16px 0 !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-content {
      flex: 1;
      margin-left: 16px;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .timestamp {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
    }

    .activity-description {
      margin: 0 0 4px 0;
      font-size: 14px;
    }

    .activity-details {
      color: rgba(0, 0, 0, 0.54);
      font-size: 12px;
    }

    .action-create { color: #4CAF50; }
    .action-update { color: #2196F3; }
    .action-delete { color: #F44336; }
    .action-complete { color: #4CAF50; }
    .action-assign { color: #FF9800; }
    .action-comment { color: #9C27B0; }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class WoActivityTabComponent {
  @Input() activityLogs: ActivityLog[] | null = [];

  getActivityIcon(action: string): string {
    switch (action) {
      case 'create': return 'add_circle';
      case 'update': return 'edit';
      case 'delete': return 'delete';
      case 'complete': return 'check_circle';
      case 'assign': return 'person_add';
      case 'comment': return 'comment';
      default: return 'info';
    }
  }

  getActivityIconClass(action: string): string {
    return `action-${action}`;
  }

  formatTimestamp(timestamp: Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDetailsText(details: any): string {
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return '';
  }
} 