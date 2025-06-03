import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, BehaviorSubject, combineLatest, of } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Services and Models
import { MaterialManagementService } from '../../services/material-management.service';
import { MaterialService } from '../../services/material.service';
import { BaseMaterial } from '../../models/material.model';
import { MaterialRequisitionDialogComponent } from '../dialogs/material-requisition-dialog/material-requisition-dialog.component';

export interface WorkOrderMaterialSummary {
  workOrderId: string;
  workOrderNumber: string;
  workOrderTitle: string;
  status: string;
  totalMaterials: number;
  assignedMaterials: number;
  deliveredMaterials: number;
  usedMaterials: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  completionPercentage: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

export interface MaterialAllocationSummary {
  materialId: string;
  materialCode: string;
  materialDescription: string;
  totalAllocated: number;
  totalUsed: number;
  totalRemaining: number;
  allocatedToWorkOrders: number;
  pendingDeliveries: number;
  unit: string;
  estimatedValue: number;
  actualValue: number;
}

@Component({
  selector: 'app-work-order-material-hub',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="work-order-material-hub">
      <!-- Header Section -->
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>engineering</mat-icon>
            Work Order Material Management Hub
          </mat-card-title>
          <mat-card-subtitle>
            Central hub for managing materials across all work orders
          </mat-card-subtitle>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createMaterialRequisition()">
              <mat-icon>assignment</mat-icon>
              New Requisition
            </button>
            <button mat-stroked-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
        </mat-card-header>
      </mat-card>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon primary">assignment</mat-icon>
              <div class="summary-details">
                <div class="summary-value">{{totalWorkOrders}}</div>
                <div class="summary-label">Active Work Orders</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon accent">inventory_2</mat-icon>
              <div class="summary-details">
                <div class="summary-value">{{totalMaterialsAllocated}}</div>
                <div class="summary-label">Materials Allocated</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon warn">local_shipping</mat-icon>
              <div class="summary-details">
                <div class="summary-value">{{pendingDeliveries}}</div>
                <div class="summary-label">Pending Deliveries</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <mat-icon class="summary-icon success">attach_money</mat-icon>
              <div class="summary-details">
                <div class="summary-value">{{totalValue | currency}}</div>
                <div class="summary-label">Total Value</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content Tabs -->
      <mat-card class="content-card">
        <mat-tab-group [(selectedIndex)]="selectedTab" class="main-tabs">
          <!-- Work Orders Tab -->
          <mat-tab label="Work Orders">
            <div class="tab-content">
              <!-- Filters -->
              <div class="filters-section">
                <mat-form-field appearance="outline">
                  <mat-label>Search</mat-label>
                  <input matInput 
                         [(ngModel)]="workOrderSearchTerm"
                         placeholder="Search by work order number or title...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="selectedStatus">
                    <mat-option value="">All Statuses</mat-option>
                    <mat-option value="active">Active</mat-option>
                    <mat-option value="pending">Pending</mat-option>
                    <mat-option value="completed">Completed</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Urgency</mat-label>
                  <mat-select [(ngModel)]="selectedUrgency">
                    <mat-option value="">All Urgencies</mat-option>
                    <mat-option value="critical">Critical</mat-option>
                    <mat-option value="high">High</mat-option>
                    <mat-option value="medium">Medium</mat-option>
                    <mat-option value="low">Low</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Work Orders Table -->
              <div class="table-container">
                <table mat-table [dataSource]="(filteredWorkOrders$ | async) || []" class="work-orders-table">
                  <ng-container matColumnDef="workOrder">
                    <th mat-header-cell *matHeaderCellDef>Work Order</th>
                    <td mat-cell *matCellDef="let wo">
                      <div class="work-order-cell">
                        <span class="wo-number">{{wo.workOrderNumber}}</span>
                        <span class="wo-title">{{wo.workOrderTitle}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let wo">
                      <mat-chip [class]="'status-' + wo.status">{{wo.status | titlecase}}</mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="materials">
                    <th mat-header-cell *matHeaderCellDef>Materials</th>
                    <td mat-cell *matCellDef="let wo">
                      <div class="materials-cell">
                        <span class="materials-count">{{wo.assignedMaterials}}/{{wo.totalMaterials}}</span>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="(wo.assignedMaterials / wo.totalMaterials) * 100"
                          class="materials-progress">
                        </mat-progress-bar>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="completion">
                    <th mat-header-cell *matHeaderCellDef>Completion</th>
                    <td mat-cell *matCellDef="let wo">
                      <div class="completion-cell">
                        <span class="completion-percentage">{{wo.completionPercentage}}%</span>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="wo.completionPercentage"
                          [color]="wo.completionPercentage < 50 ? 'warn' : 'primary'">
                        </mat-progress-bar>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="cost">
                    <th mat-header-cell *matHeaderCellDef>Cost</th>
                    <td mat-cell *matCellDef="let wo">
                      <div class="cost-cell">
                        <span class="estimated-cost">Est: {{wo.totalEstimatedCost | currency}}</span>
                        <span class="actual-cost">Act: {{wo.totalActualCost | currency}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="urgency">
                    <th mat-header-cell *matHeaderCellDef>Urgency</th>
                    <td mat-cell *matCellDef="let wo">
                      <mat-chip [class]="'urgency-' + wo.urgency">{{wo.urgency | titlecase}}</mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let wo">
                      <button mat-icon-button [matMenuTriggerFor]="woMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #woMenu="matMenu">
                        <button mat-menu-item (click)="viewWorkOrderMaterials(wo)">
                          <mat-icon>visibility</mat-icon>
                          <span>View Materials</span>
                        </button>
                        <button mat-menu-item (click)="requestMaterialsForWorkOrder(wo)">
                          <mat-icon>add_shopping_cart</mat-icon>
                          <span>Request Materials</span>
                        </button>
                        <button mat-menu-item (click)="optimizeMaterials(wo)">
                          <mat-icon>auto_fix_high</mat-icon>
                          <span>Optimize Materials</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="workOrderColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: workOrderColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Material Allocations Tab -->
          <mat-tab label="Material Allocations">
            <div class="tab-content">
              <!-- Material Search -->
              <div class="filters-section">
                <mat-form-field appearance="outline">
                  <mat-label>Search Materials</mat-label>
                  <input matInput 
                         [(ngModel)]="materialSearchTerm"
                         placeholder="Search by material code or description...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Allocation Status</mat-label>
                  <mat-select [(ngModel)]="selectedAllocationStatus">
                    <mat-option value="">All</mat-option>
                    <mat-option value="over-allocated">Over Allocated</mat-option>
                    <mat-option value="under-allocated">Under Allocated</mat-option>
                    <mat-option value="optimal">Optimal</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Material Allocations Table -->
              <div class="table-container">
                <table mat-table [dataSource]="(filteredMaterialAllocations$ | async) || []" class="allocations-table">
                  <ng-container matColumnDef="material">
                    <th mat-header-cell *matHeaderCellDef>Material</th>
                    <td mat-cell *matCellDef="let allocation">
                      <div class="material-cell">
                        <span class="material-code">{{allocation.materialCode}}</span>
                        <span class="material-description">{{allocation.materialDescription}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="allocation">
                    <th mat-header-cell *matHeaderCellDef>Allocation</th>
                    <td mat-cell *matCellDef="let allocation">
                      <div class="allocation-cell">
                        <span class="allocation-text">
                          {{allocation.totalUsed}}/{{allocation.totalAllocated}} {{allocation.unit}}
                        </span>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="(allocation.totalUsed / allocation.totalAllocated) * 100">
                        </mat-progress-bar>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="workOrders">
                    <th mat-header-cell *matHeaderCellDef>Work Orders</th>
                    <td mat-cell *matCellDef="let allocation">
                      <mat-chip class="work-orders-chip">
                        {{allocation.allocatedToWorkOrders}} WOs
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="value">
                    <th mat-header-cell *matHeaderCellDef>Value</th>
                    <td mat-cell *matCellDef="let allocation">
                      <div class="value-cell">
                        <span class="estimated-value">Est: {{allocation.estimatedValue | currency}}</span>
                        <span class="actual-value">Act: {{allocation.actualValue | currency}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let allocation">
                      <mat-chip [class]="getAllocationStatusClass(allocation)">
                        {{getAllocationStatus(allocation)}}
                      </mat-chip>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let allocation">
                      <button mat-icon-button [matMenuTriggerFor]="materialMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #materialMenu="matMenu">
                        <button mat-menu-item (click)="viewMaterialDetails(allocation)">
                          <mat-icon>info</mat-icon>
                          <span>View Details</span>
                        </button>
                        <button mat-menu-item (click)="reallocateMaterial(allocation)">
                          <mat-icon>swap_horiz</mat-icon>
                          <span>Reallocate</span>
                        </button>
                        <button mat-menu-item (click)="trackMaterialUsage(allocation)">
                          <mat-icon>timeline</mat-icon>
                          <span>Usage History</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="allocationColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: allocationColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Analytics Tab -->
          <mat-tab label="Analytics">
            <div class="tab-content">
              <div class="analytics-grid">
                <!-- Cost Analysis Card -->
                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Cost Analysis</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="analytics-content">
                      <div class="cost-metrics">
                        <div class="metric">
                          <span class="metric-label">Budget vs Actual</span>
                          <span class="metric-value">{{budgetVariance}}%</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Cost per Work Order</span>
                          <span class="metric-value">{{averageCostPerWorkOrder | currency}}</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Efficiency Card -->
                <mat-card class="analytics-card">
                  <mat-card-header>
                    <mat-card-title>Material Efficiency</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="analytics-content">
                      <div class="efficiency-metrics">
                        <div class="metric">
                          <span class="metric-label">Utilization Rate</span>
                          <span class="metric-value">{{utilizationRate}}%</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">Waste Percentage</span>
                          <span class="metric-value">{{wastePercentage}}%</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Trends Card -->
                <mat-card class="analytics-card full-width">
                  <mat-card-header>
                    <mat-card-title>Material Usage Trends</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="trends-placeholder">
                      <mat-icon>show_chart</mat-icon>
                      <p>Chart visualization would be implemented here</p>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .work-order-material-hub {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header-card .mat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .summary-card {
      min-height: 120px;
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .summary-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }

    .summary-icon.primary { color: #1976d2; }
    .summary-icon.accent { color: #ff4081; }
    .summary-icon.warn { color: #ff9800; }
    .summary-icon.success { color: #4caf50; }

    .summary-details {
      display: flex;
      flex-direction: column;
    }

    .summary-value {
      font-size: 24px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .summary-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }

    .content-card {
      flex: 1;
    }

    .main-tabs {
      min-height: 500px;
    }

    .tab-content {
      padding: 16px;
    }

    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filters-section mat-form-field {
      min-width: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    .work-orders-table,
    .allocations-table {
      width: 100%;
    }

    .work-order-cell,
    .material-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .wo-number,
    .material-code {
      font-weight: 500;
      color: #1976d2;
    }

    .wo-title,
    .material-description {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .materials-cell,
    .completion-cell,
    .allocation-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }

    .materials-count,
    .completion-percentage,
    .allocation-text {
      font-size: 12px;
      font-weight: 500;
    }

    .materials-progress,
    .completion-cell mat-progress-bar,
    .allocation-cell mat-progress-bar {
      height: 6px;
    }

    .cost-cell,
    .value-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .estimated-cost,
    .estimated-value {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .actual-cost,
    .actual-value {
      font-size: 12px;
      font-weight: 500;
    }

    .status-active { background-color: #e8f5e8; color: #2e7d32; }
    .status-pending { background-color: #fff3e0; color: #ef6c00; }
    .status-completed { background-color: #e3f2fd; color: #1976d2; }

    .urgency-low { background-color: #e8f5e8; color: #2e7d32; }
    .urgency-medium { background-color: #fff3e0; color: #ef6c00; }
    .urgency-high { background-color: #ffebee; color: #c62828; }
    .urgency-critical { background-color: #fce4ec; color: #ad1457; }

    .work-orders-chip {
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.87);
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .analytics-card.full-width {
      grid-column: 1 / -1;
    }

    .analytics-content {
      min-height: 120px;
    }

    .cost-metrics,
    .efficiency-metrics {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      color: rgba(0, 0, 0, 0.6);
    }

    .metric-value {
      font-weight: 500;
      font-size: 18px;
    }

    .trends-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: rgba(0, 0, 0, 0.6);
    }

    .trends-placeholder mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .filters-section {
        flex-direction: column;
      }

      .filters-section mat-form-field {
        min-width: unset;
        width: 100%;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WorkOrderMaterialHubComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data Sources
  private workOrdersSubject = new BehaviorSubject<WorkOrderMaterialSummary[]>([]);
  private materialAllocationsSubject = new BehaviorSubject<MaterialAllocationSummary[]>([]);
  
  // Filter States
  workOrderSearchTerm = '';
  selectedStatus = '';
  selectedUrgency = '';
  materialSearchTerm = '';
  selectedAllocationStatus = '';
  selectedTab = 0;

  // Summary Data
  totalWorkOrders = 0;
  totalMaterialsAllocated = 0;
  pendingDeliveries = 0;
  totalValue = 0;
  budgetVariance = 0;
  averageCostPerWorkOrder = 0;
  utilizationRate = 0;
  wastePercentage = 0;

  // Table Columns
  workOrderColumns = ['workOrder', 'status', 'materials', 'completion', 'cost', 'urgency', 'actions'];
  allocationColumns = ['material', 'allocation', 'workOrders', 'value', 'status', 'actions'];

  // Filtered Data
  filteredWorkOrders$: Observable<WorkOrderMaterialSummary[]> = of([]);
  filteredMaterialAllocations$: Observable<MaterialAllocationSummary[]> = of([]);

  constructor(
    private materialManagementService: MaterialManagementService,
    private materialService: MaterialService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.initializeFilteredData();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupDataSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilteredData(): void {
    this.filteredWorkOrders$ = combineLatest([
      this.workOrdersSubject.asObservable(),
      new BehaviorSubject(this.workOrderSearchTerm).pipe(startWith('')),
      new BehaviorSubject(this.selectedStatus).pipe(startWith('')),
      new BehaviorSubject(this.selectedUrgency).pipe(startWith(''))
    ]).pipe(
      map(([workOrders, searchTerm, status, urgency]) => 
        this.filterWorkOrders(workOrders, searchTerm, status, urgency)
      )
    );

    this.filteredMaterialAllocations$ = combineLatest([
      this.materialAllocationsSubject.asObservable(),
      new BehaviorSubject(this.materialSearchTerm).pipe(startWith('')),
      new BehaviorSubject(this.selectedAllocationStatus).pipe(startWith(''))
    ]).pipe(
      map(([allocations, searchTerm, status]) => 
        this.filterMaterialAllocations(allocations, searchTerm, status)
      )
    );
  }

  private setupDataSubscriptions(): void {
    // Subscribe to management service data
    this.materialManagementService.dashboardData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.updateSummaryData(data);
        }
      });
  }

  private loadData(): void {
    // Load mock data - in real implementation, this would call actual services
    this.loadMockWorkOrders();
    this.loadMockMaterialAllocations();
    this.calculateAnalytics();
  }

  private loadMockWorkOrders(): void {
    const mockWorkOrders: WorkOrderMaterialSummary[] = [
      {
        workOrderId: 'wo-001',
        workOrderNumber: 'WO-2024-001',
        workOrderTitle: 'Road Maintenance - Main Street',
        status: 'active',
        totalMaterials: 15,
        assignedMaterials: 12,
        deliveredMaterials: 8,
        usedMaterials: 5,
        totalEstimatedCost: 45000,
        totalActualCost: 42000,
        completionPercentage: 65,
        urgency: 'high',
        lastUpdated: new Date()
      },
      {
        workOrderId: 'wo-002',
        workOrderNumber: 'WO-2024-002',
        workOrderTitle: 'Utility Installation - Phase 2',
        status: 'pending',
        totalMaterials: 8,
        assignedMaterials: 6,
        deliveredMaterials: 3,
        usedMaterials: 1,
        totalEstimatedCost: 28000,
        totalActualCost: 15000,
        completionPercentage: 25,
        urgency: 'medium',
        lastUpdated: new Date()
      }
    ];

    this.workOrdersSubject.next(mockWorkOrders);
    this.totalWorkOrders = mockWorkOrders.length;
  }

  private loadMockMaterialAllocations(): void {
    const mockAllocations: MaterialAllocationSummary[] = [
      {
        materialId: 'mat-001',
        materialCode: 'CONC-001',
        materialDescription: 'Ready Mix Concrete Grade 30',
        totalAllocated: 500,
        totalUsed: 350,
        totalRemaining: 150,
        allocatedToWorkOrders: 3,
        pendingDeliveries: 2,
        unit: 'm³',
        estimatedValue: 75000,
        actualValue: 68000
      },
      {
        materialId: 'mat-002',
        materialCode: 'STEEL-002',
        materialDescription: 'Reinforcement Steel Bar 16mm',
        totalAllocated: 2000,
        totalUsed: 1500,
        totalRemaining: 500,
        allocatedToWorkOrders: 5,
        pendingDeliveries: 1,
        unit: 'kg',
        estimatedValue: 45000,
        actualValue: 43500
      }
    ];

    this.materialAllocationsSubject.next(mockAllocations);
    this.totalMaterialsAllocated = mockAllocations.reduce((sum, alloc) => sum + alloc.totalAllocated, 0);
    this.pendingDeliveries = mockAllocations.reduce((sum, alloc) => sum + alloc.pendingDeliveries, 0);
    this.totalValue = mockAllocations.reduce((sum, alloc) => sum + alloc.actualValue, 0);
  }

  private calculateAnalytics(): void {
    // Mock analytics calculations
    this.budgetVariance = -8.5; // 8.5% under budget
    this.averageCostPerWorkOrder = 36500;
    this.utilizationRate = 87.5;
    this.wastePercentage = 3.2;
  }

  private updateSummaryData(data: any): void {
    // Update summary cards with real data when available
  }

  private filterWorkOrders(
    workOrders: WorkOrderMaterialSummary[], 
    searchTerm: string, 
    status: string, 
    urgency: string
  ): WorkOrderMaterialSummary[] {
    return workOrders.filter(wo => {
      const matchesSearch = !searchTerm || 
        wo.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.workOrderTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !status || wo.status === status;
      const matchesUrgency = !urgency || wo.urgency === urgency;

      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }

  private filterMaterialAllocations(
    allocations: MaterialAllocationSummary[], 
    searchTerm: string, 
    status: string
  ): MaterialAllocationSummary[] {
    return allocations.filter(alloc => {
      const matchesSearch = !searchTerm || 
        alloc.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alloc.materialDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const allocationStatus = this.getAllocationStatus(alloc);
      const matchesStatus = !status || allocationStatus.toLowerCase().includes(status.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }

  getAllocationStatus(allocation: MaterialAllocationSummary): string {
    const usagePercentage = (allocation.totalUsed / allocation.totalAllocated) * 100;
    
    if (usagePercentage > 95) return 'Over Allocated';
    if (usagePercentage < 60) return 'Under Allocated';
    return 'Optimal';
  }

  getAllocationStatusClass(allocation: MaterialAllocationSummary): string {
    const status = this.getAllocationStatus(allocation);
    return `allocation-${status.toLowerCase().replace(' ', '-')}`;
  }

  // Action Methods
  createMaterialRequisition(): void {
    this.materialService.materials$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(materials => {
      const dialogRef = this.dialog.open(MaterialRequisitionDialogComponent, {
        width: '1000px',
        maxWidth: '95vw',
        height: '90vh',
        data: {
          availableMaterials: materials,
          requestType: 'general'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.materialManagementService.processRequisition(result).subscribe({
            next: (requisition) => {
              this.snackBar.open(
                `Requisition ${requisition.requestNumber} created successfully`, 
                'Close', 
                { duration: 3000, panelClass: ['success-snackbar'] }
              );
              this.refreshData();
            },
            error: (error) => {
              this.snackBar.open(
                `Failed to create requisition: ${error.message}`, 
                'Close', 
                { duration: 5000, panelClass: ['error-snackbar'] }
              );
            }
          });
        }
      });
    });
  }

  refreshData(): void {
    this.loadData();
    this.materialManagementService.loadDashboardData().subscribe();
  }

  // Work Order Actions
  viewWorkOrderMaterials(workOrder: WorkOrderMaterialSummary): void {
    this.router.navigate(['/work-orders', workOrder.workOrderId, 'materials']);
  }

  requestMaterialsForWorkOrder(workOrder: WorkOrderMaterialSummary): void {
    this.materialService.materials$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(materials => {
      const dialogRef = this.dialog.open(MaterialRequisitionDialogComponent, {
        width: '1000px',
        maxWidth: '95vw',
        height: '90vh',
        data: {
          availableMaterials: materials,
          requestType: 'work-order',
          workOrderId: workOrder.workOrderId,
          workOrderNumber: workOrder.workOrderNumber
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.materialManagementService.processRequisition(result).subscribe({
            next: (requisition) => {
              this.snackBar.open(
                `Materials requested for ${workOrder.workOrderNumber}`, 
                'Close', 
                { duration: 3000, panelClass: ['success-snackbar'] }
              );
              this.refreshData();
            },
            error: (error) => {
              this.snackBar.open(
                `Failed to request materials: ${error.message}`, 
                'Close', 
                { duration: 5000, panelClass: ['error-snackbar'] }
              );
            }
          });
        }
      });
    });
  }

  optimizeMaterials(workOrder: WorkOrderMaterialSummary): void {
    // Placeholder for material optimization logic
    this.snackBar.open('Material optimization feature coming soon', 'Close', { duration: 3000 });
  }

  // Material Actions
  viewMaterialDetails(allocation: MaterialAllocationSummary): void {
    this.router.navigate(['/materials/details', allocation.materialId]);
  }

  reallocateMaterial(allocation: MaterialAllocationSummary): void {
    // Placeholder for reallocation logic
    this.snackBar.open('Material reallocation feature coming soon', 'Close', { duration: 3000 });
  }

  trackMaterialUsage(allocation: MaterialAllocationSummary): void {
    this.router.navigate(['/materials/usage-tracking', allocation.materialId]);
  }
} 