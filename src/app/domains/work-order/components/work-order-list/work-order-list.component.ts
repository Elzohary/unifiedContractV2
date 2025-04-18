import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, NO_ERRORS_SCHEMA } from '@angular/core';
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
export class WorkOrderListComponent implements OnInit, OnDestroy {
  // Page title and header actions
  pageTitle = 'Work Orders';
  headerActions: HeaderAction[] = [
    { id: 'new', label: 'New Work Order', icon: 'add', color: 'primary', callback: 'createNewWorkOrder' }
  ];

  // Status options for dropdown
  statusOptions: { value: string; label: string }[] = [];
  
  // Table columns
  tableColumns: TableColumn[] = [];
  
  // Actions for table rows
  tableActions: TableAction[] = [
    { name: 'view', icon: 'visibility', tooltip: 'View Details' },
    { name: 'edit', icon: 'edit', tooltip: 'Edit Work Order' },
    { name: 'complete', icon: 'check_circle', tooltip: 'Mark as Completed' },
    { name: 'cancel', icon: 'cancel', tooltip: 'Cancel Work Order' }
  ];
  
  // State management
  private state = new BehaviorSubject<WorkOrderListState>({
    allWorkOrders: [],
    filteredWorkOrders: [],
    loading: true,
    error: false,
    errorMessage: '',
    searchText: '',
    selectedStatus: 'all',
    currentSort: { active: 'receivedDate', direction: 'desc' },
    pageIndex: 0,
    pageSize: 10
  });
  
  // Observable for state
  state$ = this.state.asObservable();
  
  // Derived observable properties
  get workOrders(): WorkOrder[] {
    return this.state.value.filteredWorkOrders;
  }
  
  get loading(): boolean {
    return this.state.value.loading;
  }
  
  get loadingError(): boolean {
    return this.state.value.error;
  }
  
  get errorMessage(): string {
    return this.state.value.errorMessage;
  }
  
  get searchText(): string {
    return this.state.value.searchText;
  }
  
  get selectedStatus(): string {
    return this.state.value.selectedStatus;
  }
  
  set selectedStatus(value: string) {
    this.updateState({ selectedStatus: value });
  }
  
  // For unsubscribing
  private destroy$ = new Subject<void>();

  constructor(
    private workOrderService: WorkOrderService,
    private statusService: WorkOrderStatusService
  ) {}

  ngOnInit(): void {
    this.setupStatusOptions();
    this.setupTableColumns();
    this.loadWorkOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Set up status filter options
   */
  private setupStatusOptions(): void {
    this.statusOptions = this.statusService.getAllStatusOptions();
  }

  /**
   * Set up table columns configuration
   */
  private setupTableColumns(): void {
    this.tableColumns = [
      {
        name: 'orderNumber',
        label: 'Order #',
        valueGetter: (workOrder: WorkOrder) => workOrder.details?.workOrderNumber || '',
        sortable: true
      },
      {
        name: 'receivedDate',
        label: 'Received Date',
        valueGetter: (workOrder: WorkOrder) => workOrder.details?.receivedDate,
        sortable: true
      },
      {
        name: 'clientName',
        label: 'Client',
        valueGetter: (workOrder: WorkOrder) => workOrder.details?.client || '',
        sortable: true
      },
      {
        name: 'description',
        label: 'Description',
        valueGetter: (workOrder: WorkOrder) => workOrder.details?.description || '',
        sortable: true
      },
      {
        name: 'status',
        label: 'Status',
        valueGetter: (workOrder: WorkOrder) => workOrder.details?.status || '',
        sortable: true
      },
      {
        name: 'estimatedCost',
        label: 'Estimated Cost',
        valueGetter: (workOrder: WorkOrder) => workOrder.estimatedCost,
        sortable: true
      },
      {
        name: 'actualValue',
        label: 'Actual Value',
        valueGetter: (workOrder: WorkOrder) => this.calculateActualValue(workOrder),
        sortable: true
      },
      {
        name: 'actionsNeeded',
        label: 'Actions Needed',
        valueGetter: (workOrder: WorkOrder) => this.getActionsCount(workOrder),
        sortable: false
      },
      {
        name: 'completionPercentage',
        label: 'Completion',
        valueGetter: (workOrder: WorkOrder) => workOrder.details?.completionPercentage || 0,
        sortable: true
      }
    ];
  }

  /**
   * Update the component state
   */
  private updateState(newState: Partial<WorkOrderListState>): void {
    this.state.next({
      ...this.state.value,
      ...newState
    });
  }

  /**
   * Load work orders from the service
   */
  private loadWorkOrders(): void {
    this.updateState({ loading: true, error: false });
    
    this.workOrderService.getAllWorkOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workOrders: WorkOrder[]) => {
          this.updateState({
            allWorkOrders: workOrders,
            loading: false
          });
          this.applyFilters();
        },
        error: (error: unknown) => {
          console.error('Error loading work orders:', error);
          this.updateState({
            loading: false,
            error: true,
            errorMessage: 'Failed to load work orders. Please try again later.'
          });
        }
      });
  }

  /**
   * Apply all current filters (search, status) to the data
   */
  private applyFilters(): void {
    const currentState = this.state.value;
    const { allWorkOrders, searchText, selectedStatus, currentSort } = currentState;
    
    // Start with all work orders
    let filtered = [...allWorkOrders];
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(workOrder => workOrder.details?.status === selectedStatus);
    }
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(workOrder => {
        return (
          workOrder.details?.workOrderNumber?.toString().toLowerCase().includes(searchLower) ||
          workOrder.details?.client?.toLowerCase().includes(searchLower) ||
          workOrder.details?.description?.toLowerCase().includes(searchLower) ||
          (workOrder.details?.status && this.statusService.getDisplayName(workOrder.details.status).toLowerCase().includes(searchLower)) ||
          this.getActionNeededText(workOrder).toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply sorting
    if (currentSort.active && currentSort.direction) {
      filtered = this.sortData(filtered, currentSort.active, currentSort.direction);
    }
    
    this.updateState({ filteredWorkOrders: filtered });
  }

  /**
   * Get text representation of actions needed
   */
  private getActionNeededText(workOrder: WorkOrder): string {
    const count = this.getActionsCount(workOrder);
    return count > 0 ? `${count} action${count > 1 ? 's' : ''} needed` : 'No actions needed';
  }

  /**
   * Sort data based on column and direction
   */
  private sortData(data: WorkOrder[], column: string, direction: SortDirection): WorkOrder[] {
    if (!column || direction === '') {
      return data;
    }
    
    return [...data].sort((a, b) => {
      // Find the column definition to get the valueGetter
      const columnDef = this.tableColumns.find(col => col.name === column);
      
      // Use the valueGetter if available, otherwise access the property directly
      const aValue: any = columnDef?.valueGetter ? 
        columnDef.valueGetter(a) : 
        this.getNestedPropertyValue(a, column);
      
      const bValue: any = columnDef?.valueGetter ? 
        columnDef.valueGetter(b) : 
        this.getNestedPropertyValue(b, column);
      
      // Handle different types of values
      let result = 0;
      
      if (aValue === bValue) {
        result = 0;
      } else if (aValue === null || aValue === undefined) {
        result = -1;
      } else if (bValue === null || bValue === undefined) {
        result = 1;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        result = aValue.getTime() - bValue.getTime();
      } else {
        result = aValue < bValue ? -1 : 1;
      }
      
      return direction === 'asc' ? result : -result;
    });
  }

  /**
   * Safely access nested properties
   */
  private getNestedPropertyValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

  /**
   * Calculate the actual value of a work order based on expenses
   */
  calculateActualValue(workOrder: WorkOrder): number {
    return workOrder.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  }

  /**
   * Get count of actions needed for a work order
   */
  getActionsCount(workOrder: WorkOrder): number {
    return workOrder.actionsNeeded?.length || 0;
  }

  /**
   * Get the color for progress bar based on completion percentage
   */
  getProgressColor(percentage: number): 'primary' | 'accent' | 'warn' {
    if (percentage >= 75) return 'primary';
    if (percentage >= 25) return 'accent';
    return 'warn';
  }

  /**
   * Format currency with the appropriate locale and currency symbol
   */
  formatCurrency(value: number): string {
    return formatCurrency(value, 'en-US', '$', 'USD');
  }

  /**
   * Get CSS class for a status
   */
  getStatusClass(status: string): string {
    return this.statusService.getStatusCategory(status);
  }

  /**
   * Get display name for a status
   */
  getStatusDisplayName(status: string): string {
    return this.statusService.getDisplayName(status);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: string): void {
    this.updateState({ selectedStatus: status, pageIndex: 0 });
    this.applyFilters();
  }

  /**
   * Handle search input change
   */
  onSearchChanged(searchText: string): void {
    this.updateState({ searchText, pageIndex: 0 });
    this.applyFilters();
  }

  /**
   * Handle row click
   */
  onRowClicked(workOrder: WorkOrder): void {
    console.log('Row clicked:', workOrder);
    // TODO: Implement navigation to detail view
  }

  /**
   * Handle sort change
   */
  onSortChanged(sort: Sort): void {
    const direction = sort.direction as SortDirection;
    this.updateState({ currentSort: { active: sort.active, direction } });
    this.applyFilters();
  }

  /**
   * Handle page change
   */
  onPageChanged(event: { pageIndex: number; pageSize: number }): void {
    this.updateState({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

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

  /**
   * Handle row action (view, edit, complete, cancel)
   */
  onRowAction(event: { action: string; row: WorkOrder }): void {
    const { action, row } = event;
    
    switch (action) {
      case 'view':
        console.log('View work order:', row);
        // TODO: Implement navigation to detail view
        break;
      case 'edit':
        console.log('Edit work order:', row);
        // TODO: Implement navigation to edit view
        break;
      case 'complete':
        console.log('Complete work order:', row);
        this.completeWorkOrder(row);
        break;
      case 'cancel':
        console.log('Cancel work order:', row);
        this.cancelWorkOrder(row);
        break;
      default:
        console.log(`Unknown action: ${action}`, row);
    }
  }

  /**
   * Mark a work order as completed
   */
  private completeWorkOrder(workOrder: WorkOrder): void {
    // Create updated work order with new status
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      details: {
        ...workOrder.details as workOrderDetail,
        status: WorkOrderStatus.Completed,
        completionPercentage: 100
      }
    };
    
    this.workOrderService.updateWorkOrder(updatedWorkOrder.id, updatedWorkOrder)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update the local data
          this.updateWorkOrderInState(updatedWorkOrder);
        },
        error: (error: unknown) => {
          console.error('Error completing work order:', error);
          // TODO: Show error message
        }
      });
  }

  /**
   * Cancel a work order
   */
  private cancelWorkOrder(workOrder: WorkOrder): void {
    // Create updated work order with new status
    const updatedWorkOrder: WorkOrder = {
      ...workOrder,
      details: {
        ...workOrder.details as workOrderDetail,
        status: WorkOrderStatus.Cancelled
      }
    };
    
    this.workOrderService.updateWorkOrder(updatedWorkOrder.id, updatedWorkOrder)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update the local data
          this.updateWorkOrderInState(updatedWorkOrder);
        },
        error: (error: unknown) => {
          console.error('Error cancelling work order:', error);
          // TODO: Show error message
        }
      });
  }

  /**
   * Update a work order in the state
   */
  private updateWorkOrderInState(updatedWorkOrder: WorkOrder): void {
    const currentState = this.state.value;
    
    // Update in allWorkOrders
    const allWorkOrders = currentState.allWorkOrders.map(workOrder => 
      workOrder.id === updatedWorkOrder.id ? updatedWorkOrder : workOrder
    );
    
    this.updateState({ allWorkOrders });
    this.applyFilters();
  }
}