import { Injectable } from '@angular/core';
import { WorkOrderStatus } from '../models/work-order-status.enum';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderStatusService {
  // Cache for status display names
  private statusDisplayNameMap = new Map<string, string>();

  constructor() {
    this.initializeStatusDisplayNames();
  }

  /**
   * Initialize the mapping of status values to display names
   */
  private initializeStatusDisplayNames(): void {
    // For each status in the enum, generate a display name
    for (const statusKey in WorkOrderStatus) {
      const statusValue = WorkOrderStatus[statusKey as keyof typeof WorkOrderStatus];
      if (typeof statusValue === 'string') {
        // Some statuses already have a better display name in the enum value
        if (statusValue.includes(' ')) {
          this.statusDisplayNameMap.set(statusValue, statusValue);
        } else {
          // Convert enum key to display name (e.g., InProgress -> "In Progress")
          const displayName = statusKey.replace(/([A-Z])/g, ' $1').trim();
          this.statusDisplayNameMap.set(statusValue, displayName);
        }
      }
    }
  }

  /**
   * Get the display name for a status value
   */
  getDisplayName(statusValue: string): string {
    // Check the cache first
    if (this.statusDisplayNameMap.has(statusValue)) {
      return this.statusDisplayNameMap.get(statusValue)!;
    }

    // Default to title case of the status value
    return statusValue.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Get a category for a status (e.g., 'active', 'completed', 'waiting', etc.)
   * Useful for styling or filtering by category
   */
  getStatusCategory(status: string): 'active' | 'completed' | 'waiting' | 'cancelled' | 'other' {
    const lowerStatus = status.toLowerCase();

    if (lowerStatus.includes('in-progress') ||
        lowerStatus.includes('ready for') ||
        lowerStatus === WorkOrderStatus.InProgress.toLowerCase()) {
      return 'active';
    }

    if (lowerStatus.includes('completed') ||
        lowerStatus.includes('closed') ||
        lowerStatus === WorkOrderStatus.Completed.toLowerCase()) {
      return 'completed';
    }

    if (lowerStatus.includes('waiting') ||
        lowerStatus.includes('pending') ||
        lowerStatus === WorkOrderStatus.Pending.toLowerCase() ||
        lowerStatus === WorkOrderStatus.OnHold.toLowerCase()) {
      return 'waiting';
    }

    if (lowerStatus.includes('cancel') ||
        lowerStatus === WorkOrderStatus.Cancelled.toLowerCase()) {
      return 'cancelled';
    }

    return 'other';
  }
}
