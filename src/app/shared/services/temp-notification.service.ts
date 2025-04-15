import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface TempNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'remark' | 'work-order' | 'task';
  timestamp: Date;
  isRead: boolean;
  userId: string;
  workOrderId?: string;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TempNotificationService {
  // Mock notifications data
  private mockNotifications: TempNotification[] = [];
  private notificationsSubject = new BehaviorSubject<TempNotification[]>([]);
  
  constructor() {}

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    console.log('Success:', message);
    // In a real implementation, this would show a snackbar
  }
  
  /**
   * Show error message
   */
  showError(message: string): void {
    console.error('Error:', message);
    // In a real implementation, this would show a snackbar
  }

  /**
   * Send bulk notifications to multiple users
   */
  sendBulkNotifications(data: {
    title: string;
    message: string;
    type?: string;
    userIds: string[];
    workOrderId?: string;
    actionUrl?: string;
  }): Observable<boolean> {
    if (!data.userIds || data.userIds.length === 0) {
      return throwError(() => new Error('User IDs are required for bulk notifications'));
    }
    
    const notifications: TempNotification[] = data.userIds.map(userId => ({
      id: `notif-${Date.now()}-${userId}`,
      title: data.title,
      message: data.message,
      type: (data.type || 'info') as any,
      timestamp: new Date(),
      isRead: false,
      userId: userId,
      workOrderId: data.workOrderId,
      actionUrl: data.actionUrl
    }));
    
    this.mockNotifications.unshift(...notifications);
    this.notificationsSubject.next([...this.mockNotifications]);
    
    console.log('Sending notifications:', data);
    
    return of(true).pipe(
      delay(300),
      catchError(error => {
        console.error('Error sending bulk notifications:', error);
        return throwError(() => new Error('Failed to send bulk notifications'));
      })
    );
  }
} 