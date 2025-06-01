import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { WorkOrder, Permit } from '../../../../models/work-order.model';

interface PermitStatus {
  type: string;
  isApproved: boolean;
}

@Component({
  selector: 'app-wo-overview-tab',
  templateUrl: './wo-overview-tab.component.html',
  styleUrls: ['./wo-overview-tab.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatTableModule
  ]
})
export class WoOverviewTabComponent {
  @Input() workOrder!: WorkOrder;

  // Table columns
  displayedColumns: string[] = [
    'itemNumber',
    'description',
    'uom',
    'estimatedQty',
    'estimatedPrice',
    'actualQty',
    'actualPrice'
  ];

  getPermitStatus(type: string): boolean {
    if (!this.workOrder.permits) return false;
    const permit = this.workOrder.permits.find(p => p.type === type);
    return permit?.status === 'approved';
  }

  formatDate(date?: string | Date): string {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProgressColor(): string {
    const percentage = this.workOrder.details.completionPercentage;
    if (percentage < 30) return 'warn';
    if (percentage < 70) return 'accent';
    return 'primary';
  }

  getTotalExpense(): number {
    if (!this.workOrder.expenseBreakdown) return 0;
    return (
      this.workOrder.expenseBreakdown.materials +
      this.workOrder.expenseBreakdown.labor +
      this.workOrder.expenseBreakdown.other
    );
  }
} 