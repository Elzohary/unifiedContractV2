import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, Subject } from 'rxjs';
import { delay, catchError, map, tap, filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserInteraction } from './user-activity.service';

export type EntityType = 
  'workOrder' | 'remark' | 'issue' | 'user' | 'material' | 'task' | 'system' | 
  'client' | 'invoice' | 'payment' | 'document' | 'attachment' | 'equipment' | 
  'permit' | 'location' | 'form' | 'notification' | 'report' | 'expense' | 'schedule';

export type ActionType = 
  'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 
  'download' | 'upload' | 'share' | 'print' | 'export' | 'import' | 
  'archive' | 'restore' | 'assign' | 'reassign' | 'approve' | 'reject' | 
  'complete' | 'cancel' | 'pause' | 'resume' | 'comment' | 'view' |
  'interaction' | 'idle' | 'error';

export interface ActivityLog {
  id: string;
  action: ActionType;
  description: string;
  entityType: EntityType;
  entityId: string;
  timestamp: Date;
  userId: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  changes?: {
    before: any;
    after: any;
  };
  related?: {
    entityType: EntityType;
    entityId: string;
  }[];
  tags?: string[];
  severity?: 'info' | 'warning' | 'critical';
  systemGenerated?: boolean;
}

export interface ActivityFilter {
  entityTypes?: EntityType[];
  actions?: ActionType[];
  userIds?: string[];
  startDate?: Date;
  endDate?: Date;
  keywords?: string[];
  severity?: ('info' | 'warning' | 'critical')[];
  tags?: string[];
  relatedTo?: {
    entityType: EntityType;
    entityId: string;
  };
  systemGenerated?: boolean;
}

/**
 * Enhanced ActivityLogService - A comprehensive tracking engine that monitors all changes
 * across the application and provides extensive querying capabilities.
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  // Mock activity logs
  private mockActivityLogs: ActivityLog[] = [
    {
      id: 'act1',
      action: 'create',
      description: 'Created Work Order',
      entityType: 'workOrder',
      entityId: 'wo1',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      userId: 'user1',
      userName: 'John Smith',
      severity: 'info',
      systemGenerated: false,
      tags: ['creation', 'workOrder']
    },
    {
      id: 'act2',
      action: 'update',
      description: 'Updated Work Order Status',
      entityType: 'workOrder',
      entityId: 'wo1',
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      userId: 'user2',
      userName: 'Sarah Johnson',
      severity: 'info',
      systemGenerated: false,
      tags: ['status-change', 'workOrder'],
      details: {
        oldStatus: 'pending',
        newStatus: 'in-progress'
      },
      changes: {
        before: { status: 'pending' },
        after: { status: 'in-progress' }
      }
    },
    {
      id: 'act3',
      action: 'create',
      description: 'Added Remark',
      entityType: 'remark',
      entityId: 'rem6',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      userId: 'user1',
      userName: 'Jane Smith',
      severity: 'info',
      systemGenerated: false,
      tags: ['creation', 'remark'],
      details: {
        workOrderId: 'wo1',
        remarkType: 'general'
      },
      related: [
        { entityType: 'workOrder', entityId: 'wo1' }
      ]
    }
  ];

  private activityLogsSubject = new BehaviorSubject<ActivityLog[]>(this.mockActivityLogs);
  public activityLogs$ = this.activityLogsSubject.asObservable();
  
  // Stream of real-time activity logs that components can subscribe to
  private activityStreamSubject = new Subject<ActivityLog>();
  public activityStream$ = this.activityStreamSubject.asObservable();
  
  // Simulation settings
  private networkDelay = 0;
  private apiUrl = environment.apiUrl;
  private maxLocalLogs = 1000; // Maximum number of logs to keep in memory
  private enableAutoActivityDetection = true;

  constructor(private http: HttpClient) {
    console.log('ActivityLogService initialized with mock data:', this.mockActivityLogs);
    this.initializeAutoTracking();
  }

  /**
   * Initialize automatic tracking of user activities
   * This could be enhanced with interceptors for HTTP requests, router events, etc.
   */
  private initializeAutoTracking(): void {
    if (!this.enableAutoActivityDetection) return;

    // This would be where we set up global tracking 
    // For example, tracking page views, HTTP requests, etc.
    console.log('Auto activity tracking initialized');
    
    // In a real implementation, we would hook into Angular's Router, HTTP interceptors,
    // and possibly use a global error handler to automatically log events
  }

  /**
   * Conditionally apply delay based on networkDelay setting
   */
  private maybeDelay<T>(observable: Observable<T>): Observable<T> {
    return this.networkDelay > 0 ? observable.pipe(delay(this.networkDelay)) : observable;
  }

  /**
   * Get all activity logs with optional filtering
   */
  getAllActivityLogs(filters?: ActivityFilter): Observable<ActivityLog[]> {
    let logs = this.activityLogsSubject.value;
    
    if (filters) {
      logs = this.applyFilters(logs, filters);
    }
    
    return this.maybeDelay(of(logs)).pipe(
      catchError(error => {
        console.error('Error fetching activity logs:', error);
        return throwError(() => new Error('Failed to fetch activity logs'));
      })
    );
  }

  /**
   * Apply filters to a collection of logs
   */
  private applyFilters(logs: ActivityLog[], filters: ActivityFilter): ActivityLog[] {
    return logs.filter(log => {
      // Entity types filter
      if (filters.entityTypes && filters.entityTypes.length > 0) {
        if (!filters.entityTypes.includes(log.entityType)) return false;
      }
      
      // Actions filter
      if (filters.actions && filters.actions.length > 0) {
        if (!filters.actions.includes(log.action)) return false;
      }
      
      // User IDs filter
      if (filters.userIds && filters.userIds.length > 0) {
        if (!filters.userIds.includes(log.userId)) return false;
      }
      
      // Date range filter
      if (filters.startDate) {
        if (log.timestamp < filters.startDate) return false;
      }
      
      if (filters.endDate) {
        if (log.timestamp > filters.endDate) return false;
      }
      
      // Keywords filter
      if (filters.keywords && filters.keywords.length > 0) {
        const logString = JSON.stringify(log).toLowerCase();
        const match = filters.keywords.some(keyword => 
          logString.includes(keyword.toLowerCase())
        );
        if (!match) return false;
      }
      
      // Severity filter
      if (filters.severity && filters.severity.length > 0) {
        if (!log.severity || !filters.severity.includes(log.severity)) return false;
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!log.tags || !filters.tags.some(tag => log.tags?.includes(tag))) return false;
      }
      
      // Related entity filter
      if (filters.relatedTo) {
        if (!log.related) return false;
        
        const isRelated = log.related.some(relation => 
          relation.entityType === filters.relatedTo?.entityType && 
          relation.entityId === filters.relatedTo?.entityId
        );
        
        if (!isRelated) return false;
      }
      
      // System generated filter
      if (filters.systemGenerated !== undefined) {
        if (log.systemGenerated !== filters.systemGenerated) return false;
      }
      
      return true;
    });
  }

  /**
   * Get activity logs for a specific entity
   */
  getActivityLogsForEntity(entityType: EntityType, entityId: string): Observable<ActivityLog[]> {
    const logs = this.activityLogsSubject.value.filter(
      log => log.entityType === entityType && log.entityId === entityId
    );
    
    return this.maybeDelay(of(logs)).pipe(
      catchError(error => {
        console.error(`Error fetching activity logs for ${entityType} ${entityId}:`, error);
        return throwError(() => new Error(`Failed to fetch activity logs for ${entityType} ${entityId}`));
      })
    );
  }

  /**
   * Get activity logs related to a specific entity (includes related entities)
   */
  getRelatedActivityLogs(entityType: EntityType, entityId: string): Observable<ActivityLog[]> {
    const logs = this.activityLogsSubject.value.filter(log => 
      // Direct match
      (log.entityType === entityType && log.entityId === entityId) || 
      // Match in related entities
      (log.related && log.related.some(rel => rel.entityType === entityType && rel.entityId === entityId)) ||
      // Match in details (for backward compatibility)
      (log.details && log.details.workOrderId === entityId && entityType === 'workOrder')
    );
    
    return this.maybeDelay(of(logs));
  }

  /**
   * Add a new activity log
   */
  addActivityLog(logData: Omit<ActivityLog, 'id' | 'timestamp'>): Observable<ActivityLog> {
    const newLog: ActivityLog = {
      id: `act${Date.now()}`,
      timestamp: new Date(),
      ...logData
    };
    
    // Add to the beginning for chronological order (newest first)
    const updatedLogs = [newLog, ...this.activityLogsSubject.value];
    
    // Trim logs if they exceed the maximum number to keep in memory
    if (updatedLogs.length > this.maxLocalLogs) {
      updatedLogs.splice(this.maxLocalLogs);
    }
    
    this.activityLogsSubject.next(updatedLogs);
    
    // Emit to the real-time stream
    this.activityStreamSubject.next(newLog);
    
    return this.maybeDelay(of(newLog)).pipe(
      catchError(error => {
        console.error('Error adding activity log:', error);
        return throwError(() => new Error('Failed to add activity log'));
      })
    );
  }

  /**
   * Track changes to an entity by comparing before and after states
   */
  trackChanges<T>(
    entityType: EntityType, 
    entityId: string, 
    before: T, 
    after: T, 
    userId: string, 
    userName: string,
    description?: string
  ): Observable<ActivityLog> {
    // Detect which fields changed
    const changes = this.detectChanges(before, after);
    
    if (Object.keys(changes).length === 0) {
      return throwError(() => new Error('No changes detected'));
    }
    
    // Generate description if not provided
    const changeDescription = description || `Updated ${entityType} (${Object.keys(changes).join(', ')})`;
    
    return this.addActivityLog({
      action: 'update',
      description: changeDescription,
      entityType,
      entityId,
      userId,
      userName,
      severity: 'info',
      systemGenerated: false,
      changes: {
        before,
        after
      },
      details: changes
    });
  }

  /**
   * Detect what changed between two objects
   */
  private detectChanges<T>(before: T, after: T): Record<string, { from: any, to: any }> {
    const changes: Record<string, { from: any, to: any }> = {};
    
    // Get all keys from both objects
    const keys = [...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])];
    
    for (const key of keys) {
      const beforeValue = before ? (before as any)[key] : undefined;
      const afterValue = after ? (after as any)[key] : undefined;
      
      // Check if values are different
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        changes[key] = {
          from: beforeValue,
          to: afterValue
        };
      }
    }
    
    return changes;
  }

  /**
   * Get a summary of recent activity
   */
  getActivitySummary(days: number = 30): Observable<Record<string, number>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentLogs = this.activityLogsSubject.value.filter(log => log.timestamp >= cutoffDate);
    
    // Group logs by action type
    const summary = recentLogs.reduce((acc, log) => {
      const key = `${log.action}-${log.entityType}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return of(summary);
  }

  /**
   * Archive logs older than a certain date
   * In a real implementation, this would move them to a database or file storage
   */
  archiveOldLogs(olderThan: Date): Observable<number> {
    const currentLogs = this.activityLogsSubject.value;
    const recentLogs = currentLogs.filter(log => log.timestamp >= olderThan);
    const archivedCount = currentLogs.length - recentLogs.length;
    
    if (archivedCount > 0) {
      this.activityLogsSubject.next(recentLogs);
      console.log(`Archived ${archivedCount} logs older than ${olderThan.toISOString()}`);
    }
    
    return of(archivedCount);
  }

  /**
   * Log any entity creation
   */
  logEntityCreation(
    entityType: EntityType,
    entityId: string,
    entityName: string,
    userId: string,
    userName: string,
    details?: any,
    related?: { entityType: EntityType; entityId: string }[]
  ): Observable<ActivityLog> {
    return this.addActivityLog({
      action: 'create',
      description: `Created ${entityType}: ${entityName}`,
      entityType,
      entityId,
      userId,
      userName,
      severity: 'info',
      systemGenerated: false,
      details,
      related,
      tags: ['creation', entityType]
    });
  }

  /**
   * Log any entity update
   */
  logEntityUpdate(
    entityType: EntityType,
    entityId: string,
    entityName: string,
    userId: string,
    userName: string,
    changes: any,
    before?: any,
    after?: any,
    related?: { entityType: EntityType; entityId: string }[]
  ): Observable<ActivityLog> {
    return this.addActivityLog({
      action: 'update',
      description: `Updated ${entityType}: ${entityName}`,
      entityType,
      entityId,
      userId,
      userName,
      severity: 'info',
      systemGenerated: false,
      details: changes,
      changes: before && after ? { before, after } : undefined,
      related,
      tags: ['update', entityType]
    });
  }

  /**
   * Log any entity deletion
   */
  logEntityDeletion(
    entityType: EntityType,
    entityId: string,
    entityName: string,
    userId: string,
    userName: string,
    details?: any,
    related?: { entityType: EntityType; entityId: string }[]
  ): Observable<ActivityLog> {
    return this.addActivityLog({
      action: 'delete',
      description: `Deleted ${entityType}: ${entityName}`,
      entityType,
      entityId,
      userId,
      userName,
      severity: 'info',
      systemGenerated: false,
      details,
      related,
      tags: ['deletion', entityType]
    });
  }

  /**
   * Log work order creation
   */
  logWorkOrderCreation(
    workOrderId: string, 
    workOrderTitle: string, 
    userId: string, 
    userName: string,
    details?: any
  ): Observable<ActivityLog> {
    return this.logEntityCreation(
      'workOrder',
      workOrderId,
      workOrderTitle,
      userId,
      userName,
      details
    );
  }

  /**
   * Log work order update
   */
  logWorkOrderUpdate(
    workOrderId: string, 
    workOrderTitle: string, 
    userId: string, 
    userName: string, 
    changes: any,
    before?: any,
    after?: any
  ): Observable<ActivityLog> {
    return this.logEntityUpdate(
      'workOrder',
      workOrderId,
      workOrderTitle,
      userId,
      userName,
      changes,
      before,
      after
    );
  }

  /**
   * Log work order deletion
   */
  logWorkOrderDeletion(
    workOrderId: string,
    workOrderTitle: string,
    userId: string,
    userName: string
  ): Observable<ActivityLog> {
    return this.logEntityDeletion(
      'workOrder',
      workOrderId,
      workOrderTitle,
      userId,
      userName
    );
  }

  /**
   * Log remark creation
   */
  logRemarkCreation(
    remarkId: string, 
    workOrderId: string, 
    remarkType: string, 
    userId: string, 
    userName: string
  ): Observable<ActivityLog> {
    return this.logEntityCreation(
      'remark',
      remarkId,
      remarkType,
      userId,
      userName,
      { workOrderId, remarkType },
      [{ entityType: 'workOrder', entityId: workOrderId }]
    );
  }

  /**
   * Log remark update
   */
  logRemarkUpdate(
    remarkId: string, 
    workOrderId: string, 
    remarkType: string, 
    userId: string, 
    userName: string,
    before?: any,
    after?: any
  ): Observable<ActivityLog> {
    return this.logEntityUpdate(
      'remark',
      remarkId,
      remarkType,
      userId,
      userName,
      { workOrderId, remarkType },
      before,
      after,
      [{ entityType: 'workOrder', entityId: workOrderId }]
    );
  }

  /**
   * Log remark deletion
   */
  logRemarkDeletion(
    remarkId: string, 
    workOrderId: string, 
    remarkType: string, 
    userId: string, 
    userName: string
  ): Observable<ActivityLog> {
    return this.logEntityDeletion(
      'remark',
      remarkId,
      remarkType,
      userId,
      userName,
      { workOrderId, remarkType },
      [{ entityType: 'workOrder', entityId: workOrderId }]
    );
  }

  /**
   * Log a user action that doesn't modify data
   */
  logUserAction(
    action: ActionType,
    description: string,
    userId: string,
    userName: string,
    details?: any
  ): Observable<ActivityLog> {
    return this.addActivityLog({
      action,
      description,
      entityType: 'user',
      entityId: userId,
      userId,
      userName,
      severity: 'info',
      systemGenerated: false,
      details,
      tags: [action, 'user-action']
    });
  }

  /**
   * Log a system event
   */
  logSystemEvent(
    action: ActionType,
    description: string,
    details?: any,
    severity: 'info' | 'warning' | 'critical' = 'info'
  ): Observable<ActivityLog> {
    return this.addActivityLog({
      action,
      description,
      entityType: 'system',
      entityId: 'system',
      userId: 'system',
      userName: 'System',
      severity,
      systemGenerated: true,
      details,
      tags: [action, 'system', severity]
    });
  }

  /**
   * Log any activity directly with provided data
   */
  logActivity(data: {
    entityType: EntityType;
    entityId: string;
    action: ActionType;
    userId: string;
    description: string;
    timestamp?: Date;
    userName?: string;
    details?: any;
    changes?: any;
    related?: { entityType: EntityType; entityId: string }[];
    tags?: string[];
    severity?: 'info' | 'warning' | 'critical';
    systemGenerated?: boolean;
  }): Observable<ActivityLog> {
    const userName = data.userName || 'Unknown User';
    
    return this.addActivityLog({
      action: data.action,
      description: data.description,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      userName: userName,
      severity: data.severity || 'info',
      systemGenerated: data.systemGenerated || false,
      details: data.details,
      related: data.related,
      tags: data.tags || [data.action, data.entityType],
      changes: data.changes
    });
  }

  /**
   * Log an error event
   */
  logErrorEvent(
    error: Error,
    context: string,
    userId?: string,
    userName?: string
  ): Observable<ActivityLog> {
    return this.addActivityLog({
      action: 'create',
      description: `Error: ${error.message}`,
      entityType: 'system',
      entityId: 'error',
      userId: userId || 'system',
      userName: userName || 'System',
      severity: 'critical',
      systemGenerated: true,
      details: {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context
      },
      tags: ['error', context]
    });
  }

  /**
   * Export logs to CSV format
   */
  exportLogsToCSV(logs: ActivityLog[]): string {
    const headers = ['ID', 'Timestamp', 'Action', 'Description', 'Entity Type', 'Entity ID', 'User', 'Severity'];
    const csvRows = [headers.join(',')];
    
    for (const log of logs) {
      const row = [
        log.id,
        log.timestamp.toISOString(),
        log.action,
        `"${log.description.replace(/"/g, '""')}"`, // Escape quotes
        log.entityType,
        log.entityId,
        log.userName,
        log.severity || 'info'
      ];
      
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }

  /**
   * Log a user interaction
   */
  logUserInteraction(interaction: UserInteraction, userId: string, userName: string): Observable<any> {
    return this.logUserAction(
      'interaction',
      `User ${interaction.type} on ${interaction.target.element}`,
      userId,
      userName,
      interaction
    );
  }

  /**
   * Log a page view
   */
  logPageView(url: string, userId: string, userName: string): Observable<any> {
    return this.logUserAction(
      'view',
      `Viewed page: ${this.extractPageNameFromUrl(url)}`,
      userId,
      userName,
      {
        url,
        page: this.extractPageNameFromUrl(url),
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Log an idle timeout
   */
  logIdleTimeout(userId: string, userName: string): Observable<any> {
    return this.logUserAction(
      'idle',
      'User inactive',
      userId,
      userName,
      {
        idleDuration: '30 minutes',
        timestamp: new Date().toISOString()
      }
    );
  }

  /**
   * Extract page name from URL
   */
  private extractPageNameFromUrl(url: string): string {
    // Remove query params and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Split by slashes and filter out empty segments
    const segments = cleanUrl.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return 'Home';
    }
    
    // Get the last segment
    let pageName = segments[segments.length - 1];
    
    // If it's an ID (numeric or UUID-like), use the previous segment + "Detail"
    if (/^[0-9]+$/.test(pageName) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pageName)) {
      if (segments.length > 1) {
        pageName = segments[segments.length - 2] + ' Detail';
      }
    }
    
    // Convert kebab-case to Title Case
    return pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
} 