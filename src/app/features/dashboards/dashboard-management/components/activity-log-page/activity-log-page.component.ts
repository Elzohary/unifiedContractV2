import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ActivityLogService, ActivityLog } from '../../../../../shared/services/activity-log.service';

@Component({
  selector: 'app-activity-log-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="activity-log-container">
      <!-- Compact Header -->
      <div class="page-header-container">
        <mat-card class="page-card">
          <div class="page-header">
            <div class="header-title">
              <div class="title-container">
                <mat-icon class="header-icon">history</mat-icon>
                <div>
                  <h1 class="page-title">Activity Log</h1>
                  <p class="page-subtitle">Track system activities and user actions</p>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <button mat-stroked-button color="primary" (click)="loadActivityLogs()" matTooltip="Refresh logs">
                <mat-icon>refresh</mat-icon>
                <span>Refresh</span>
              </button>
              <button mat-stroked-button [matMenuTriggerFor]="exportMenu" matTooltip="Export logs">
                <mat-icon>download</mat-icon>
                <span>Export</span>
              </button>
              <mat-menu #exportMenu="matMenu">
                <button mat-menu-item (click)="exportCsv()">
                  <mat-icon>description</mat-icon>
                  <span>CSV</span>
                </button>
                <button mat-menu-item (click)="exportPdf()">
                  <mat-icon>picture_as_pdf</mat-icon>
                  <span>PDF</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </mat-card>
      </div>
      
      <!-- Compact Filters -->
      <mat-expansion-panel class="filters-panel" [expanded]="false">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>filter_list</mat-icon>
            <span>Filter Activities</span>
          </mat-panel-title>
          <mat-panel-description *ngIf="hasActiveFilters()">
            <span>{{ getActiveFiltersCount() }} filter{{ getActiveFiltersCount() !== 1 ? 's' : '' }}</span>
          </mat-panel-description>
        </mat-expansion-panel-header>
        
        <form [formGroup]="filterForm" class="filters-form">
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput formControlName="search" placeholder="Search by description, user, or ID">
              <mat-icon matPrefix>search</mat-icon>
              <button *ngIf="filterForm.get('search')?.value" 
                      mat-icon-button 
                      matSuffix 
                      (click)="filterForm.get('search')?.setValue('')">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Action Type</mat-label>
              <mat-select formControlName="action">
                <mat-option value="">All Actions</mat-option>
                <mat-option value="create">
                  <div class="option-with-icon">
                    <mat-icon class="create-icon">add_circle</mat-icon>
                    <span>Create</span>
                  </div>
                </mat-option>
                <mat-option value="update">
                  <div class="option-with-icon">
                    <mat-icon class="update-icon">edit</mat-icon>
                    <span>Update</span>
                  </div>
                </mat-option>
                <mat-option value="delete">
                  <div class="option-with-icon">
                    <mat-icon class="delete-icon">delete</mat-icon>
                    <span>Delete</span>
                  </div>
                </mat-option>
              </mat-select>
              <mat-icon matPrefix>category</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Entity Type</mat-label>
              <mat-select formControlName="entityType">
                <mat-option value="">All Entities</mat-option>
                <mat-option value="workOrder">
                  <div class="option-with-icon">
                    <mat-icon>engineering</mat-icon>
                    <span>Work Order</span>
                  </div>
                </mat-option>
                <mat-option value="remark">
                  <div class="option-with-icon">
                    <mat-icon>comment</mat-icon>
                    <span>Remark</span>
                  </div>
                </mat-option>
                <mat-option value="issue">
                  <div class="option-with-icon">
                    <mat-icon>error</mat-icon>
                    <span>Issue</span>
                  </div>
                </mat-option>
                <mat-option value="material">
                  <div class="option-with-icon">
                    <mat-icon>inventory_2</mat-icon>
                    <span>Material</span>
                  </div>
                </mat-option>
                <mat-option value="task">
                  <div class="option-with-icon">
                    <mat-icon>task_alt</mat-icon>
                    <span>Task</span>
                  </div>
                </mat-option>
                <mat-option value="user">
                  <div class="option-with-icon">
                    <mat-icon>person</mat-icon>
                    <span>User</span>
                  </div>
                </mat-option>
              </mat-select>
              <mat-icon matPrefix>article</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Date Range</mat-label>
              <mat-date-range-input [rangePicker]="picker">
                <input matStartDate formControlName="startDate" placeholder="Start date">
                <input matEndDate formControlName="endDate" placeholder="End date">
              </mat-date-range-input>
              <mat-icon matPrefix>event</mat-icon>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-date-range-picker #picker></mat-date-range-picker>
            </mat-form-field>
          </div>
          
          <div class="filter-actions">
            <button mat-stroked-button 
                    color="primary" 
                    (click)="applyFilters()" 
                    [disabled]="!hasActiveFilters()">
              <mat-icon>filter_list</mat-icon>
              <span>Apply</span>
            </button>
            <button mat-stroked-button 
                    (click)="resetFilters()" 
                    [disabled]="!hasActiveFilters()">
              <mat-icon>clear_all</mat-icon>
              <span>Reset</span>
            </button>
          </div>
        </form>
      </mat-expansion-panel>
      
      <!-- Loading State -->
      <ng-container *ngIf="loading; else contentLoaded">
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <h2>Loading Activity Logs</h2>
          <p>Please wait while we retrieve the data...</p>
        </div>
      </ng-container>
      
      <!-- Content (Error, Empty or Logs) -->
      <ng-template #contentLoaded>
        <!-- Error State -->
        <ng-container *ngIf="error; else noError">
          <div class="error-container">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h2>Failed to Load Logs</h2>
            <p>{{ error }}</p>
            <button mat-raised-button 
                    color="primary" 
                    (click)="loadActivityLogs()">
              <mat-icon>refresh</mat-icon>
              <span>Try Again</span>
            </button>
          </div>
        </ng-container>
        
        <ng-template #noError>
          <!-- Empty State -->
          <ng-container *ngIf="filteredLogs.length === 0; else hasLogs">
            <div class="empty-container">
              <mat-icon class="empty-icon">history</mat-icon>
              <h2>No Activity Logs Found</h2>
              <p>{{ hasActiveFilters() ? 'No activities match your filters. Try adjusting your criteria.' : 'No activities have been recorded yet.' }}</p>
              <button *ngIf="hasActiveFilters()" 
                      mat-stroked-button 
                      color="primary" 
                      (click)="resetFilters()">
                <mat-icon>clear_all</mat-icon>
                <span>Clear Filters</span>
              </button>
            </div>
          </ng-container>
          
          <!-- Activity Logs Timeline -->
          <ng-template #hasLogs>
            <div class="logs-container">
              <!-- Compact Timeline Header -->
              <div class="logs-header">
                <h2 class="section-title">
                  <mat-icon>timeline</mat-icon>
                  <span>Activity Timeline</span>
                </h2>
                <div class="logs-info">
                  <span class="logs-count">{{ filteredLogs.length }} {{ filteredLogs.length === 1 ? 'activity' : 'activities' }}</span>
                  <span *ngIf="hasActiveFilters()" class="filter-indicator">
                    <mat-icon>filter_list</mat-icon>
                    <span>Filtered</span>
                  </span>
                </div>
              </div>

              <!-- Timeline Content -->
              <div class="logs-timeline">
                <div *ngFor="let log of paginatedLogs; let i = index" 
                     class="timeline-item" 
                     [class.first-item]="i === 0"
                     [style.--animation-order]="i">
                  <!-- Timeline Marker -->
                  <div class="timeline-marker" 
                       [ngClass]="getActionClass(log)" 
                       [matTooltip]="log.action | titlecase">
                    <mat-icon>{{ getActivityIcon(log) }}</mat-icon>
                  </div>
                  
                  <!-- Log Card -->
                  <div class="timeline-content">
                    <mat-card appearance="outlined" class="log-card" [ngClass]="getActionClass(log)">
                      <!-- Card Header -->
                      <div class="log-header">
                        <div class="log-title">
                          <span class="log-description">{{ getActivityDescription(log) }}</span>
                        </div>
                        
                        <div class="entity-type" 
                             [ngClass]="'entity-' + log.entityType" 
                             [matTooltip]="'Entity: ' + (log.entityType | titlecase)">
                          <mat-icon class="entity-icon">{{ getEntityIcon(log.entityType) }}</mat-icon>
                          <span>{{ log.entityType | titlecase }}</span>
                        </div>
                      </div>
                      
                      <!-- Card Body -->
                      <div class="log-body">
                        <!-- Metadata -->
                        <div class="log-meta">
                          <div class="meta-item user" [matTooltip]="'User: ' + log.userName">
                            <mat-icon>person</mat-icon>
                            <span>{{ log.userName }}</span>
                          </div>
                          <div class="meta-item time" [matTooltip]="formatActivityTimestamp(log.timestamp)">
                            <mat-icon>schedule</mat-icon>
                            <span>{{ formatActivityTimestamp(log.timestamp) }}</span>
                          </div>
                          <div *ngIf="log.entityId" class="meta-item id" [matTooltip]="'ID: ' + log.entityId">
                            <mat-icon>tag</mat-icon>
                            <span>ID: {{ log.entityId }}</span>
                          </div>
                        </div>
                        
                        <!-- Activity Details (Only shown if present) -->
                        <div *ngIf="log.details && objectKeys(log.details).length > 0" class="log-details">
                          <mat-divider></mat-divider>
                          <h4 class="details-title">Details</h4>
                          <div class="details-grid">
                            <div *ngFor="let key of objectKeys(log.details)" class="detail-item">
                              <span class="detail-label">{{ key | titlecase }}</span>
                              <span class="detail-value">{{ formatDetailValue(log.details[key]) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Card Actions (Only shown if can navigate) -->
                      <div *ngIf="canNavigateToEntity(log)" class="log-actions">
                        <button mat-stroked-button 
                                color="primary" 
                                (click)="navigateToEntity(log)" 
                                class="view-button">
                          <mat-icon>visibility</mat-icon>
                          <span>View</span>
                        </button>
                      </div>
                    </mat-card>
                  </div>
                </div>
                
                <!-- Pagination Navigation -->
                <div *ngIf="paginatedLogs.length > 0 && filteredLogs.length > pageSize" class="load-more-container">
                  <button *ngIf="pageIndex > 0" 
                          mat-stroked-button 
                          (click)="previousPage()">
                    <mat-icon>keyboard_arrow_up</mat-icon>
                    <span>Newer</span>
                  </button>
                  <button *ngIf="hasMoreLogs()" 
                          mat-stroked-button 
                          (click)="nextPage()">
                    <mat-icon>keyboard_arrow_down</mat-icon>
                    <span>Older</span>
                  </button>
                </div>
              </div>
              
              <!-- Compact Pagination Controls -->
              <div class="pagination-container">
                <mat-paginator
                  [length]="filteredLogs.length"
                  [pageSize]="pageSize"
                  [pageSizeOptions]="[10, 25, 50, 100]"
                  [showFirstLastButtons]="true"
                  (page)="onPageChange($event)">
                </mat-paginator>
              </div>
            </div>
          </ng-template>
        </ng-template>
      </ng-template>
    </div>
  `,
  styleUrl: './activity-log-page.component.scss'
})
export class ActivityLogPageComponent implements OnInit, OnDestroy {
  activityLogs: ActivityLog[] = [];
  filteredLogs: ActivityLog[] = [];
  paginatedLogs: ActivityLog[] = [];
  loading = true;
  error: string | null = null;
  
  // Pagination
  pageSize = 25;
  pageIndex = 0;
  
  // Filtering
  filterForm: FormGroup;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private activityLogService: ActivityLogService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      action: [''],
      entityType: [''],
      startDate: [null],
      endDate: [null]
    });
  }
  
  ngOnInit(): void {
    this.loadActivityLogs();
    
    // Subscribe to filter changes
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Auto-apply filters only when search is changed
        if (this.filterForm.get('search')?.dirty) {
          this.applyFilters();
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadActivityLogs(): void {
    this.loading = true;
    this.error = null;
    
    this.activityLogService.getAllActivityLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          this.activityLogs = logs;
          this.applyFiltersToLogs();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading activity logs:', err);
          this.error = 'Failed to load activity logs data. Please try again.';
          this.loading = false;
        }
      });
  }
  
  applyFiltersToLogs(): void {
    const { search, action, entityType, startDate, endDate } = this.filterForm.value;
    
    // Start with all logs
    let filtered = [...this.activityLogs];
    
    // Apply search filter to description or username
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(log => 
        (log.description && log.description.toLowerCase().includes(searchLower)) ||
        (log.userName && log.userName.toLowerCase().includes(searchLower)) ||
        (log.entityId && log.entityId.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply action filter
    if (action) {
      filtered = filtered.filter(log => log.action === action);
    }
    
    // Apply entity type filter
    if (entityType) {
      filtered = filtered.filter(log => log.entityType === entityType);
    }
    
    // Apply date range filter
    if (startDate) {
      const startDateTime = new Date(startDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= startDateTime);
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate).setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= endDateTime);
    }
    
    // Sort logs by timestamp (newest first)
    filtered = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    this.filteredLogs = filtered;
    this.updatePaginatedLogs();
  }
  
  updatePaginatedLogs(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);
  }
  
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedLogs();
  }
  
  getActivityDescription(log: ActivityLog): string {
    return log.description || `${log.action} ${log.entityType}`;
  }
  
  formatActivityTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getActivityIconClass(log: ActivityLog): string {
    const actionClasses: { [key: string]: string } = {
      'create': 'action-create',
      'update': 'action-update',
      'delete': 'action-delete'
    };
    
    return actionClasses[log.action] || '';
  }
  
  getActivityIcon(log: ActivityLog): string {
    const actionIcons: { [key: string]: string } = {
      'create': 'add_circle',
      'update': 'edit',
      'delete': 'delete'
    };
    
    const entityIcons: { [key: string]: string } = {
      'workOrder': 'engineering',
      'remark': 'comment',
      'issue': 'error',
      'material': 'inventory_2',
      'task': 'task_alt',
      'user': 'person',
      'system': 'settings'
    };
    
    // Return based on activity first, then entity type
    return actionIcons[log.action] || entityIcons[log.entityType] || 'info';
  }
  
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
  
  canNavigateToEntity(log: ActivityLog): boolean {
    // Determine if we can navigate to the entity details page
    switch(log.entityType) {
      case 'workOrder':
        return true;
      case 'remark':
        return !!(log.details && log.details.workOrderId);
      case 'issue':
      case 'material':
      case 'task':
        return !!(log.details && log.details.workOrderId);
      default:
        return false;
    }
  }
  
  navigateToEntity(log: ActivityLog): void {
    // Navigate to the appropriate entity page
    switch(log.entityType) {
      case 'workOrder':
        this.router.navigate(['/work-orders/details', log.entityId]);
        break;
      case 'remark':
      case 'issue':
      case 'material':
      case 'task':
        if (log.details && log.details.workOrderId) {
          this.router.navigate(['/work-orders/details', log.details.workOrderId]);
        }
        break;
      default:
        // No navigation for other entity types
        break;
    }
  }
  
  // New methods for enhanced UI functionality
  
  /**
   * Check if there are any active filters
   */
  hasActiveFilters(): boolean {
    const formValues = this.filterForm.value;
    return !!(formValues.search || formValues.action || formValues.entityType || 
      formValues.startDate || formValues.endDate);
  }
  
  /**
   * Get the count of active filters
   */
  getActiveFiltersCount(): number {
    const formValues = this.filterForm.value;
    let count = 0;
    
    if (formValues.search) count++;
    if (formValues.action) count++;
    if (formValues.entityType) count++;
    if (formValues.startDate || formValues.endDate) count++;
    
    return count;
  }
  
  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      action: '',
      entityType: '',
      startDate: null,
      endDate: null
    });
    
    this.applyFiltersToLogs();
    this.pageIndex = 0;
    this.updatePaginatedLogs();
  }
  
  /**
   * Get CSS class based on action type
   */
  getActionClass(log: ActivityLog): string {
    return `action-${log.action}`;
  }
  
  /**
   * Get the appropriate icon for the entity type
   */
  getEntityIcon(entityType: string): string {
    switch(entityType) {
      case 'workOrder': return 'engineering';
      case 'remark': return 'comment';
      case 'issue': return 'error';
      case 'material': return 'inventory_2';
      case 'task': return 'task_alt';
      case 'user': return 'person';
      default: return 'info';
    }
  }
  
  /**
   * Format detail values for display
   */
  formatDetailValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return this.formatActivityTimestamp(value);
    return String(value);
  }
  
  /**
   * Export logs as CSV
   */
  exportCsv(): void {
    // Implementation would go here
    console.log('Export as CSV');
  }
  
  /**
   * Export logs as PDF
   */
  exportPdf(): void {
    // Implementation would go here
    console.log('Export as PDF');
  }
  
  /**
   * Apply all filters and reset pagination
   */
  applyFilters(): void {
    this.applyFiltersToLogs();
    this.pageIndex = 0;
    this.updatePaginatedLogs();
  }

  // Navigate to previous page
  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePaginatedLogs();
    }
  }

  // Navigate to next page
  nextPage(): void {
    if (this.hasMoreLogs()) {
      this.pageIndex++;
      this.updatePaginatedLogs();
    }
  }

  // Check if there are more logs to display
  hasMoreLogs(): boolean {
    return (this.pageIndex + 1) * this.pageSize < this.filteredLogs.length;
  }
} 