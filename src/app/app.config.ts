import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withDebugTracing } from '@angular/router';
import { routes } from './app-routing.module';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CoreModule } from './core/core.module';
import { provideHttpClient, withInterceptors, withFetch, withJsonpSupport } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { UserActivityService } from './shared/services/user-activity.service';
import { inject } from '@angular/core';
import { ActivityLogService } from './shared/services/activity-log.service';
import { UserService } from './shared/services/user.service';
import { activityLoggingInterceptor } from './shared/interceptors/activity-logging.interceptor';
import { GlobalErrorHandler } from './shared/error-handlers/global-error-handler';

// Factory function to initialize user activity tracking
export function initializeUserActivityTracking(userActivityService: UserActivityService) {
  return () => {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      userActivityService.startTracking();
      console.log('User activity tracking initialized');
    }
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Core Angular providers
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),

    // HTTP client with interceptors
    provideHttpClient(
      withFetch(),
      withJsonpSupport(),
      withInterceptors([
        // Enable activity logging interceptor
        activityLoggingInterceptor
      ])
    ),

    // Core module with shared services
    importProvidersFrom(CoreModule),

    // Global error handler
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // Initialize user activity tracking when app starts
    {
      provide: APP_INITIALIZER,
      useFactory: initializeUserActivityTracking,
      deps: [UserActivityService],
      multi: true
    }
  ]
};
