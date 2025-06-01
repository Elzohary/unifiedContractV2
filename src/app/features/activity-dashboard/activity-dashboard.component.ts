import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivityMonitorComponent } from '../../shared/components/activity-monitor/activity-monitor.component';
import { ActivityLogService, EntityType, ActionType } from '../../shared/services/activity-log.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-activity-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    ActivityMonitorComponent
  ],
  template: `
    <div class="dashboard-container">
      <mat-toolbar color="primary" class="dashboard-header">
        <span>Activity Dashboard</span>
        <span class="spacer"></span>
        <div class="action-buttons">
          <button mat-raised-button color="accent" (click)="generateSampleActivity()">
            <mat-icon>add</mat-icon> Generate Sample Activity
          </button>
        </div>
      </mat-toolbar>

      <div class="dashboard-content">
        <app-activity-monitor></app-activity-monitor>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .dashboard-header {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .dashboard-content {
      flex: 1;
      padding: 16px;
      overflow: auto;
      background-color: var(--surface-background, #f5f5f5);
    }
  `]
})
export class ActivityDashboardComponent implements OnInit {
  private activityLogService = inject(ActivityLogService);
  private userService = inject(UserService);
  
  ngOnInit(): void {
    // Simulate some initial activity when the dashboard is loaded
    setTimeout(() => this.generateSampleActivity(), 1000);
  }
  
  /**
   * Generate a random sample activity for demo purposes
   */
  generateSampleActivity(): void {
    const entities = ['workOrder', 'remark', 'user', 'document', 'invoice', 'contract'];
    const actions: ActionType[] = ['create', 'update', 'delete', 'read', 'comment', 'view', 'assign', 'reassign'];
    const users = ['John', 'Sarah', 'Mike', 'Emma', 'David'];
    
    const randomEntity = entities[Math.floor(Math.random() * entities.length)] as EntityType;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomUserId = this.userService.getCurrentUserId();
    
    // Create sample description based on entity and action
    let description = '';
    switch (randomAction) {
      case 'create':
        description = `Created a new ${randomEntity}`;
        break;
      case 'update':
        description = `Updated ${randomEntity} information`;
        break;
      case 'delete':
        description = `Deleted a ${randomEntity}`;
        break;
      case 'read':
        description = `Viewed ${randomEntity} details`;
        break;
      case 'comment':
        description = `Commented on ${randomEntity}`;
        break;
      case 'view':
        description = `Viewed ${randomEntity} details`;
        break;
      case 'assign':
        description = `Assigned a ${randomEntity} to ${users[Math.floor(Math.random() * users.length)]}`;
        break;
      case 'reassign':
        description = `Reassigned a ${randomEntity} to ${users[Math.floor(Math.random() * users.length)]}`;
        break;
    }
    
    // Generate random sample changes
    const changes = this.generateRandomChanges(randomEntity);
    
    // Log the activity
    this.activityLogService.logActivity({
      entityType: randomEntity,
      entityId: `${randomEntity}-${Math.floor(Math.random() * 1000)}`,
      action: randomAction,
      userId: randomUserId,
      description: description,
      timestamp: new Date(),
      changes: changes,
      tags: this.generateRandomTags(),
      severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'warning' : 'info'
    });
  }
  
  /**
   * Generate random changes object
   */
  private generateRandomChanges(entityType: string): Record<string, { oldValue: any, newValue: any }> {
    const changes: Record<string, { oldValue: any, newValue: any }> = {};
    
    // Field names based on entity type
    let fieldNames: string[] = [];
    switch (entityType) {
      case 'workOrder':
        fieldNames = ['title', 'status', 'priority', 'dueDate', 'assignee'];
        break;
      case 'remark':
        fieldNames = ['text', 'createdBy', 'workOrderId', 'isPublic'];
        break;
      case 'user':
        fieldNames = ['name', 'email', 'role', 'isActive'];
        break;
      case 'document':
        fieldNames = ['name', 'fileType', 'size', 'uploadedBy'];
        break;
      case 'invoice':
        fieldNames = ['amount', 'status', 'dueDate', 'client'];
        break;
      case 'contract':
        fieldNames = ['title', 'startDate', 'endDate', 'value', 'status'];
        break;
      default:
        fieldNames = ['name', 'description', 'status'];
    }
    
    // Pick 1-3 random fields to change
    const numChanges = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numChanges; i++) {
      const fieldName = fieldNames[Math.floor(Math.random() * fieldNames.length)];
      
      // Don't add duplicate changes
      if (changes[fieldName]) continue;
      
      // Generate appropriate values based on field name
      let oldValue, newValue;
      
      if (fieldName.includes('Date')) {
        // Generate date values
        const baseDate = new Date();
        oldValue = new Date(baseDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        newValue = new Date(baseDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (fieldName === 'status') {
        // Status values
        const statuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
        oldValue = statuses[Math.floor(Math.random() * statuses.length)];
        newValue = statuses[Math.floor(Math.random() * statuses.length)];
        while (newValue === oldValue) {
          newValue = statuses[Math.floor(Math.random() * statuses.length)];
        }
      } else if (fieldName === 'priority') {
        // Priority values
        const priorities = ['low', 'medium', 'high', 'critical'];
        oldValue = priorities[Math.floor(Math.random() * priorities.length)];
        newValue = priorities[Math.floor(Math.random() * priorities.length)];
        while (newValue === oldValue) {
          newValue = priorities[Math.floor(Math.random() * priorities.length)];
        }
      } else if (fieldName === 'isActive' || fieldName === 'isPublic') {
        // Boolean values
        oldValue = Math.random() > 0.5;
        newValue = !oldValue;
      } else if (fieldName === 'amount' || fieldName === 'value' || fieldName === 'size') {
        // Numeric values
        oldValue = Math.floor(Math.random() * 1000);
        newValue = Math.floor(Math.random() * 1000);
      } else {
        // Text values for other fields
        const words = ['Repair', 'Maintenance', 'Installation', 'Inspection', 'Service', 'Replacement', 'Update', 'Configuration'];
        oldValue = words[Math.floor(Math.random() * words.length)] + ' ' + words[Math.floor(Math.random() * words.length)].toLowerCase();
        newValue = words[Math.floor(Math.random() * words.length)] + ' ' + words[Math.floor(Math.random() * words.length)].toLowerCase();
      }
      
      changes[fieldName] = { oldValue, newValue };
    }
    
    return changes;
  }
  
  /**
   * Generate random tags
   */
  private generateRandomTags(): string[] {
    const allTags = ['important', 'critical', 'warning', 'error', 'success', 'info', 'automated', 'manual', 'system', 'audit'];
    const tags: string[] = [];
    
    // Add 0-3 random tags
    const numTags = Math.floor(Math.random() * 4);
    for (let i = 0; i < numTags; i++) {
      const tag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    return tags;
  }
} 