import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// ViewModels and Services
import { MaterialInventoryViewModel, StockAlert } from '../../viewModels/material-inventory.viewmodel';
import { MaterialMovement } from '../../models/inventory.model';

@Component({
  selector: 'app-material-inventory-dashboard',
  templateUrl: './material-inventory-dashboard.component.html',
  styleUrls: ['./material-inventory-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  providers: [MaterialInventoryViewModel]
})
export class MaterialInventoryDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observable streams from ViewModel
  dashboardData$ = this.viewModel.dashboardData$;
  loading$ = this.viewModel.loading$;
  error$ = this.viewModel.error$;
  warehouses$ = this.viewModel.warehouses$;

  // Table columns for recent movements
  movementColumns: string[] = ['movementNumber', 'material', 'type', 'quantity', 'location', 'date', 'actions'];

  // Selected tab
  selectedTab = 0;

  constructor(
    private viewModel: MaterialInventoryViewModel,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to error messages
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigation methods
  navigateToInventoryList(): void {
    this.router.navigate(['/materials/inventory/list']);
  }

  navigateToWarehouses(): void {
    this.router.navigate(['/materials/warehouses']);
  }

  navigateToPurchaseOrders(): void {
    this.router.navigate(['/materials/purchase-orders']);
  }

  navigateToStockMovements(): void {
    this.router.navigate(['/materials/stock-movements']);
  }

  // Action methods
  createStockAdjustment(): void {
    // TODO: Open stock adjustment dialog
    this.snackBar.open('Stock adjustment dialog coming soon', 'Close', {
      duration: 3000
    });
  }

  createMaterialRequisition(): void {
    // TODO: Open material requisition dialog
    this.snackBar.open('Material requisition dialog coming soon', 'Close', {
      duration: 3000
    });
  }

  viewMovementDetails(movement: MaterialMovement): void {
    // TODO: Navigate to movement details or open dialog
    console.log('View movement details:', movement);
  }

  handleAlert(alert: StockAlert): void {
    switch (alert.type) {
      case 'low-stock':
        // Navigate to create purchase order
        this.router.navigate(['/materials/purchase-orders/new'], {
          queryParams: { materialId: alert.materialId }
        });
        break;
      case 'expiring':
        // Navigate to material details
        this.router.navigate(['/materials/inventory', alert.materialId]);
        break;
      default:
        console.log('Handle alert:', alert);
    }
  }

  dismissAlert(alert: StockAlert): void {
    // TODO: Implement alert dismissal
    console.log('Dismiss alert:', alert);
    this.snackBar.open('Alert dismissed', 'Close', {
      duration: 2000
    });
  }

  // Helper methods
  getMovementTypeIcon(type: MaterialMovement['movementType']): string {
    const icons: Record<MaterialMovement['movementType'], string> = {
      'receipt': 'add_circle',
      'issue': 'remove_circle',
      'transfer': 'swap_horiz',
      'return': 'undo',
      'write-off': 'cancel'
    };
    return icons[type] || 'help';
  }

  getMovementTypeColor(type: MaterialMovement['movementType']): string {
    const colors: Record<MaterialMovement['movementType'], string> = {
      'receipt': 'primary',
      'issue': 'accent',
      'transfer': 'primary',
      'return': 'warn',
      'write-off': 'warn'
    };
    return colors[type] || 'basic';
  }

  getAlertIcon(type: StockAlert['type']): string {
    const icons: Record<StockAlert['type'], string> = {
      'low-stock': 'inventory_2',
      'expiring': 'schedule',
      'overstock': 'inventory',
      'no-movement': 'trending_flat'
    };
    return icons[type] || 'warning';
  }

  getAlertSeverityColor(severity: StockAlert['severity']): string {
    const colors: Record<StockAlert['severity'], string> = {
      'low': 'primary',
      'medium': 'accent',
      'high': 'warn',
      'critical': 'warn'
    };
    return colors[severity] || 'basic';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(value);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Refresh data
  refreshDashboard(): void {
    this.viewModel.loadDashboardData();
    this.viewModel.loadRecentMovements();
  }
}
