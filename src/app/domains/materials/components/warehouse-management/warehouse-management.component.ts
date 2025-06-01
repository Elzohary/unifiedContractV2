import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Models and Services
import { WarehouseLocation } from '../../models/inventory.model';
import { MaterialInventoryViewModel } from '../../viewModels/material-inventory.viewmodel';

interface WarehouseWithStats extends WarehouseLocation {
  managerName: string;
  managerId: string;
  totalMaterials?: number;
  totalValue?: number;
  utilizationPercentage?: number;
}

@Component({
  selector: 'app-warehouse-management',
  templateUrl: './warehouse-management.component.html',
  styleUrls: ['./warehouse-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule
  ],
  providers: [MaterialInventoryViewModel]
})
export class WarehouseManagementComponent implements OnInit {
  warehouses: WarehouseWithStats[] = [];
  displayedColumns: string[] = ['name', 'type', 'address', 'manager', 'totalMaterials', 'utilization', 'actions'];

  // Form for adding/editing warehouse
  warehouseForm: FormGroup;
  isEditing = false;
  editingWarehouseId: string | null = null;

  warehouseTypes = [
    { value: 'main', label: 'Main Warehouse' },
    { value: 'satellite', label: 'Satellite Warehouse' },
    { value: 'site-storage', label: 'Site Storage' }
  ];

  constructor(
    private fb: FormBuilder,
    private viewModel: MaterialInventoryViewModel,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.warehouseForm = this.createWarehouseForm();
  }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  private createWarehouseForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', Validators.required],
      type: ['main', Validators.required],
      managerId: ['', Validators.required],
      managerName: ['', Validators.required]
    });
  }

  loadWarehouses(): void {
    this.viewModel.warehouses$.subscribe(warehouses => {
      // Enhance warehouses with mock statistics
      this.warehouses = warehouses.map(warehouse => ({
        ...warehouse,
        managerName: 'Manager Name',
        managerId: 'MGR-' + warehouse.id,
        totalMaterials: Math.floor(Math.random() * 500) + 100,
        totalValue: Math.floor(Math.random() * 1000000) + 100000,
        utilizationPercentage: Math.floor(Math.random() * 40) + 50
      }));
    });
  }

  addWarehouse(): void {
    this.isEditing = true;
    this.editingWarehouseId = null;
    this.warehouseForm.reset({
      type: 'main'
    });
  }

  editWarehouse(warehouse: WarehouseWithStats): void {
    this.isEditing = true;
    this.editingWarehouseId = warehouse.id;
    this.warehouseForm.patchValue({
      name: warehouse.name,
      address: warehouse.address,
      type: warehouse.type,
      managerId: warehouse.managerId,
      managerName: warehouse.managerName
    });
  }

  saveWarehouse(): void {
    if (this.warehouseForm.valid) {
      const warehouseData = this.warehouseForm.value;

      if (this.editingWarehouseId) {
        // Update existing warehouse
        const index = this.warehouses.findIndex(w => w.id === this.editingWarehouseId);
        if (index !== -1) {
          this.warehouses[index] = {
            ...this.warehouses[index],
            ...warehouseData
          };
          this.snackBar.open('Warehouse updated successfully', 'Close', { duration: 3000 });
        }
      } else {
        // Add new warehouse
        const newWarehouse: WarehouseWithStats = {
          id: `wh-${Date.now()}`,
          ...warehouseData,
          totalMaterials: 0,
          totalValue: 0,
          utilizationPercentage: 0
        };
        this.warehouses = [...this.warehouses, newWarehouse];
        this.snackBar.open('Warehouse added successfully', 'Close', { duration: 3000 });
      }

      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingWarehouseId = null;
    this.warehouseForm.reset();
  }

  deleteWarehouse(warehouse: WarehouseWithStats): void {
    if (confirm(`Are you sure you want to delete warehouse "${warehouse.name}"?`)) {
      this.warehouses = this.warehouses.filter(w => w.id !== warehouse.id);
      this.snackBar.open('Warehouse deleted successfully', 'Close', { duration: 3000 });
    }
  }

  viewWarehouseDetails(warehouse: WarehouseWithStats): void {
    // TODO: Navigate to warehouse details page
    console.log('View warehouse details:', warehouse.id, warehouse.name);
  }

  manageLocations(warehouse: WarehouseWithStats): void {
    // TODO: Open bin location management dialog
    this.snackBar.open(`Bin location management for ${warehouse.name} coming soon`, 'Close', { duration: 3000 });
  }

  getWarehouseTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'main': 'warehouse',
      'satellite': 'store',
      'site-storage': 'location_on'
    };
    return icons[type] || 'warehouse';
  }

  getUtilizationColor(percentage: number): string {
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(value);
  }
}
