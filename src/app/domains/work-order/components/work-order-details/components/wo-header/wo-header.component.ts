import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../../../../models/work-order.model';

@Component({
  selector: 'app-wo-header',
  template: `
    <mat-card class="wo-header">
      <mat-card-header>
        <mat-card-title>
          <div class="title-row">
            <span>{{ workOrder.details.title }}</span>
            <div class="actions">
              <button mat-icon-button (click)="onEdit()" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More actions">
                <mat-icon>more_vert</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-title>
        <mat-card-subtitle>
          Work Order #{{ workOrder.details.workOrderNumber }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Status:</span>
            <mat-chip [ngClass]="getStatusClass(workOrder.details.status)">
              {{ workOrder.details.status | titlecase }}
            </mat-chip>
          </div>
          
          <div class="info-item">
            <span class="label">Priority:</span>
            <mat-chip [ngClass]="getPriorityClass(workOrder.details.priority)">
              {{ workOrder.details.priority | titlecase }}
            </mat-chip>
          </div>
          
          <div class="info-item">
            <span class="label">Client:</span>
            <span class="value">{{ workOrder.details.client || 'N/A' }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">Location:</span>
            <span class="value">{{ workOrder.details.location || 'N/A' }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">Due Date:</span>
            <span class="value">{{ formatDate(workOrder.details.dueDate) }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">Completion:</span>
            <span class="value">{{ workOrder.details.completionPercentage }}%</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="onPrint()">
        <mat-icon>print</mat-icon>
        <span>Print</span>
      </button>
      <button mat-menu-item (click)="onExport()">
        <mat-icon>download</mat-icon>
        <span>Export</span>
      </button>
      <button mat-menu-item (click)="onDuplicate()">
        <mat-icon>content_copy</mat-icon>
        <span>Duplicate</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="onStatusChange(WorkOrderStatus.Completed)" 
              *ngIf="workOrder.details.status !== WorkOrderStatus.Completed">
        <mat-icon>check_circle</mat-icon>
        <span>Mark as Completed</span>
      </button>
      <button mat-menu-item (click)="onStatusChange(WorkOrderStatus.Cancelled)" 
              *ngIf="workOrder.details.status !== WorkOrderStatus.Cancelled">
        <mat-icon>cancel</mat-icon>
        <span>Cancel Work Order</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .wo-header {
      margin-bottom: 16px;
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      font-weight: 500;
    }

    .value {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
    }

    .status-pending { background-color: #FFA726 !important; }
    .status-in-progress { background-color: #42A5F5 !important; }
    .status-completed { background-color: #66BB6A !important; }
    .status-cancelled { background-color: #EF5350 !important; }
    .status-on-hold { background-color: #FFCA28 !important; }

    .priority-low { background-color: #81C784 !important; }
    .priority-medium { background-color: #FFB74D !important; }
    .priority-high { background-color: #FF8A65 !important; }
    .priority-critical { background-color: #E57373 !important; }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class WoHeaderComponent {
  @Input() workOrder!: WorkOrder;
  @Output() edit = new EventEmitter<WorkOrder>();
  @Output() statusChange = new EventEmitter<{ workOrderId: string; status: WorkOrderStatus }>();
  @Output() print = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() duplicate = new EventEmitter<void>();

  // Expose enum to template
  WorkOrderStatus = WorkOrderStatus;

  onEdit(): void {
    this.edit.emit(this.workOrder);
  }

  onStatusChange(status: WorkOrderStatus): void {
    this.statusChange.emit({ workOrderId: this.workOrder.id, status });
  }

  onPrint(): void {
    this.print.emit();
  }

  onExport(): void {
    this.export.emit();
  }

  onDuplicate(): void {
    this.duplicate.emit();
  }

  getStatusClass(status: WorkOrderStatus): string {
    return `status-${status}`;
  }

  getPriorityClass(priority: WorkOrderPriority): string {
    return `priority-${priority}`;
  }

  formatDate(date?: string | Date): string {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 