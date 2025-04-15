import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="dashboard-overview">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Dashboard Overview</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Welcome to the Work Order Management System</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-overview {
      padding: 16px;
    }
  `]
})
export class DashboardOverviewComponent { } 