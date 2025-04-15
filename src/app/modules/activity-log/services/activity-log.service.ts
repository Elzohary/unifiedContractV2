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
  private endpoint = 'activity-logs';

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    private websocketService: WebsocketService
  ) {
    this.websocketService.subscribeToActivityLogs().subscribe(log => {
      const currentLogs = this.stateService.activityLogs$();
      this.stateService.updateActivityLogs([log, ...currentLogs]);
    });
  }

  getAllActivityLogs(): Observable<ActivityLog[]> {
    this.stateService.setLoading('activityLogs', true);
    this.stateService.setError('activityLogs', null);

    return this.apiService.get<ActivityLog[]>(this.endpoint).pipe(
      map(response => {
        this.stateService.updateActivityLogs(response.data);
        return response.data;
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

  getActivityLogsByEntity(entityType: ActivityLogEntityType, entityId: string): Observable<ActivityLog[]> {
    this.stateService.setLoading('activityLogs', true);
    this.stateService.setError('activityLogs', null);

    return this.apiService.get<ActivityLog[]>(`${this.endpoint}/entity/${entityType}/${entityId}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('activityLogs', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('activityLogs', false);
      })
    );
  }

  getActivityLogsByUser(userId: string): Observable<ActivityLog[]> {
    this.stateService.setLoading('activityLogs', true);
    this.stateService.setError('activityLogs', null);

    return this.apiService.get<ActivityLog[]>(`${this.endpoint}/user/${userId}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('activityLogs', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('activityLogs', false);
      })
    );
  }

  logActivity(
    action: ActivityLogAction,
    entityType: ActivityLogEntityType,
    entityId: string,
    details: any
  ): Observable<ActivityLog | null> {
    this.stateService.setLoading('activityLog', true);
    this.stateService.setError('activityLog', null);

    const logData = {
      action,
      entityType,
      entityId,
      details
    };

    return this.apiService.post<ActivityLog>(this.endpoint, logData).pipe(
      map(response => {
        const newLog = response.data;
        const currentLogs = this.stateService.activityLogs$();
        this.stateService.updateActivityLogs([newLog, ...currentLogs]);
        return newLog;
      }),
      catchError(error => {
        this.stateService.setError('activityLog', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('activityLog', false);
      })
    );
  }
} 