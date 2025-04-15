import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivityLogService, ActivityLog, EntityType, ActionType } from '../../services/activity-log.service';
import { UserActivityService } from '../../services/user-activity.service';
import { Subscription, interval } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-activity-monitor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTabsModule,
    MatExpansionModule
  ],
  templateUrl: './activity-monitor.component.html',
  styleUrls: ['./activity-monitor.component.scss']
})
export class ActivityMonitorComponent implements OnInit, OnDestroy {
  private activityLogService = inject(ActivityLogService);
  private userActivityService = inject(UserActivityService);
  
  // Reactive signals for activities and metrics
  public recentActivities = signal<(ActivityLog & { isNew?: boolean })[]>([]);
  public activityMetrics = signal<Record<string, number>>({});
  public entityBreakdown = signal<Record<string, number>>({});
  public newActivitiesCount = signal(0);
  public isAutoRefreshEnabled = signal(true);
  
  private subscriptions = new Subscription();
  private refreshInterval = 10000; // 10 seconds
  private maxRecentActivities = 50;
  private seenActivityIds = new Set<string>();
  
  ngOnInit(): void {
    this.loadInitialData();
    this.setupActivityStream();
    this.setupAutoRefresh();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  /**
   * Load initial data
   */
  private loadInitialData(): void {
    this.refreshData();
  }
  
  /**
   * Set up subscription to activity stream
   */
  private setupActivityStream(): void {
    const activitySub = this.activityLogService.activityStream$.subscribe(activity => {
      if (!this.seenActivityIds.has(activity.id)) {
        this.seenActivityIds.add(activity.id);
        
        // Add as a new activity 
        const enhancedActivity = { ...activity, isNew: true };
        this.recentActivities.update(current => {
          const updated = [enhancedActivity, ...current];
          // Trim to max length
          return updated.slice(0, this.maxRecentActivities);
        });
        
        this.newActivitiesCount.update(count => count + 1);
        
        // Update metrics
        this.updateMetrics(activity);
      }
    });
    
    this.subscriptions.add(activitySub);
  }
  
  /**
   * Set up auto refresh for data
   */
  private setupAutoRefresh(): void {
    const refreshSub = interval(this.refreshInterval)
      .pipe(
        tap(() => {
          if (this.isAutoRefreshEnabled()) {
            this.refreshData();
          }
        })
      )
      .subscribe();
    
    this.subscriptions.add(refreshSub);
  }
  
  /**
   * Toggle auto refresh
   */
  toggleAutoRefresh(): void {
    this.isAutoRefreshEnabled.update(current => !current);
  }
  
  /**
   * Refresh all data
   */
  refreshData(): void {
    // Get recent activities
    this.activityLogService.getAllActivityLogs({
      // Optional filters could be added here
    }).subscribe(activities => {
      // Mark new activities
      const enhancedActivities = activities.map(activity => {
        const isNew = !this.seenActivityIds.has(activity.id);
        if (isNew) {
          this.seenActivityIds.add(activity.id);
        }
        return { ...activity, isNew };
      });
      
      this.recentActivities.set(enhancedActivities.slice(0, this.maxRecentActivities));
      
      // Reset new activities counter
      this.newActivitiesCount.set(0);
      
      // Update metrics
      this.calculateMetrics(activities);
    });
  }
  
  /**
   * Calculate metrics based on activities
   */
  private calculateMetrics(activities: ActivityLog[]): void {
    // Activity by action type
    const actionCounts: Record<string, number> = {};
    const entityCounts: Record<string, number> = {};
    
    activities.forEach(activity => {
      // Count actions
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1;
      
      // Count entity types
      entityCounts[activity.entityType] = (entityCounts[activity.entityType] || 0) + 1;
    });
    
    // Add total
    actionCounts['total'] = activities.length;
    
    this.activityMetrics.set(actionCounts);
    this.entityBreakdown.set(entityCounts);
  }
  
  /**
   * Update metrics when new activity arrives
   */
  private updateMetrics(activity: ActivityLog): void {
    // Update action counts
    this.activityMetrics.update(current => {
      const updated = { ...current };
      updated[activity.action] = (updated[activity.action] || 0) + 1;
      updated['total'] = (updated['total'] || 0) + 1;
      return updated;
    });
    
    // Update entity counts
    this.entityBreakdown.update(current => {
      const updated = { ...current };
      updated[activity.entityType] = (updated[activity.entityType] || 0) + 1;
      return updated;
    });
  }
  
  /**
   * Get icon for activity based on action and entity type
   */
  getActivityIcon(activity: ActivityLog): string {
    // Based on action
    const action = activity.action || 'read'; // Default to 'read' if action is undefined
    
    switch (action as string) {
      case 'create': return 'add_circle';
      case 'update': return 'edit';
      case 'delete': return 'delete';
      case 'read': return 'visibility';
      case 'error': return 'error';
      case 'login': return 'login';
      case 'logout': return 'logout';
      case 'download': return 'download';
      case 'upload': return 'upload';
      case 'view': return 'visibility';
    }
    
    // Fall back to entity type if no action match
    const entityType = activity.entityType || 'system'; // Default to 'system' if entityType is undefined
    
    switch (entityType as string) {
      case 'workOrder': return 'work';
      case 'remark': return 'comment';
      case 'user': return 'person';
      case 'document': return 'description';
      case 'system': return 'computer';
      default: return 'info';
    }
  }
  
  /**
   * Get CSS class for activity icon based on action
   */
  getActivityIconClass(activity: ActivityLog): string {
    return activity.action || '';
  }
  
  /**
   * Get color for activity tag
   */
  getTagColor(tag: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (tag) {
      case 'error': return 'warn';
      case 'critical': return 'warn';
      case 'warning': return 'accent';
      case 'success': return 'primary';
      default: return undefined;
    }
  }
  
  /**
   * Format time difference for human-readable display
   */
  formatTimeDifference(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - (date instanceof Date ? date.getTime() : new Date(date).getTime());
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    }
    
    if (hours > 0) {
      return `${hours}h ago`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    
    return `${seconds}s ago`;
  }
  
  /**
   * Format metric name for display
   */
  formatMetricName(name: string): string {
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
} 