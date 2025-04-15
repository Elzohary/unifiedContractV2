import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ActivityLogService, EntityType, ActionType } from '../services/activity-log.service';
import { UserService } from '../services/user.service';

/**
 * Activity Logging Interceptor (Functional API)
 * 
 * Automatically logs all HTTP requests and responses for activity tracking.
 * This acts as part of the "spider" that captures all API interactions.
 */
export const activityLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const activityLogService = inject(ActivityLogService);
  const userService = inject(UserService);
  
  // Skip logging for activity log API calls to prevent infinite loops
  if (req.url.includes('/activity-logs')) {
    return next(req);
  }

  // Skip logging for static assets, if needed
  if (req.url.match(/\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return next(req);
  }

  const startTime = Date.now();
  const requestMethod = req.method;
  const requestUrl = req.url;

  // Determine action type based on HTTP method
  const actionMap: Record<string, ActionType> = {
    'GET': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
  };

  // Try to extract entity type and ID from URL
  const possibleEntityType = extractEntityTypeFromUrl(requestUrl);
  const possibleEntityId = extractEntityIdFromUrl(requestUrl);

  // Get current user info
  const userId = userService.getCurrentUserId() || 'unknown';
  const userName = userService.getCurrentUserName() || 'Unknown User';

  // Process the request and log the activity
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const duration = Date.now() - startTime;
        const status = event.status;

        // Extract relevant information from the response
        let responseData = null;
        try {
          responseData = event.body;
        } catch (error) {
          console.warn('Could not extract response body for logging', error);
        }

        // Only log successful API calls (status 2xx)
        if (status >= 200 && status < 300) {
          logApiActivity(
            activityLogService,
            actionMap[requestMethod] || 'read',
            `${requestMethod} ${sanitizeUrl(requestUrl)}`,
            possibleEntityType,
            possibleEntityId,
            userId,
            userName,
            {
              duration: `${duration}ms`,
              status,
              contentLength: event.headers.get('content-length'),
              hasBody: !!responseData
            },
            responseData
          );
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const duration = Date.now() - startTime;

      // Log the error
      activityLogService.logErrorEvent(
        new Error(`API Error: ${error.status} ${error.statusText}`),
        `HTTP ${requestMethod} ${sanitizeUrl(requestUrl)}`,
        userId,
        userName
      ).subscribe();

      // Log the failed API activity
      logApiActivity(
        activityLogService,
        'error',
        `Failed ${requestMethod} ${sanitizeUrl(requestUrl)}`,
        possibleEntityType,
        possibleEntityId,
        userId,
        userName,
        {
          duration: `${duration}ms`,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        }
      );

      return throwError(() => error);
    })
  );
};

/**
 * Log an API activity
 */
function logApiActivity(
  activityLogService: ActivityLogService,
  action: string,
  description: string,
  entityType: string | null,
  entityId: string | null,
  userId: string,
  userName: string,
  details: any,
  responseData?: any
): void {
  // Cast to valid EntityType or use 'system' as fallback
  let finalEntityType: EntityType;
  if (entityType && ['workOrder', 'remark', 'issue', 'user', 'material', 'task', 'system', 
    'client', 'invoice', 'payment', 'document', 'attachment', 'equipment', 
    'permit', 'location', 'form', 'notification', 'report', 'expense', 'schedule'].includes(entityType)) {
    finalEntityType = entityType as EntityType;
  } else {
    finalEntityType = 'system';
  }
  
  const finalEntityId = entityId || 'api';
  
  // Ensure action is a valid ActionType
  let finalAction: ActionType;
  if (['create', 'read', 'update', 'delete', 'login', 'logout', 
      'download', 'upload', 'share', 'print', 'export', 'import', 
      'archive', 'restore', 'assign', 'reassign', 'approve', 'reject', 
      'complete', 'cancel', 'pause', 'resume', 'comment', 'view'].includes(action)) {
    finalAction = action as ActionType;
  } else {
    finalAction = 'read'; // Default fallback
  }

  activityLogService.addActivityLog({
    action: finalAction,
    description,
    entityType: finalEntityType,
    entityId: finalEntityId,
    userId,
    userName,
    severity: 'info',
    systemGenerated: true,
    details: {
      ...details,
      apiResponse: responseData ? sanitizeResponseForLogging(responseData) : null
    },
    tags: ['api', action, finalEntityType]
  }).subscribe({
    error: (err) => console.error('Failed to log API activity', err)
  });
}

/**
 * Extract entity type from URL
 */
function extractEntityTypeFromUrl(url: string): string | null {
  // Common REST API patterns
  const patterns = [
    // /api/entityType/entityId
    /\/api\/([a-zA-Z-]+)\/([a-zA-Z0-9-]+)/,
    // /entityType/entityId
    /\/([a-zA-Z-]+)\/([a-zA-Z0-9-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const entityType = match[1];
      // Convert kebab-case to camelCase if needed
      return entityType.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
  }

  return null;
}

/**
 * Extract entity ID from URL
 */
function extractEntityIdFromUrl(url: string): string | null {
  // Common REST API patterns
  const patterns = [
    // /api/entityType/entityId
    /\/api\/([a-zA-Z-]+)\/([a-zA-Z0-9-]+)/,
    // /entityType/entityId
    /\/([a-zA-Z-]+)\/([a-zA-Z0-9-]+)/,
    // Just an ID at the end
    /\/([a-zA-Z0-9-]+)$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[2]) {
      return match[2];
    }
  }

  return null;
}

/**
 * Sanitize URL for logging (remove sensitive parts)
 */
function sanitizeUrl(url: string): string {
  // Remove any API keys, tokens, or other sensitive data from the URL
  return url.replace(/([?&](api_key|token|key|secret|password)=)[^&]+/gi, '$1[REDACTED]');
}

/**
 * Sanitize response data for logging (remove sensitive parts, trim large payloads)
 */
function sanitizeResponseForLogging(data: any): any {
  if (!data) return null;

  try {
    // Deep clone to avoid modifying the original data
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey', 'authorization'];
    
    const sanitizeObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        
        // Check if this is a sensitive field
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          obj[key] = '[REDACTED]';
        } 
        // Recursively sanitize nested objects
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);

    // Truncate large arrays
    const truncateArrays = (obj: any, maxLength = 10) => {
      if (!obj || typeof obj !== 'object') return;

      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key]) && obj[key].length > maxLength) {
          // Keep track of original length
          const originalLength = obj[key].length;
          // Truncate the array
          obj[key] = obj[key].slice(0, maxLength);
          // Add indicator of truncation
          obj[key].push(`[...${originalLength - maxLength} more items]`);
        } 
        // Recursively truncate nested objects
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
          truncateArrays(obj[key], maxLength);
        }
      }
    };

    truncateArrays(sanitized);

    return sanitized;
  } catch (error) {
    console.warn('Error sanitizing response data', error);
    return { error: 'Could not sanitize response data for logging' };
  }
} 