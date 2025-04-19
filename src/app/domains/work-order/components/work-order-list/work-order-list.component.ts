import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, NO_ERRORS_SCHEMA, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule, formatCurrency } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableCardComponent, TableAction, TableColumn } from '../../../../shared/components/data-table-card/data-table-card.component';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderStatus } from '../../models/work-order-status.enum';
import { WorkOrder, workOrderDetail } from '../../models/work-order.model';
import { Injectable } from '@angular/core';

/**
 * Service for handling work order status display and management
 */
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
   * Get all statuses with their display names
   * @returns Array of status options with value and label
   */
  getAllStatusOptions(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'All Statuses' },
      // Add all status values from the enum
      ...Object.values(WorkOrderStatus).map(status => ({
        value: status,
        label: this.getDisplayName(status)
      }))
    ];
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

// Action for header
export interface HeaderAction {
  id: string;
  label: string;
  icon: string;
  color?: "" | "warn" | "primary" | "accent";
  callback: string;
}

// Interface for the component state
interface WorkOrderListState {
  allWorkOrders: WorkOrder[];
  filteredWorkOrders: WorkOrder[];
  loading: boolean;
  error: boolean;
  errorMessage: string;
  searchText: string;
  selectedStatus: string;
  currentSort: { active: string; direction: SortDirection };
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressBarModule,
    PageHeaderComponent,
    DataTableCardComponent
  ],
  templateUrl: './work-order-list.component.html',
  styleUrls: ['./work-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkOrderStatusService],
  schemas: [NO_ERRORS_SCHEMA]
})
export class WorkOrderListComponent {
  // Page title and header actions
  pageTitle = 'Work Orders';
  headerActions: HeaderAction[] = [
    { id: 'new', label: 'New Work Order', icon: 'add', color: 'primary', callback: 'work-orders/new' }
  ];


  constructor(
    private workOrderService: WorkOrderService,
    private statusService: WorkOrderStatusService
  ) {}

  /**
   * Handle header action click (e.g., New Work Order)
   */
  onHeaderAction(actionId: string): void {
    const action = this.headerActions.find(a => a.callback === actionId);
    if (!action) return;

    if (action.id === 'new') {
      console.log('Create new work order');
      // TODO: Implement navigation to create view
    }
  }
}