import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseMaterial, ClientType, MaterialType } from '../../models/material.model';
import { MaterialViewModel } from '../../viewModels/material.viewmodel';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialDialogComponent } from '../material-dialog/material-dialog.component';

@Component({
  selector: 'app-materials-management',
  templateUrl: './materials-management.component.html',
  styleUrls: ['./materials-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialDialogComponent
  ]
})
export class MaterialsManagementComponent implements OnInit {
  // Materials data
  materials$: Observable<BaseMaterial[]>;
  loading$: Observable<boolean>;

  // Enums for template
  materialTypes = MaterialType;
  clientTypes = ClientType;

  // Table columns
  displayedColumns: string[] = ['code', 'description', 'unit', 'materialType', 'clientType', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private materialViewModel: MaterialViewModel,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.materials$ = this.materialViewModel.filteredMaterials$;
    this.loading$ = this.materialViewModel.loading$;
  }

  ngOnInit(): void {
    // Load all materials initially
    this.materialViewModel.loadMaterials();
  }

  onFilterByMaterialType(materialType: MaterialType): void {
    this.materialViewModel.updateFilters({ materialType });
  }

  onFilterByClientType(clientType: ClientType): void {
    this.materialViewModel.updateFilters({ clientType });
    // Optionally reload from server with specific client type
    this.materialViewModel.loadMaterials(clientType);
  }

  onSearch(searchTerm: string): void {
    this.materialViewModel.updateFilters({ searchTerm });
  }

  onResetFilters(): void {
    this.materialViewModel.resetFilters();
  }

  onAddMaterial(): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      data: { isEdit: false },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.materialViewModel.addMaterial(result).subscribe({
          next: (newMaterial) => {
            this.showNotification(`Material "${newMaterial.description}" was added successfully`);
          },
          error: (error) => {
            this.showNotification('Failed to add material. Please try again.', true);
            console.error('Error adding material:', error);
          }
        });
      }
    });
  }

  onEditMaterial(material: BaseMaterial): void {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      data: { material, isEdit: true },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.materialViewModel.updateMaterial(result).subscribe({
          next: (updatedMaterial) => {
            this.showNotification(`Material "${updatedMaterial.description}" was updated successfully`);
          },
          error: (error) => {
            this.showNotification('Failed to update material. Please try again.', true);
            console.error('Error updating material:', error);
          }
        });
      }
    });
  }

  onDeleteMaterial(material: BaseMaterial): void {
    // In a real application, you would show a confirmation dialog first
    if (confirm(`Are you sure you want to delete ${material.description}?`)) {
      if (material.id) {
        this.materialViewModel.deleteMaterial(material.id).subscribe({
          next: (success) => {
            if (success) {
              this.showNotification(`Material "${material.description}" was deleted successfully`);
            } else {
              this.showNotification('Failed to delete material. Please try again.', true);
            }
          },
          error: (error) => {
            this.showNotification('Failed to delete material. Please try again.', true);
            console.error('Error deleting material:', error);
          }
        });
      } else {
        this.showNotification('Cannot delete material without an ID', true);
      }
    }
  }

  onViewDetails(material: BaseMaterial): void {
    console.log('View details clicked', material);
    // Here you would normally navigate to a details page or open a details modal
  }

  private showNotification(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}
