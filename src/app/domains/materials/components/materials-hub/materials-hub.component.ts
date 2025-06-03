import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { MaterialManagementService } from '../../services/material-management.service';

interface MaterialsModuleCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: 'primary' | 'accent' | 'warn';
  badge?: number;
  isNew?: boolean;
}

@Component({
  selector: 'app-materials-hub',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <div class="materials-hub-container">
      <!-- Header -->
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>inventory</mat-icon>
            Materials Management
          </mat-card-title>
          <mat-card-subtitle>
            Comprehensive materials and inventory management system
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Quick Stats -->
      <div class="quick-stats" *ngIf="dashboardData$ | async as data">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon primary">inventory_2</mat-icon>
              <div class="stat-details">
                <div class="stat-value">{{data.totalMaterials}}</div>
                <div class="stat-label">Total Materials</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon warn">warning</mat-icon>
              <div class="stat-details">
                <div class="stat-value">{{data.lowStockItems}}</div>
                <div class="stat-label">Low Stock Alerts</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon accent">assignment</mat-icon>
              <div class="stat-details">
                <div class="stat-value">{{data.pendingRequisitions}}</div>
                <div class="stat-label">Pending Requisitions</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon success">attach_money</mat-icon>
              <div class="stat-details">
                <div class="stat-value">{{data.totalValue | currency}}</div>
                <div class="stat-label">Total Inventory Value</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Navigation Cards -->
      <div class="navigation-grid">
        <mat-card 
          class="nav-card" 
          *ngFor="let module of materialsModules"
          [class]="'nav-card-' + module.color"
          (click)="navigateToModule(module.route)">
          
          <mat-card-header>
            <div class="nav-card-icon">
              <mat-icon 
                [matBadge]="module.badge" 
                [matBadgeHidden]="!module.badge"
                matBadgeColor="warn">
                {{module.icon}}
              </mat-icon>
              <span class="new-badge" *ngIf="module.isNew">NEW</span>
            </div>
            <mat-card-title>{{module.title}}</mat-card-title>
            <mat-card-subtitle>{{module.description}}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="nav-card-action">
              <button mat-raised-button [color]="module.color">
                <mat-icon>arrow_forward</mat-icon>
                Open
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <mat-card class="quick-actions-card">
        <mat-card-header>
          <mat-card-title>Quick Actions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="quick-actions">
            <button mat-raised-button color="primary" (click)="createStockAdjustment()">
              <mat-icon>tune</mat-icon>
              Stock Adjustment
            </button>
            <button mat-raised-button color="accent" (click)="createRequisition()">
              <mat-icon>assignment</mat-icon>
              Material Requisition
            </button>
            <button mat-stroked-button (click)="addNewMaterial()">
              <mat-icon>add</mat-icon>
              Add Material
            </button>
            <button mat-stroked-button (click)="viewReports()">
              <mat-icon>assessment</mat-icon>
              View Reports
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .materials-hub-container {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header-card .mat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      min-height: 100px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 36px;
      height: 36px;
      width: 36px;
    }

    .stat-icon.primary { color: #1976d2; }
    .stat-icon.accent { color: #ff4081; }
    .stat-icon.warn { color: #ff9800; }
    .stat-icon.success { color: #4caf50; }

    .stat-details {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .stat-label {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }

    .navigation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .nav-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      min-height: 180px;
    }

    .nav-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .nav-card-icon {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-card-icon mat-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
    }

    .new-badge {
      background: #ff4081;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 8px;
      font-weight: 500;
    }

    .nav-card-action {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .nav-card-primary .nav-card-icon mat-icon { color: #1976d2; }
    .nav-card-accent .nav-card-icon mat-icon { color: #ff4081; }
    .nav-card-warn .nav-card-icon mat-icon { color: #ff9800; }

    .quick-actions-card {
      margin-top: 8px;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .quick-actions button {
      flex: 1 1 200px;
      min-width: 200px;
    }

    @media (max-width: 768px) {
      .quick-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .navigation-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        flex-direction: column;
      }

      .quick-actions button {
        flex: none;
        min-width: unset;
      }
    }
  `]
})
export class MaterialsHubComponent implements OnInit {
  
  dashboardData$ = this.materialManagementService.dashboardData$;

  materialsModules: MaterialsModuleCard[] = [
    {
      title: 'Inventory Dashboard',
      description: 'Monitor stock levels, movements, and inventory health',
      icon: 'dashboard',
      route: '/materials/dashboard',
      color: 'primary',
      badge: 0
    },
    {
      title: 'Material Catalog',
      description: 'Manage material definitions, specifications, and properties',
      icon: 'library_books',
      route: '/materials/catalog',
      color: 'primary'
    },
    {
      title: 'Work Order Materials',
      description: 'Integrate materials with work orders and track usage',
      icon: 'engineering',
      route: '/materials/work-order-hub',
      color: 'accent',
      isNew: true
    },
    {
      title: 'Warehouse Management',
      description: 'Manage warehouse locations, transfers, and allocations',
      icon: 'warehouse',
      route: '/materials/warehouses',
      color: 'primary'
    },
    {
      title: 'Purchase Orders',
      description: 'Create and manage material procurement processes',
      icon: 'shopping_cart',
      route: '/materials/purchase-orders',
      color: 'warn'
    },
    {
      title: 'Stock Movements',
      description: 'Track all material movements, receipts, and issues',
      icon: 'swap_horiz',
      route: '/materials/movements',
      color: 'primary'
    }
  ];

  constructor(
    private router: Router,
    private materialManagementService: MaterialManagementService
  ) {}

  ngOnInit(): void {
    // Load dashboard data for quick stats
    this.materialManagementService.loadDashboardData().subscribe();
  }

  navigateToModule(route: string): void {
    this.router.navigate([route]);
  }

  // Quick Actions
  createStockAdjustment(): void {
    this.router.navigate(['/materials/dashboard'], { 
      queryParams: { action: 'stock-adjustment' } 
    });
  }

  createRequisition(): void {
    this.router.navigate(['/materials/dashboard'], { 
      queryParams: { action: 'requisition' } 
    });
  }

  addNewMaterial(): void {
    this.router.navigate(['/materials/catalog'], { 
      queryParams: { action: 'add' } 
    });
  }

  viewReports(): void {
    this.router.navigate(['/materials/reports']);
  }
} 