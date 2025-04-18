import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableCardComponent, TableColumn, TableAction } from './data-table-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { of, delay } from 'rxjs';

// Example data interface
interface ExampleWorkOrder {
  id: number;
  title: string;
  client: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  progress: number;
  dueDate: Date;
}

@Component({
  selector: 'app-data-table-card-example',
  standalone: true,
  imports: [
    CommonModule,
    DataTableCardComponent,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="container p-3">
      <h2 class="mb-4">Data Table Card Example</h2>
      
      <app-data-table-card
        [title]="'Work Orders'"
        [columns]="columns"
        [data]="workOrders"
        [actions]="workOrderActions"
        [loading]="loading"
        [errorText]="errorMessage"
        [showSearch]="true"
        (rowClick)="onWorkOrderClick($event)"
        (rowAction)="onWorkOrderAction($event)">
        
        <!-- Status column template -->
        <ng-template #statusTemplate let-row>
          <span class="status-badge" [ngClass]="row.status">
            {{ row.status }}
          </span>
        </ng-template>
        
        <!-- Progress column template -->
        <ng-template #progressTemplate let-row>
          <div class="progress-container">
            <mat-progress-bar 
              [value]="row.progress" 
              [color]="getProgressColor(row.progress)">
            </mat-progress-bar>
            <span class="progress-text">{{ row.progress }}%</span>
          </div>
        </ng-template>
      </app-data-table-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .Pending {
      background-color: #e0e0e0;
      color: #616161;
    }
    
    .In-Progress {
      background-color: #bbdefb;
      color: #1976d2;
    }
    
    .Completed {
      background-color: #c8e6c9;
      color: #388e3c;
    }
    
    .Cancelled {
      background-color: #ffcdd2;
      color: #d32f2f;
    }
    
    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .progress-text {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: right;
    }
  `]
})
export class DataTableCardExampleComponent implements OnInit {
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('progressTemplate') progressTemplate!: TemplateRef<any>;
  
  columns: TableColumn[] = [];
  workOrders: ExampleWorkOrder[] = [];
  loading = true;
  errorMessage = '';
  
  workOrderActions: TableAction[] = [
    { name: 'View', icon: 'visibility', tooltip: 'View details' },
    { name: 'Edit', icon: 'edit', tooltip: 'Edit work order' },
    { 
      name: 'Complete', 
      icon: 'check_circle', 
      color: 'green', 
      tooltip: 'Mark as completed',
      disabled: (row: ExampleWorkOrder) => row.status === 'Completed' || row.status === 'Cancelled'
    },
    { 
      name: 'Cancel', 
      icon: 'cancel', 
      color: 'warn', 
      tooltip: 'Cancel work order',
      disabled: (row: ExampleWorkOrder) => row.status === 'Cancelled' || row.status === 'Completed'
    }
  ];
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.loadWorkOrders();
  }
  
  ngAfterViewInit(): void {
    // Set up columns with template references after view is initialized
    setTimeout(() => {
      this.columns = [
        { name: 'id', label: 'Order #', sortable: true },
        { name: 'title', label: 'Title', sortable: true },
        { name: 'client', label: 'Client', sortable: true },
        { name: 'priority', label: 'Priority', sortable: true },
        { name: 'status', label: 'Status', cellTemplate: this.statusTemplate },
        { name: 'progress', label: 'Progress', cellTemplate: this.progressTemplate },
        { name: 'dueDate', label: 'Due Date', sortable: true }
      ];
    });
  }
  
  loadWorkOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Simulate API call with delay
    of(this.getMockWorkOrders())
      .pipe(delay(1500))
      .subscribe({
        next: (data) => {
          this.workOrders = data;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load work orders. Please try again.';
          this.loading = false;
        }
      });
  }
  
  onWorkOrderClick(workOrder: ExampleWorkOrder): void {
    console.log('Work order clicked:', workOrder);
    // Navigate to work order details
    // this.router.navigate(['/work-orders', workOrder.id]);
  }
  
  onWorkOrderAction(event: {action: string, row: ExampleWorkOrder}): void {
    const { action, row } = event;
    console.log(`Action ${action} triggered for work order:`, row);
    
    switch(action) {
      case 'View':
        // View logic
        break;
      case 'Edit':
        // Edit logic
        break;
      case 'Complete':
        // Complete logic
        row.status = 'Completed';
        row.progress = 100;
        break;
      case 'Cancel':
        // Cancel logic
        row.status = 'Cancelled';
        break;
    }
  }
  
  getProgressColor(progress: number): string {
    if (progress < 30) return 'warn';
    if (progress < 70) return 'accent';
    return 'primary';
  }
  
  private getMockWorkOrders(): ExampleWorkOrder[] {
    return [
      {
        id: 1001,
        title: 'Office Renovation',
        client: 'ABC Corporation',
        priority: 'High',
        status: 'In Progress',
        progress: 65,
        dueDate: new Date('2025-05-15')
      },
      {
        id: 1002,
        title: 'HVAC Maintenance',
        client: 'City Hospital',
        priority: 'Medium',
        status: 'Pending',
        progress: 0,
        dueDate: new Date('2025-05-20')
      },
      {
        id: 1003,
        title: 'Electrical Rewiring',
        client: 'Tech Innovations',
        priority: 'High',
        status: 'In Progress',
        progress: 35,
        dueDate: new Date('2025-04-30')
      },
      {
        id: 1004,
        title: 'Plumbing Installation',
        client: 'Sunset Apartments',
        priority: 'Medium',
        status: 'Completed',
        progress: 100,
        dueDate: new Date('2025-04-10')
      },
      {
        id: 1005,
        title: 'Security System Upgrade',
        client: 'First National Bank',
        priority: 'High',
        status: 'In Progress',
        progress: 78,
        dueDate: new Date('2025-04-25')
      },
      {
        id: 1006,
        title: 'Roof Repair',
        client: 'Community Center',
        priority: 'Low',
        status: 'Pending',
        progress: 0,
        dueDate: new Date('2025-06-01')
      },
      {
        id: 1007,
        title: 'Landscaping Project',
        client: 'Greenview Residences',
        priority: 'Low',
        status: 'Cancelled',
        progress: 15,
        dueDate: new Date('2025-05-10')
      },
      {
        id: 1008,
        title: 'Elevator Maintenance',
        client: 'City Towers',
        priority: 'High',
        status: 'Completed',
        progress: 100,
        dueDate: new Date('2025-04-05')
      }
    ];
  }
} 