import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Notification {
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

export interface NotificationPayload {
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  workOrderId?: string;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Mock notifications data
  private mockNotifications: Notification[] = [
    {
      id: 'notif1',
      title: 'Work Order Assigned',
      message: 'You have been assigned to Work Order WO-2024-001',
      type: 'work-order',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      userId: 'user1',
      workOrderId: 'wo1',
      actionUrl: '/work-orders/details/wo1'
    },
    {
      id: 'notif2',
      title: 'New Remark Added',
      message: 'A safety remark was added to Work Order WO-2024-002',
      type: 'remark',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: true,
      userId: 'user1',
      workOrderId: 'wo2',
      actionUrl: '/work-orders/details/wo2'
    },
    {
      id: 'notif3',
      title: 'Work Order Status Changed',
      message: 'Work Order WO-2024-003 has been marked as completed',
      type: 'info',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isRead: false,
      userId: 'user2',
      workOrderId: 'wo3',
      actionUrl: '/work-orders/details/wo3'
    }
  ];

  private notificationsSubject = new BehaviorSubject<Notification[]>(this.mockNotifications);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Get all notifications
   */
  getAllNotifications(): Observable<Notification[]> {
    return of(this.mockNotifications).pipe(
      delay(300),
      catchError(error => {
        console.error('Error fetching notifications:', error);
        return throwError(() => new Error('Failed to fetch notifications'));
      })
    );
  }

  /**
   * Get notifications for a specific user
   */
  getNotificationsForUser(userId: string): Observable<Notification[]> {
    const userNotifications = this.mockNotifications.filter(n => n.userId === userId);
    
    return of(userNotifications).pipe(
      delay(300),
      catchError(error => {
        console.error(`Error fetching notifications for user ${userId}:`, error);
        return throwError(() => new Error(`Failed to fetch notifications for user ${userId}`));
      })
    );
  }

  /**
   * Get unread notifications count for a user
   */
  getUnreadCount(userId: string): Observable<number> {
    return this.getNotificationsForUser(userId).pipe(
      map(notifications => notifications.filter(n => !n.isRead).length)
    );
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string): Observable<Notification> {
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) {
      return throwError(() => new Error(`Notification with ID ${notificationId} not found`));
    }
    
    this.mockNotifications[index] = {
      ...this.mockNotifications[index],
      isRead: true
    };
    
    this.notificationsSubject.next([...this.mockNotifications]);
    
    return of(this.mockNotifications[index]).pipe(
      delay(300),
      catchError(error => {
        console.error(`Error marking notification ${notificationId} as read:`, error);
        return throwError(() => new Error(`Failed to mark notification as read`));
      })
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): Observable<boolean> {
    const userNotifications = this.mockNotifications.filter(n => n.userId === userId && !n.isRead);
    
    if (userNotifications.length === 0) {
      return of(true).pipe(delay(300));
    }
    
    userNotifications.forEach(notification => {
      const index = this.mockNotifications.findIndex(n => n.id === notification.id);
      this.mockNotifications[index] = {
        ...this.mockNotifications[index],
        isRead: true
      };
    });
    
    this.notificationsSubject.next([...this.mockNotifications]);
    
    return of(true).pipe(
      delay(300),
      catchError(error => {
        console.error(`Error marking all notifications as read for user ${userId}:`, error);
        return throwError(() => new Error(`Failed to mark all notifications as read`));
      })
    );
  }

  /**
   * Send a notification
   */
  sendNotification(notification: Partial<Notification>): Observable<Notification> {
    if (!notification.userId) {
      return throwError(() => new Error('User ID is required for notification'));
    }
    
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      title: notification.title || 'New Notification',
      message: notification.message || '',
      type: notification.type || 'info',
      timestamp: new Date(),
      isRead: false,
      userId: notification.userId,
      workOrderId: notification.workOrderId,
      actionUrl: notification.actionUrl
    };
    
    this.mockNotifications.unshift(newNotification);
    this.notificationsSubject.next([...this.mockNotifications]);
    
    return of(newNotification).pipe(
      delay(300),
      catchError(error => {
        console.error('Error sending notification:', error);
        return throwError(() => new Error('Failed to send notification'));
      })
    );
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
    
    const notifications: Notification[] = data.userIds.map(userId => ({
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
    
    return of(true).pipe(
      delay(300),
      catchError(error => {
        console.error('Error sending bulk notifications:', error);
        return throwError(() => new Error('Failed to send bulk notifications'));
      })
    );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Observable<boolean> {
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) {
      return throwError(() => new Error(`Notification with ID ${notificationId} not found`));
    }
    
    this.mockNotifications.splice(index, 1);
    this.notificationsSubject.next([...this.mockNotifications]);
    
    return of(true).pipe(
      delay(300),
      catchError(error => {
        console.error(`Error deleting notification ${notificationId}:`, error);
        return throwError(() => new Error(`Failed to delete notification`));
      })
    );
  }

  /**
   * Show a success message
   * @param message The message to show
   */
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show an error message
   * @param message The message to show
   */
  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Show an info message
   * @param message The message to show
   */
  showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000
    });
  }
} 