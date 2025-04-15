import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { StateService } from '../../../core/services/state.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { ActivityLog, ActivityLogAction, ActivityLogEntityType } from '../../../shared/models/activity-log.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private readonly endpoint = 'activity-logs';

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    private websocketService: WebsocketService
  ) {
    // Subscribe to real-time activity updates
    this.websocketService.on<ActivityLog>('activity').subscribe(activity => {
      const currentLogs = this.stateService.activityLogs$();
      this.stateService.updateActivityLogs([activity, ...currentLogs]);
    });
  }

  // Get all activity logs
  getAllActivityLogs(): Observable<ActivityLog[]> {
    this.stateService.setLoading('activityLogs', true);
    
    return this.apiService.get<ActivityLog[]>(this.endpoint).pipe(
      map(response => {
        const logs = response.data;
        this.stateService.updateActivityLogs(logs);
        return logs;
      }),
      catchError(error => {
        this.stateService.setError('activityLogs', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('activityLogs', false);
      })
    );
  }

  // Get activity logs by entity
  getActivityLogsByEntity(
    entityType: ActivityLogEntityType,
    entityId: string
  ): Observable<ActivityLog[]> {
    this.stateService.setLoading(`activityLogs-${entityType}-${entityId}`, true);
    
    return this.apiService.get<ActivityLog[]>(
      `${this.endpoint}/entity/${entityType}/${entityId}`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError(`activityLogs-${entityType}-${entityId}`, error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading(`activityLogs-${entityType}-${entityId}`, false);
      })
    );
  }

  // Get activity logs by user
  getActivityLogsByUser(userId: string): Observable<ActivityLog[]> {
    this.stateService.setLoading(`activityLogs-user-${userId}`, true);
    
    return this.apiService.get<ActivityLog[]>(`${this.endpoint}/user/${userId}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError(`activityLogs-user-${userId}`, error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading(`activityLogs-user-${userId}`, false);
      })
    );
  }

  // Log an activity
  logActivity(
    action: ActivityLogAction,
    entityType: ActivityLogEntityType,
    entityId: string,
    details: any
  ): Observable<ActivityLog | null> {
    this.stateService.setLoading('logActivity', true);
    
    return this.apiService.post<ActivityLog>(this.endpoint, {
      action,
      entityType,
      entityId,
      details
    }).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('logActivity', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('logActivity', false);
      })
    );
  }
} 