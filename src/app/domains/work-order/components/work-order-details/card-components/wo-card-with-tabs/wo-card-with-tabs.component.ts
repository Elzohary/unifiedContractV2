import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatCheckboxModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './wo-card-with-tabs.component.html',
  styleUrls: [
    './wo-card-with-tabs.component.scss',
    '../../work-order-details.component.scss'
  ]
})
export class WoCardWithTabsComponent implements OnInit {
  @Input() cardTitle = 'Card Title';
  @Input() cardIcon = 'info';
  @Input() tasks: Task[] = [];
  @Input() workOrderId = '';
  @Input() loading = false;

  // Events
  @Output() addTask = new EventEmitter<void>();
  @Output() editTaskEvent = new EventEmitter<{index: number, task: Task}>();
  @Output() deleteTaskEvent = new EventEmitter<number>();
  @Output() toggleTaskStatusEvent = new EventEmitter<number>();

  public workOrder!: WorkOrder ;

  constructor(
    private workOrderService: WorkOrderService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialization logic here
  }

  openAddTaskDialog(): void {
    this.addTask.emit();
  }

  editTask(index: number, task: Task): void {
    this.editTaskEvent.emit({index, task});
  }

  deleteTask(index: number): void {
    this.deleteTaskEvent.emit(index);
  }

  toggleTaskStatus(index: number): void {
    this.toggleTaskStatusEvent.emit(index);
  }

  // Helper method to format dates for display
  formatDate(date?: string | Date): string {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  }
}
