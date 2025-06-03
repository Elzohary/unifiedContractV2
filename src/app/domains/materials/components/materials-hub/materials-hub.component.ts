import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil, switchMap } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { MaterialManagementService } from '../../services/material-management.service';
import { WorkOrderService } from '../../../work-order/services/work-order.service';

// Models
interface MaterialsModuleCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: 'primary' | 'accent' | 'warn';
  badge?: number;
  isNew?: boolean;
}

interface WorkOrderWithMaterialNeeds {
  id: string;
  workOrderNumber: string;
  title: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  materialsNeeded: number;
  pendingRequisitions: number;
  assignedMaterials: number;
  materialCompletionPercentage: number;
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
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './materials-hub.component.html',
  styleUrls: ['./materials-hub.component.scss']
})
export class MaterialsHubComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data streams
  dashboardData$ = this.materialManagementService.dashboardData$;
  workOrdersWithMaterialNeeds$!: Observable<WorkOrderWithMaterialNeeds[]>;

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
    private materialManagementService: MaterialManagementService,
    private workOrderService: WorkOrderService
  ) {
    this.initializeWorkOrdersWithMaterialNeeds();
  }

  ngOnInit(): void {
    // Load dashboard data for quick stats
    this.materialManagementService.loadDashboardData().subscribe();
    
    // Update badges with real data
    this.updateModuleBadges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeWorkOrdersWithMaterialNeeds(): void {
    // Combine work orders with material requisitions to identify work orders needing materials
    this.workOrdersWithMaterialNeeds$ = combineLatest([
      this.workOrderService.workOrders$,
      this.materialManagementService.requisitions$
    ]).pipe(
      map(([workOrders, requisitions]) => {
        return workOrders
          .filter(wo => wo.details?.status === 'in-progress' || wo.details?.status === 'pending')
          .map(wo => {
            // Count material assignments and requisitions for this work order
            const woRequisitions = requisitions.filter(req => req.workOrderId === wo.id);
            const pendingRequisitions = woRequisitions.filter(req => req.status === 'pending').length;
            
            // Mock data for materials needed - in real app, this would come from work order material assignments
            const materialsNeeded = this.calculateMaterialsNeeded(wo);
            const assignedMaterials = this.calculateAssignedMaterials(wo);
            
            return {
              id: wo.id,
              workOrderNumber: wo.details?.workOrderNumber || 'Unknown',
              title: wo.details?.title || 'No Title',
              urgency: this.mapWorkOrderUrgency(wo.details?.priority || 'medium'),
              materialsNeeded,
              pendingRequisitions,
              assignedMaterials,
              materialCompletionPercentage: materialsNeeded > 0 ? 
                Math.round((assignedMaterials / materialsNeeded) * 100) : 100
            } as WorkOrderWithMaterialNeeds;
          })
          .filter(wo => wo.materialsNeeded > wo.assignedMaterials || wo.pendingRequisitions > 0)
          .sort((a, b) => {
            // Sort by urgency and material completion
            const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
            if (urgencyDiff !== 0) return urgencyDiff;
            return a.materialCompletionPercentage - b.materialCompletionPercentage;
          });
      })
    );
  }

  private calculateMaterialsNeeded(workOrder: any): number {
    // Mock calculation - in real app, this would come from work order material requirements
    // Based on work order type, complexity, etc.
    const baseNeeds = Math.floor(Math.random() * 15) + 5; // 5-20 materials
    return baseNeeds;
  }

  private calculateAssignedMaterials(workOrder: any): number {
    // Mock calculation - in real app, this would come from actual material assignments
    const materialsNeeded = this.calculateMaterialsNeeded(workOrder);
    const assignedPercentage = Math.random() * 0.8; // 0-80% assigned
    return Math.floor(materialsNeeded * assignedPercentage);
  }

  private mapWorkOrderUrgency(priority: string): 'low' | 'medium' | 'high' | 'critical' {
    const mapping: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'low': 'low',
      'medium': 'medium', 
      'high': 'high',
      'urgent': 'critical',
      'critical': 'critical'
    };
    return mapping[priority.toLowerCase()] || 'medium';
  }

  private updateModuleBadges(): void {
    // Update badges with real-time data
    combineLatest([
      this.materialManagementService.dashboardData$,
      this.materialManagementService.alerts$,
      this.materialManagementService.pendingRequisitions$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([dashboardData, alerts, pendingReqs]) => {
      // Update Inventory Dashboard badge with critical alerts
      const inventoryModuleIndex = this.materialsModules.findIndex(m => m.route === '/materials/dashboard');
      if (inventoryModuleIndex >= 0) {
        this.materialsModules[inventoryModuleIndex].badge = 
          alerts.filter(alert => alert.severity === 'critical').length;
      }

      // Update Work Order Materials badge with pending requisitions
      const workOrderModuleIndex = this.materialsModules.findIndex(m => m.route === '/materials/work-order-hub');
      if (workOrderModuleIndex >= 0) {
        this.materialsModules[workOrderModuleIndex].badge = pendingReqs.length;
      }
    });
  }

  // Navigation Methods
  navigateToModule(route: string): void {
    this.router.navigate([route]);
  }

  navigateToWorkOrderMaterials(workOrderId: string): void {
    this.router.navigate(['/work-orders/details', workOrderId], {
      fragment: 'materials'
    });
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