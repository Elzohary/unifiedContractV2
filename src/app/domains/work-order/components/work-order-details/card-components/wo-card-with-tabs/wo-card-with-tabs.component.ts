import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkOrderService } from '../../../../services/work-order.service';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderRemark,
  WorkOrderIssue,
  Task
} from '../../../../models/work-order.model';

@Component({
  selector: 'app-wo-card-with-tabs',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule, 
    MatDividerModule, 
    MatProgressBarModule, 
    MatTabsModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './wo-card-with-tabs.component.html',
  styleUrl: './wo-card-with-tabs.component.scss'
})
export class WoCardWithTabsComponent  {

  public workOrder!: WorkOrder ;

  constructor(
    private workOrderService: WorkOrderService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}


}
