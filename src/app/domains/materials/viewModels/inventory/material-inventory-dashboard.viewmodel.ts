import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { MaterialMovement } from '../../models/inventory.model';

export interface InventoryDashboardData {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  pendingOrders: number;
  recentMovements: MaterialMovement[];
  warehouseUtilization: WarehouseUtilization[];
  stockAlerts: StockAlert[];
}

export interface WarehouseUtilization {
  warehouseId: string;
  warehouseName: string;
  capacity: number;
  used: number;
  utilizationPercentage: number;
}

export interface StockAlert {
  id: string;
  type: 'low-stock' | 'expiring' | 'overstock' | 'no-movement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  materialId: string;
  materialCode: string;
  materialDescription: string;
  message: string;
  actionRequired: string;
  dateDetected: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialInventoryDashboardViewModel {
  // State
  private dashboardDataSubject = new BehaviorSubject<InventoryDashboardData | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables
  public dashboardData$ = this.dashboardDataSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Mock data flag
  private useMockData = true;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.loadDashboardData();
  }

  /**
   * Load dashboard data
   */
  public loadDashboardData(): void {
    this.loadingSubject.next(true);

    if (this.useMockData) {
      const mockData = this.generateMockDashboardData();
      of(mockData).pipe(
        delay(500),
        tap(data => {
          this.dashboardDataSubject.next(data);
          this.loadingSubject.next(false);
        }),
        catchError(() => {
          this.errorSubject.next('Failed to load dashboard data');
          this.loadingSubject.next(false);
          return of(null);
        })
      ).subscribe();
    } else {
      this.errorSubject.next('API not implemented yet');
      this.loadingSubject.next(false);
    }
  }

  /**
   * Refresh dashboard data
   */
  public refresh(): void {
    this.loadDashboardData();
  }

  /**
   * Generate mock dashboard data
   */
  private generateMockDashboardData(): InventoryDashboardData {
    return {
      totalMaterials: 1247,
      totalValue: 875650.75,
      lowStockItems: 23,
      expiringItems: 7,
      pendingOrders: 12,
      recentMovements: this.generateMockMovements(5),
      warehouseUtilization: [
        {
          warehouseId: 'wh-001',
          warehouseName: 'Main Warehouse',
          capacity: 10000,
          used: 7543,
          utilizationPercentage: 75.43
        },
        {
          warehouseId: 'wh-002',
          warehouseName: 'Secondary Storage',
          capacity: 5000,
          used: 3201,
          utilizationPercentage: 64.02
        }
      ],
      stockAlerts: [
        {
          id: 'alert-001',
          type: 'low-stock',
          severity: 'high',
          materialId: 'mat-001',
          materialCode: 'STL-001',
          materialDescription: 'Steel Pipes 6"',
          message: 'Stock level below minimum threshold',
          actionRequired: 'Reorder 100 units',
          dateDetected: new Date('2024-01-10')
        },
        {
          id: 'alert-002',
          type: 'expiring',
          severity: 'medium',
          materialId: 'mat-015',
          materialCode: 'CHM-015',
          materialDescription: 'Chemical Sealant',
          message: 'Materials expiring in 30 days',
          actionRequired: 'Use or dispose 5 units',
          dateDetected: new Date('2024-01-12')
        }
      ]
    };
  }

  /**
   * Generate mock movements for dashboard
   */
  private generateMockMovements(count: number): MaterialMovement[] {
    const movements: MaterialMovement[] = [];
    const movementTypes = ['receipt', 'issue', 'transfer', 'return', 'write-off'] as const;
    
    for (let i = 0; i < count; i++) {
      movements.push({
        id: `mov-${String(i + 1).padStart(3, '0')}`,
        movementNumber: `MV-${String(i + 1).padStart(4, '0')}`,
        materialId: `mat-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
        materialCode: `MTL-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
        materialDescription: `Material ${i + 1}`,
        movementType: movementTypes[Math.floor(Math.random() * movementTypes.length)],
        quantity: Math.floor(Math.random() * 100) + 1,
        unit: ['pcs', 'kg', 'm', 'box'][Math.floor(Math.random() * 4)],
        fromLocation: {
          type: 'warehouse',
          id: `wh-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
          name: `Warehouse ${Math.floor(Math.random() * 3) + 1}`
        },
        toLocation: {
          type: 'warehouse',
          id: `wh-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
          name: `Warehouse ${Math.floor(Math.random() * 3) + 1}`
        },
        relatedEntity: {
          type: 'work-order',
          id: `wo-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
          reference: `WO-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`
        },
        performedBy: `user-${Math.floor(Math.random() * 10) + 1}`,
        performedByName: `User ${Math.floor(Math.random() * 10) + 1}`,
        performedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        notes: `Movement ${i + 1} notes`
      });
    }

    return movements.sort((a, b) => b.performedDate.getTime() - a.performedDate.getTime());
  }
} 