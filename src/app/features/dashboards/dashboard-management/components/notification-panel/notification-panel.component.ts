import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Notification, NotificationService } from '../../../../../shared/services/notification.service';
import { AuthService, AuthUser } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  template: `
    <div class="notification-panel">
      <button
        mat-icon-button
        [matMenuTriggerFor]="notificationMenu"
        [matBadge]="unreadCount > 0 ? unreadCount : null"
        matBadgeColor="warn"
        matTooltip="Notifications">
        <mat-icon>notifications</mat-icon>
      </button>

      <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before" [overlapTrigger]="false">
        <div class="notification-header">
          <h3 class="notification-title">Notifications</h3>
          <button
            mat-button
            color="primary"
            *ngIf="notifications.length > 0 && unreadCount > 0"
            (click)="markAllAsRead($event)">
            Mark all as read
          </button>
        </div>

        <mat-divider></mat-divider>

        <div class="notification-list" *ngIf="notifications.length > 0">
          <div
            *ngFor="let notification of notifications.slice(0, maxNotificationsShown)"
            (click)="onNotificationClick(notification)"
            (keydown.enter)="onNotificationClick(notification)"
            tabindex="0"
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="onNotificationClick(notification)">
            <div class="notification-icon" [ngClass]="'icon-' + notification.type">
              <mat-icon>
                {{ getIconForType(notification.type) }}
              </mat-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatRelativeTime(notification.timestamp) }}</div>
            </div>
          </div>

          <div *ngIf="notifications.length > maxNotificationsShown" class="view-all-container">
            <button mat-button color="primary" (click)="viewAllNotifications($event)">
              View all {{ notifications.length }} notifications
            </button>
          </div>
        </div>

        <div *ngIf="notifications.length === 0" class="empty-notifications">
          <mat-icon class="empty-icon">notifications_off</mat-icon>
          <p>No notifications</p>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    .notification-panel {
      display: inline-block;
    }

    ::ng-deep .notification-menu {
      max-width: 350px;
      min-width: 300px;
      max-height: 500px;
      overflow-y: auto;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }

    .notification-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0;
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color, var(--neutral-20));
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: var(--hover-color, var(--neutral-95));
    }

    .notification-item.unread {
      background-color: var(--unread-bg, var(--primary-95));
    }

    .notification-item.unread:hover {
      background-color: var(--unread-hover-bg, var(--primary-90));
    }

    .notification-icon {
      margin-right: 16px;
      display: flex;
      align-items: flex-start;
    }

    .notification-icon mat-icon {
      color: var(--icon-color, var(--neutral-60));
    }

    .icon-info mat-icon {
      color: var(--info-color, var(--primary-70));
    }

    .icon-warning mat-icon {
      color: var(--warning-color, var(--secondary-70));
    }

    .icon-error mat-icon {
      color: var(--error-color, #f44336);
    }

    .icon-success mat-icon {
      color: var(--success-color, var(--primary-60));
    }

    .icon-remark mat-icon {
      color: var(--remark-color, var(--tertiary-70));
    }

    .icon-work-order mat-icon {
      color: var(--work-order-color, var(--primary-50));
    }

    .icon-task mat-icon {
      color: var(--task-color, var(--secondary-60));
    }

    .notification-content {
      flex: 1;
      font-size: 14px;
    }

    .notification-message {
      color: var(--text-secondary, var(--neutral-70));
      margin: 4px 0;
    }

    .notification-time {
      font-size: 12px;
      color: var(--text-tertiary, var(--neutral-60));
    }

    .empty-notifications,
    .view-all-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      color: var(--text-tertiary, var(--neutral-60));
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.4;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      :host {
        --border-color: var(--neutral-30);
        --hover-color: var(--neutral-25);
        --unread-bg: var(--primary-30);
        --unread-hover-bg: var(--primary-40);
        --text-secondary: var(--neutral-80);
        --text-tertiary: var(--neutral-70);
      }
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  currentUserId = 'user1'; // Default user, should be retrieved from auth service
  maxNotificationsShown = 5;

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user ID from auth service
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: AuthUser | null) => {
        if (user) {
          this.currentUserId = user.userId; // Assuming AuthUser has userId property instead of id
          this.loadUserNotifications();
        }
      });

    // Subscribe to notification changes
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadUserNotifications();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserNotifications(): void {
    this.notificationService.getNotificationsForUser(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        // Sort by date, newest first
        this.notifications = notifications.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Count unread
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      });
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }

    // Navigate to related content if applicable
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
    } else if (notification.workOrderId) {
      this.router.navigate(['/work-orders/details', notification.workOrderId]);
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  viewAllNotifications(event: Event): void {
    event.stopPropagation();
    // Navigate to notifications page
    this.router.navigate(['/notifications']);
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(date).toLocaleDateString();
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'check_circle';
      case 'remark':
        return 'comment';
      case 'work-order':
        return 'engineering';
      case 'task':
        return 'task';
      default:
        return 'notifications';
    }
  }
}
