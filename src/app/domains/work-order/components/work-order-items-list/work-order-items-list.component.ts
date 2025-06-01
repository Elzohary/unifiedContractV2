import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { finalize, catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { WorkOrderItemService } from '../../services/work-order-item.service';
import { Iitem } from '../../models/work-order-item.model';
import { WorkOrderItemDialogComponent } from '../work-order-item-dialog/work-order-item-dialog.component';
import { NgCardComponent } from '../../../../shared/components/ng-card/ng-card.component';

@Component({
  selector: 'app-work-order-items-list',
  templateUrl: './work-order-items-list.component.html',
  styleUrls: ['./work-order-items-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NgCardComponent
  ]
})
export class WorkOrderItemsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() workOrderId!: string;
  @Output() itemsUpdated = new EventEmitter<Iitem[]>();

  displayedColumns: string[] = [
    'itemNumber',
    'shortDescription',
    'longDescription',
    'UOM',
    'currency',
    'paymentType',
    'managementArea',
    'actions'
  ];

  dataSource: MatTableDataSource<Iitem>;
  isLoading = false;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private workOrderItemService: WorkOrderItemService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    // Subscribe to the items$ observable from the service
    this.loadItems();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItems(): void {
    this.isLoading = true;
    this.workOrderItemService.items$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false),
        catchError(error => {
          this.showErrorMessage('Failed to load items. Please try again.');
          console.error('Error loading items:', error);
          return EMPTY;
        })
      )
      .subscribe(items => {
        this.dataSource.data = items;
        this.isLoading = false
        // Ensure table refreshes
        this.dataSource._updateChangeSubscription();
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddDialog(): void {
    const emptyItem: Iitem = {
      id: '',
      itemNumber: '',
      lineType: 'Description',
      shortDescription: '',
      longDescription: '',
      UOM: '',
      currency: '',
      paymentType: '',
      managementArea: '',
      unitPrice: 0
    };

    const dialogRef = this.dialog.open(WorkOrderItemDialogComponent, {
      width: '800px',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: {
        item: emptyItem,
        dialogMode: 'create',
        title: 'Create New Work Order Item'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optimistic UI update - add temporary item with loading state
        const tempId = 'temp-' + new Date().getTime();
        const tempItem: Iitem = { ...result, id: tempId };

        // Add to current data and update view
        const currentData = [...this.dataSource.data];
        currentData.unshift(tempItem);
        this.dataSource.data = currentData;

        // Make actual API call
        this.workOrderItemService.createItem(result)
          .pipe(
            catchError(error => {
              // Remove temporary item on error
              this.removeItemById(tempId);
              this.showErrorMessage('Failed to create item. Please try again.');
              console.error('Error creating item:', error);
              return EMPTY;
            })
          )
          .subscribe(createdItem => {
            // Replace temp item with actual item
            this.removeItemById(tempId);
            this.dataSource.data = [createdItem, ...this.dataSource.data];
            this.showSuccessMessage('Item created successfully');
          });
      }
    });
  }

  openEditDialog(item: Iitem): void {
    const dialogRef = this.dialog.open(WorkOrderItemDialogComponent, {
      width: '800px',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: {
        item: { ...item },
        dialogMode: 'edit',
        title: `Edit Work Order Item #${item.itemNumber}`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optimistic UI update - update item immediately
        const updatedItems = this.dataSource.data.map(i =>
          i.id === result.id ? { ...result } : i
        );
        this.dataSource.data = updatedItems;

        // Make actual API call
        this.workOrderItemService.updateItem(result.id, result)
          .pipe(
            catchError(error => {
              // Revert to original item on error
              this.loadItems(); // Reload all data to ensure consistency
              this.showErrorMessage('Failed to update item. Please try again.');
              console.error('Error updating item:', error);
              return EMPTY;
            })
          )
          .subscribe(() => {
            this.showSuccessMessage('Item updated successfully');
          });
      }
    });
  }

  // Confirm delete with the user
  confirmDelete(item: Iitem): void {
    if (confirm(`Are you sure you want to delete item "${item.shortDescription}"?`)) {
      this.deleteItem(item);
    }
  }

  // Delete the item and update the table
  deleteItem(item: Iitem): void {
    // First remove from UI immediately for better UX
    const currentData = this.dataSource.data.filter(i => i.id !== item.id);
    this.dataSource.data = currentData;

    // Then actually delete from the backend
    this.workOrderItemService.deleteItem(item.id)
      .pipe(
        catchError(error => {
          // If deletion fails, reload the original data
          this.loadItems();
          this.showErrorMessage('Failed to delete item. Please try again.');
          console.error('Error deleting item:', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.showSuccessMessage('Item deleted successfully');
      });
  }

  private removeItemById(id: string): void {
    const currentData = this.dataSource.data.filter(item => item.id !== id);
    this.dataSource.data = currentData;
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'success-snackbar'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'error-snackbar'
    });
  }

  // Method to emit updated items
  updateItems(items: Iitem[]): void {
    this.itemsUpdated.emit(items);
  }
}
