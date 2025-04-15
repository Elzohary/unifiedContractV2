import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AllWorkOrdersTableService } from '../../../features/dashboards/dashboard-management/services/all-work-orders-table.service';

@Component({
  selector: 'app-ng-table',
  imports: [
    MatTableModule
  ],
  templateUrl: './ng-table.component.html',
  styleUrl: './ng-table.component.scss'
})
export class NgTableComponent {

  displayedColumns: string[] = ['wo-id', 'wo-location', 'wo-type', 'wo-status'];
  dataSource : any;

  constructor(private workOrders : AllWorkOrdersTableService) {
    this.dataSource = new MatTableDataSource(this.workOrders.getAllWorkOrders());
  }

}
