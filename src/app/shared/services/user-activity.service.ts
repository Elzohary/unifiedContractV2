import { Injectable, Inject, NgZone, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { fromEvent, Subject, Observable, Subscription } from 'rxjs';
import { ActivityLogService } from './activity-log.service';
import { UserService } from './user.service';

export interface UserInteraction {
  type: string;
  timestamp: Date;
  target: {
    element: string;
    id?: string;
    class?: string;
    text?: string;
  };
  location: {
    page: string;
    url: string;
  };
  details?: any;
}

/**
 * UserActivityService
 * 
 * Monitors DOM events and user interactions to track UI activity.
 * Part of the comprehensive activity tracking "spider" system.
 */
@Injectable({
  providedIn: 'root'
})
export class UserActivityService implements OnDestroy {
  private trackingEnabled = true;
  private navigationSubscription: Subscription | null = null;
  private eventSubscriptions: Subscription[] = [];
  private idleTimer: any = null;
  private lastActivity: Date = new Date();
  private idleThreshold = 30 * 60 * 1000; // 30 minutes

  // Stream of user interactions
  private userInteractionSubject = new Subject<UserInteraction>();
  public userInteraction$ = this.userInteractionSubject.asObservable();

  // Events to track
  private eventsToTrack = [
    'click',
    'dblclick',
    'contextmenu',
    'submit'
  ];

  // Elements to ignore (don't track interactions with these)
  private ignoredElements = [
    'mat-option',
    '.mat-calendar-body-cell',
    '.no-tracking',
    'input[type="password"]'
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private zone: NgZone,
    private activityLogService: ActivityLogService,
    private userService: UserService
  ) {}

  ngOnDestroy(): void {
    this.stopTracking();
  }

  /**
   * Start tracking user activity
   */
  startTracking(): void {
    if (!this.trackingEnabled || !this.isBrowser()) return;

    this.stopTracking(); // Clear any existing subscriptions

    // Track page navigation
    this.navigationSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.trackPageView(event.urlAfterRedirects);
    });

    // Track DOM events
    this.zone.runOutsideAngular(() => {
      for (const eventName of this.eventsToTrack) {
        const subscription = fromEvent(this.document, eventName, { passive: true })
          .pipe(
            debounceTime(300), // Prevent multiple rapid firings
            distinctUntilChanged()
          )
          .subscribe((event: Event) => {
            this.zone.run(() => {
              this.handleDomEvent(eventName, event);
              this.updateActivityTimestamp();
            });
          });
        
        this.eventSubscriptions.push(subscription);
      }
    });

    // Start idle timer
    this.startIdleTimer();
  }

  /**
   * Stop tracking user activity
   */
  stopTracking(): void {
    // Unsubscribe from navigation events
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
      this.navigationSubscription = null;
    }

    // Unsubscribe from DOM events
    this.eventSubscriptions.forEach(sub => sub.unsubscribe());
    this.eventSubscriptions = [];

    // Clear idle timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  /**
   * Check if we're in a browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Handle DOM events
   */
  private handleDomEvent(eventName: string, event: Event): void {
    const target = event.target as HTMLElement;
    
    // Skip if target is in ignored elements
    if (this.isIgnoredElement(target)) {
      return;
    }

    // Create interaction object
    const interaction: UserInteraction = {
      type: eventName,
      timestamp: new Date(),
      target: {
        element: target.tagName.toLowerCase(),
        id: target.id || undefined,
        class: target.className || undefined,
        text: target.textContent?.trim() || undefined
      },
      location: {
        page: this.router.url,
        url: window.location.href
      }
    };

    // Emit interaction
    this.userInteractionSubject.next(interaction);

    // Log to activity service
    this.activityLogService.logUserInteraction(
      interaction,
      this.userService.getCurrentUserId(),
      this.userService.getCurrentUserName()
    ).subscribe();
  }

  /**
   * Check if element should be ignored
   */
  private isIgnoredElement(element: HTMLElement): boolean {
    return this.ignoredElements.some(selector => {
      if (selector.startsWith('.')) {
        return element.classList.contains(selector.substring(1));
      }
      return element.matches(selector);
    });
  }

  /**
   * Track page view
   */
  private trackPageView(url: string): void {
    this.activityLogService.logPageView(
      url,
      this.userService.getCurrentUserId(),
      this.userService.getCurrentUserName()
    ).subscribe();
  }

  /**
   * Update last activity timestamp
   */
  private updateActivityTimestamp(): void {
    this.lastActivity = new Date();
    this.resetIdleTimer();
  }

  /**
   * Start idle timer
   */
  private startIdleTimer(): void {
    this.resetIdleTimer();
  }

  /**
   * Reset idle timer
   */
  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.idleThreshold);
  }

  /**
   * Handle idle timeout
   */
  private handleIdleTimeout(): void {
    this.activityLogService.logIdleTimeout(
      this.userService.getCurrentUserId(),
      this.userService.getCurrentUserName()
    ).subscribe();
  }
} 