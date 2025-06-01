import { Component } from '@angular/core';
import { ActivityLog } from '../../../shared/services/activity-log.service';

@Component({
  selector: 'app-activity-log-page',
  template: '',
  standalone: true
})
export class ActivityLogPageComponent {
  /**
   * Get remark type from activity log details
   */
  getRemarkType(log: ActivityLog): string {
    if (log.entityType === 'remark' && log.details && log.details.remarkType) {
      return log.details.remarkType;
    }
    return '';
  }

  /**
   * Get icon for activity log
   */
  getActivityIcon(log: ActivityLog): string {
    // For remark activities, use icons based on remark type
    if (log.entityType === 'remark') {
      const remarkType = this.getRemarkType(log);
      if (remarkType) {
        switch (remarkType.toLowerCase()) {
          case 'general':
            return 'chat';
          case 'technical':
            return 'build';
          case 'safety':
            return 'health_and_safety';
          case 'quality':
            return 'verified';
          case 'client-communication':
            return 'business';
          case 'internal-communication':
            return 'forum';
          case 'feedback':
            return 'feedback';
        }
      }
    }
    
    // Default activity icons
    switch (log.action) {
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
   * Get color class for activity icon
   */
  getActivityIconClass(log: ActivityLog): string {
    // For remark activities, use colors based on remark type
    if (log.entityType === 'remark') {
      const remarkType = this.getRemarkType(log);
      if (remarkType) {
        switch (remarkType.toLowerCase()) {
          case 'general':
            return 'icon-remark-general';
          case 'technical':
            return 'icon-remark-technical';
          case 'safety':
            return 'icon-remark-safety';
          case 'quality':
            return 'icon-remark-quality';
          case 'client-communication':
            return 'icon-remark-client';
          case 'internal-communication':
            return 'icon-remark-internal';
          case 'feedback':
            return 'icon-remark-feedback';
        }
      }
    }
    
    // Default activity colors
    switch (log.action) {
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