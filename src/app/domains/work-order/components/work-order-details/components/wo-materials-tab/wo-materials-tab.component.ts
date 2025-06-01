import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Models and ViewModels
import { materialAssignment } from '../../../../models/work-order.model';
import { WorkOrderMaterialsViewModel } from '../../../../viewModels/work-order-materials.viewmodel';

// Dialogs
import { MaterialAssignmentDialogComponent } from '../material-assignment-dialog/material-assignment-dialog.component';
import { MaterialDeliveryDialogComponent } from '../material-delivery-dialog/material-delivery-dialog.component';
import { MaterialUsageDialogComponent } from '../material-usage-dialog/material-usage-dialog.component';
import { MaterialEditDialogComponent } from '../material-edit-dialog/material-edit-dialog.component';
import { MaterialHistoryDialogComponent } from '../material-history-dialog/material-history-dialog.component';

@Component({
  selector: 'app-wo-materials-tab',
  templateUrl: './wo-materials-tab.component.html',
  styleUrls: ['./wo-materials-tab.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class WoMaterialsTabComponent implements OnInit {
  @Input() workOrderId!: string;
  @Input() workOrderClient!: string;
  
  materials$: Observable<materialAssignment[]>;
  purchasableMaterials$: Observable<materialAssignment[]>;
  receivableMaterials$: Observable<materialAssignment[]>;
  loading$: Observable<boolean>;
  totalMaterialsCost$: Observable<number>;
  availableMaterials$: Observable<any[]>;
  
  // Table columns
  purchasableColumns = ['name', 'quantity', 'unit', 'unitCost', 'totalCost', 'status', 'supplier', 'actions'];
  receivableColumns = ['name', 'estimatedQuantity', 'receivedQuantity', 'usedQuantity', 'unit', 'status', 'actions'];
  
  constructor(
    private materialsViewModel: WorkOrderMaterialsViewModel,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.materials$ = this.materialsViewModel.materials$;
    this.purchasableMaterials$ = this.materialsViewModel.purchasableMaterials$;
    this.receivableMaterials$ = this.materialsViewModel.receivableMaterials$;
    this.loading$ = this.materialsViewModel.loading$;
    this.totalMaterialsCost$ = this.materialsViewModel.totalMaterialsCost$;
    this.availableMaterials$ = this.materialsViewModel.availableMaterials$;
  }
  
  ngOnInit(): void {
    this.materialsViewModel.loadMaterialsForWorkOrder(this.workOrderId);
  }
  
  openAssignMaterialDialog(): void {
    // Get available materials first
    this.materialsViewModel.availableMaterials$.pipe(
      take(1)
    ).subscribe(materials => {
      const dialogRef = this.dialog.open(MaterialAssignmentDialogComponent, {
        width: '1100px',
        height: '85vh',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: {
          workOrderId: this.workOrderId,
          availableMaterials: materials,
          materialsViewModel: this.materialsViewModel,
          workOrderClient: this.workOrderClient
        }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.materialsViewModel.assignMaterial(result).subscribe(success => {
            if (success) {
              this.snackBar.open('Material assigned successfully', 'Close', { duration: 3000 });
            } else {
              this.snackBar.open('Failed to assign material', 'Close', { duration: 3000 });
            }
          });
        }
      });
    });
  }
  
  editMaterial(material: materialAssignment): void {
    const dialogRef = this.dialog.open(MaterialEditDialogComponent, {
      width: '900px',
      height: '80vh',
      maxHeight: '90vh',
      data: {
        material: material,
        workOrderId: this.workOrderId
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.materialsViewModel.updateMaterialAssignment(material.id, result).subscribe(success => {
          if (success) {
            this.snackBar.open('Material updated successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to update material', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  markAsDelivered(material: materialAssignment): void {
    const dialogRef = this.dialog.open(MaterialDeliveryDialogComponent, {
      width: '1000px',
      height: '85vh',
      maxHeight: '90vh',
      data: { material }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the material with delivery information
        const updates = {
          ...material,
          purchasableMaterial: {
            ...material.purchasableMaterial!,
            ...result
          }
        };
        
        this.materialsViewModel.updateMaterialAssignment(material.id, updates).subscribe(success => {
          if (success) {
            this.snackBar.open('Material marked as delivered successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to update material delivery status', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  issueToSite(material: materialAssignment): void {
    const dialogRef = this.dialog.open(MaterialUsageDialogComponent, {
      width: '900px',
      height: '80vh',
      maxHeight: '90vh',
      data: { 
        material,
        workOrderId: this.workOrderId,
        action: 'issue-to-site'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the material with site usage information
        const updates = {
          ...material,
          purchasableMaterial: {
            ...material.purchasableMaterial!,
            ...result
          }
        };
        
        this.materialsViewModel.updateMaterialAssignment(material.id, updates).subscribe(success => {
          if (success) {
            this.snackBar.open('Material issued to site successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to issue material to site', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  updateUsage(material: materialAssignment): void {
    const dialogRef = this.dialog.open(MaterialUsageDialogComponent, {
      width: '900px',
      height: '80vh',
      maxHeight: '90vh',
      data: {
        material: material,
        workOrderId: this.workOrderId,
        action: 'update-usage'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the material with usage information
        let updates: any;
        
        if (material.materialType === 'receivable' && result.receivableMaterial) {
          // Handle receivable material updates
          updates = {
            ...material,
            receivableMaterial: {
              ...material.receivableMaterial!,
              ...result.receivableMaterial
            }
          };
        } else if (material.materialType === 'purchasable') {
          // Handle purchasable material updates
          updates = {
            ...material,
            purchasableMaterial: {
              ...material.purchasableMaterial!,
              ...result
            }
          };
        }
        
        this.materialsViewModel.updateMaterialAssignment(material.id, updates).subscribe(success => {
          if (success) {
            this.snackBar.open('Material usage updated successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to update material usage', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  updateMaterialStatus(material: materialAssignment, newStatus: string): void {
    // For certain status transitions, open specific dialogs
    if (newStatus === 'delivered' && material.purchasableMaterial?.status === 'ordered') {
      this.markAsDelivered(material);
      return;
    }
    
    if (newStatus === 'in-use' && material.purchasableMaterial?.status === 'delivered') {
      this.issueToSite(material);
      return;
    }
    
    if (newStatus === 'used' && material.purchasableMaterial?.status === 'in-use') {
      this.updateUsage(material);
      return;
    }
    
    // For receivable materials being marked as received, ask for quantity
    if (newStatus === 'received' && material.receivableMaterial?.status === 'pending') {
      const estimatedQty = material.receivableMaterial.estimatedQuantity;
      const unit = material.receivableMaterial.unit;
      const receivedQty = prompt(`Enter the actual quantity received (Estimated: ${estimatedQty} ${unit}):`);
      
      if (receivedQty === null) return; // User cancelled
      
      const quantity = parseFloat(receivedQty);
      if (isNaN(quantity) || quantity < 0) {
        this.snackBar.open('Please enter a valid quantity', 'Close', { duration: 3000 });
        return;
      }
      
      const updates: any = {
        ...material,
        receivableMaterial: {
          ...material.receivableMaterial,
          status: 'received',
          receivedQuantity: quantity,
          remainingQuantity: quantity,
          receivedDate: new Date().toISOString()
        }
      };
      
      this.materialsViewModel.updateMaterialAssignment(material.id, updates).subscribe(success => {
        if (success) {
          this.snackBar.open('Material marked as received successfully', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to update material status', 'Close', { duration: 3000 });
        }
      });
      return;
    }
    
    // For other status changes, update directly based on material type
    let updates: any;
    if (material.materialType === 'receivable') {
      updates = {
        ...material,
        receivableMaterial: {
          ...material.receivableMaterial!,
          status: newStatus
        }
      };
    } else {
      updates = {
        ...material,
        purchasableMaterial: {
          ...material.purchasableMaterial!,
          status: newStatus
        }
      };
    }
    
    this.materialsViewModel.updateMaterialAssignment(material.id, updates).subscribe(success => {
      if (success) {
        this.snackBar.open('Material status updated successfully', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Failed to update material status', 'Close', { duration: 3000 });
      }
    });
  }
  
  removeMaterial(material: materialAssignment): void {
    const materialName = material.purchasableMaterial?.name || material.receivableMaterial?.name || 'this material';
    if (confirm(`Are you sure you want to remove ${materialName}?`)) {
      this.materialsViewModel.removeMaterialAssignment(material.id).subscribe(success => {
        if (success) {
          this.snackBar.open('Material removed successfully', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to remove material', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  onFilterChange(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.materialsViewModel.updateFilters({ searchTerm: filterValue });
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'ordered': return 'accent';
      case 'received': return 'primary';
      case 'used': return 'primary';
      case 'delivered': return 'primary';
      default: return '';
    }
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-SA', { 
      style: 'currency', 
      currency: 'SAR' 
    }).format(amount);
  }
  
  formatDate(date: string | Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  viewHistory(material: materialAssignment): void {
    this.dialog.open(MaterialHistoryDialogComponent, {
      width: '1400px',
      height: '90vh',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'material-history-dialog-panel',
      data: {
        material: material,
        workOrderId: this.workOrderId
      }
    });
  }
} 