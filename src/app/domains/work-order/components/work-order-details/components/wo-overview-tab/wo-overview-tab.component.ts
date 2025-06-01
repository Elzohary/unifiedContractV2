import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WorkOrder } from '../../../../models/work-order.model';

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
    MatProgressBarModule
  ]
})
export class WoOverviewTabComponent {
  @Input() workOrder!: WorkOrder;

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