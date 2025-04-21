import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { WorkOrderItemService } from '../../services/work-order-item.service';
import { Iitem } from '../../models/work-order-item.model';
import { WorkOrderItemEditDialogComponent } from '../../components/work-order-item-edit-dialog/work-order-item-edit-dialog.component';
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
    NgCardComponent
  ]
})
export class WorkOrderItemsListComponent implements OnInit, AfterViewInit {
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private workOrderItemService: WorkOrderItemService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.loadItems();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadItems(): void {
    this.workOrderItemService.getItems().subscribe(items => {
      this.dataSource.data = items;
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
    const dialogRef = this.dialog.open(WorkOrderItemEditDialogComponent, {
      width: '800px',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: {
        id: null,
        itemNumber: '',
        lineType: 'Construction',
        shortDescription: '',
        longDescription: '',
        UOM: '',
        currency: '',
        paymentType: '',
        managementArea: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workOrderItemService.createItem(result).subscribe(() => {
          this.loadItems();
        });
      }
    });
  }

  openEditDialog(item: Iitem): void {
    const dialogRef = this.dialog.open(WorkOrderItemEditDialogComponent, {
      width: '800px',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: { ...item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workOrderItemService.updateItem(result.id, result).subscribe(() => {
          this.loadItems();
        });
      }
    });
  }
}
