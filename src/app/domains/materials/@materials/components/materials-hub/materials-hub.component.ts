import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Shared Components and Services
import { HelpService } from '../../../../../shared/services/help.service';
import { HelpDirective } from '../../../../../shared/directives/help.directive';
import { HelpCenterComponent } from '../../../../../shared/components/help-center/help-center.component';

// Materials Services
import { MaterialManagementService, MaterialDashboardData } from '../../../services/material-management.service';

// Mock work order interface (since we don't have access to work order service)
interface MockWorkOrder {
  id: string;
  details: {
    title: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    location: string;
    scheduledDate: string;
  };
}

interface WorkOrderWithMaterialNeeds extends MockWorkOrder {
  materialsNeeded: {
    id: string;
    name: string;
    quantityNeeded: number;
    quantityAvailable: number;
    unit: string;
  }[];
}

interface OverviewData {
  totalMaterials: number;
  lowStockAlerts: number;
  pendingAllocations: number;
  totalValue: number;
  movementsToday: number;
  activePurchaseOrders: number;
}

@Component({
  selector: 'app-materials-hub',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    HelpDirective
  ],
  templateUrl: './materials-hub.component.html',
  styleUrls: ['./materials-hub.component.scss']
})
export class MaterialsHubComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Help System
  isHelpModeActive$ = this.helpService.isHelpModeActive$;

  // Data observables
  workOrdersWithMaterialNeeds$!: Observable<WorkOrderWithMaterialNeeds[]>;
  workOrdersRequiringMaterials: WorkOrderWithMaterialNeeds[] = [];
  
  overviewData: OverviewData = {
    totalMaterials: 0,
    lowStockAlerts: 0,
    pendingAllocations: 0,
    totalValue: 0,
    movementsToday: 0,
    activePurchaseOrders: 0
  };

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private materialService: MaterialManagementService,
    private helpService: HelpService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    // Mock work orders data
    const mockWorkOrders: MockWorkOrder[] = [
      {
        id: 'wo-001',
        details: {
          title: 'HVAC System Maintenance',
          description: 'Regular maintenance of HVAC system in Building A',
          status: 'in-progress',
          priority: 'high',
          type: 'maintenance',
          location: 'Building A',
          scheduledDate: '2024-01-15'
        }
      },
      {
        id: 'wo-002',
        details: {
          title: 'Electrical Panel Upgrade',
          description: 'Upgrade electrical panel in Building B',
          status: 'pending',
          priority: 'medium',
          type: 'installation',
          location: 'Building B',
          scheduledDate: '2024-01-20'
        }
      }
    ];

    // Combine work orders and materials data
    this.workOrdersWithMaterialNeeds$ = combineLatest([
      of(mockWorkOrders),
      this.materialService.dashboardData$
    ]).pipe(
      map(([workOrders, dashboardData]) => {
        // Filter work orders that require materials and are not completed
        const workOrdersNeedingMaterials = workOrders
          .filter((wo: MockWorkOrder) => wo.details.status !== 'completed' && 
                        wo.details.status !== 'cancelled')
          .map((workOrder: MockWorkOrder) => {
            // Mock materials needed for demonstration
            const materialsNeeded = this.getMaterialsNeededForWorkOrder(workOrder.id);
            return {
              ...workOrder,
              materialsNeeded
            } as WorkOrderWithMaterialNeeds;
          })
          .filter((wo: WorkOrderWithMaterialNeeds) => wo.materialsNeeded.length > 0)
          .sort((a, b) => {
            // Prioritize by urgency and material availability
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const aPriority = priorityOrder[a.details.priority as keyof typeof priorityOrder] || 1;
            const bPriority = priorityOrder[b.details.priority as keyof typeof priorityOrder] || 1;
            
            if (aPriority !== bPriority) {
              return bPriority - aPriority;
            }
            
            // Secondary sort by due date
            const aDate = new Date(a.details.scheduledDate).getTime();
            const bDate = new Date(b.details.scheduledDate).getTime();
            return aDate - bDate;
          });

        return workOrdersNeedingMaterials;
      })
    );

    // Subscribe to the combined data
    this.workOrdersWithMaterialNeeds$
      .pipe(takeUntil(this.destroy$))
      .subscribe(workOrders => {
        this.workOrdersRequiringMaterials = workOrders;
      });

    // Load overview data from MaterialDashboardData
    this.materialService.dashboardData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.overviewData = {
            totalMaterials: data.totalMaterials,
            lowStockAlerts: data.lowStockItems,
            pendingAllocations: data.pendingRequisitions,
            totalValue: data.totalValue,
            movementsToday: data.recentMovements.length, // Mock data
            activePurchaseOrders: Math.floor(Math.random() * 12) + 3 // Mock data
          };
        }
      });

    // Load the dashboard data if not already loaded
    this.materialService.loadDashboardData().subscribe();
  }

  private getMaterialsNeededForWorkOrder(workOrderId: string): any[] {
    // Mock materials needed based on work order type
    const materialTemplates = [
      { id: 'mat001', name: 'Steel Pipes', quantityNeeded: 10, quantityAvailable: 25, unit: 'pcs' },
      { id: 'mat002', name: 'Electrical Cable', quantityNeeded: 50, quantityAvailable: 30, unit: 'm' },
      { id: 'mat003', name: 'Concrete Mix', quantityNeeded: 5, quantityAvailable: 12, unit: 'bags' },
      { id: 'mat004', name: 'Welding Rods', quantityNeeded: 2, quantityAvailable: 8, unit: 'packs' },
      { id: 'mat005', name: 'Safety Equipment', quantityNeeded: 3, quantityAvailable: 5, unit: 'sets' }
    ];

    // Return 2-4 random materials for each work order
    const count = Math.floor(Math.random() * 3) + 2;
    return materialTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  // Navigation methods
  navigateToInventory(): void {
    this.router.navigate(['/materials/dashboard']);
  }

  navigateToCatalog(): void {
    this.router.navigate(['/materials/catalog']);
  }

  navigateToWorkOrderHub(): void {
    this.router.navigate(['/materials/work-order-hub']);
  }

  // Work order specific actions
  allocateMaterials(workOrderId: string): void {
    this.router.navigate(['/materials/work-order-hub'], {
      queryParams: { workOrderId, action: 'allocate' }
    });
  }

  viewWorkOrder(workOrderId: string): void {
    this.router.navigate(['/work-orders', workOrderId]);
  }

  // Help System methods
  openHelpCenter(): void {
    this.dialog.open(HelpCenterComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      panelClass: 'help-center-dialog'
    });
  }

  toggleHelpMode(): void {
    this.helpService.toggleHelpMode();
  }
} 