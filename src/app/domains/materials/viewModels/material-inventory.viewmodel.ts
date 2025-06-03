import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { MaterialInventory, WarehouseLocation, MaterialMovement, StockAdjustment, WarehouseStock, StockReservation } from '../models/inventory.model';
import { MaterialService } from '../services/material.service';
import { MaterialIntegrationService } from '../services/material-integration.service';
import { MaterialCategory, BaseMaterial, StockStatus, calculateStockStatus, MaterialType, ClientType } from '../models/material.model';

// Re-export interfaces from the new split viewModels
export { 
  InventoryDashboardData, 
  WarehouseUtilization, 
  StockAlert 
} from './inventory/material-inventory-dashboard.viewmodel';

export { 
  MovementFilter 
} from './inventory/stock-movements.viewmodel';

// Import the new split viewModels
import { 
  MaterialInventoryDashboardViewModel,
  InventoryDashboardData,
  StockAlert,
  WarehouseUtilization
} from './inventory/material-inventory-dashboard.viewmodel';

import { 
  StockMovementsViewModel,
  MovementFilter
} from './inventory/stock-movements.viewmodel';

export interface InventoryFilter {
  searchTerm?: string;
  warehouseId?: string;
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  materialType?: string;
  sortBy?: 'code' | 'description' | 'quantity' | 'value';
  sortOrder?: 'asc' | 'desc';
}

export interface MaterialWithInventory extends BaseMaterial {
  inventoryData?: MaterialInventory;
  stockStatus?: StockStatus;
}

/**
 * @deprecated This viewModel is being phased out in favor of focused viewModels.
 * Use MaterialInventoryDashboardViewModel and StockMovementsViewModel instead.
 * This facade is maintained for backward compatibility.
 */
@Injectable({
  providedIn: 'root'
})
export class MaterialInventoryViewModel {
  // Delegate to the new focused viewModels
  private dashboardViewModel = new MaterialInventoryDashboardViewModel();
  private movementsViewModel = new StockMovementsViewModel();
  
  // Additional state for compatibility
  private inventorySubject = new BehaviorSubject<MaterialInventory[]>([]);
  private warehousesSubject = new BehaviorSubject<WarehouseLocation[]>([]);
  private filtersSubject = new BehaviorSubject<InventoryFilter>({});
  private categoriesSubject = new BehaviorSubject<MaterialCategory[]>([]);
  private materialsSubject = new BehaviorSubject<MaterialWithInventory[]>([]);

  // Public observables - delegate to new viewModels where possible
  public inventory$ = this.inventorySubject.asObservable();
  public warehouses$ = this.warehousesSubject.asObservable();
  public movements$ = this.movementsViewModel.movements$;
  public dashboardData$ = this.dashboardViewModel.dashboardData$;
  public loading$ = this.dashboardViewModel.loading$;
  public error$ = this.dashboardViewModel.error$;
  public filters$ = this.filtersSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public materials$ = this.materialsSubject.asObservable();

  // Filtered inventory
  public filteredInventory$ = combineLatest([
    this.inventory$,
    this.filters$
  ]).pipe(
    map(([inventory, filters]) => this.applyFilters(inventory, filters))
  );

  constructor(
    private materialService: MaterialService,
    private integrationService: MaterialIntegrationService
  ) {
    this.initialize();
  }

  private initialize(): void {
    this.loadInventory();
    this.loadWarehouses();
    this.loadCategories();
    this.loadMaterials();
  }

  /**
   * @deprecated Use MaterialInventoryDashboardViewModel.loadDashboardData() instead
   */
  public loadDashboardData(): void {
    this.dashboardViewModel.loadDashboardData();
  }

  /**
   * Load inventory data
   */
  public loadInventory(): void {
    const mockInventory = this.generateMockInventory();
    of(mockInventory).pipe(
      delay(300),
      tap(inventory => {
        this.inventorySubject.next(inventory);
      })
    ).subscribe();
  }

  /**
   * Load warehouse locations
   */
  public loadWarehouses(): void {
    const mockWarehouses = this.generateMockWarehouses();
    of(mockWarehouses).pipe(
      delay(200),
      tap(warehouses => {
        this.warehousesSubject.next(warehouses);
      })
    ).subscribe();
  }

  /**
   * @deprecated Use StockMovementsViewModel.loadMovements() instead
   */
  public loadRecentMovements(limit = 10): void {
    this.movementsViewModel.loadMovements(limit);
  }

  /**
   * Load material categories
   */
  public loadCategories(): void {
    const mockCategories = this.generateMockCategories();
    of(mockCategories).pipe(
      delay(200),
      tap(categories => {
        this.categoriesSubject.next(categories);
      })
    ).subscribe();
  }

  /**
   * Load materials with inventory data
   */
  public loadMaterials(): void {
    const mockMaterials = this.generateMockMaterials();
    of(mockMaterials).pipe(
      delay(300),
      tap(materials => {
        this.materialsSubject.next(materials);
      })
    ).subscribe();
  }

  /**
   * Update inventory filters
   */
  public updateFilters(filters: Partial<InventoryFilter>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  /**
   * @deprecated Use StockMovementsViewModel.recordStockAdjustment() instead
   */
  public recordStockAdjustment(adjustment: Omit<StockAdjustment, 'id'>): Observable<boolean> {
    return this.movementsViewModel.recordStockAdjustment(adjustment);
  }

  /**
   * Get material inventory by ID
   */
  public getMaterialInventory(materialId: string): Observable<MaterialInventory | null> {
    return this.inventory$.pipe(
      map(inventory => inventory.find(inv => inv.materialId === materialId) || null)
    );
  }

  /**
   * Check stock availability for a material
   */
  public checkStockAvailability(materialId: string, requiredQuantity: number): Observable<{
    isAvailable: boolean;
    totalAvailable: number;
    warehouseAvailability: { warehouseId: string; available: number }[];
  }> {
    return this.inventory$.pipe(
      map(inventory => {
        const materialInventory = inventory.find(inv => inv.materialId === materialId);
        
        if (!materialInventory) {
          return {
            isAvailable: false,
            totalAvailable: 0,
            warehouseAvailability: []
          };
        }

        const isAvailable = materialInventory.availableQuantity >= requiredQuantity;
        const warehouseAvailability = materialInventory.warehouseStocks.map(stock => ({
          warehouseId: stock.warehouseId,
          available: stock.quantity
        }));

        return {
          isAvailable,
          totalAvailable: materialInventory.availableQuantity,
          warehouseAvailability
        };
      })
    );
  }

  // Utility methods
  private applyFilters(inventory: MaterialInventory[], filters: InventoryFilter): MaterialInventory[] {
    let filtered = [...inventory];

    if (filters.searchTerm) {
      // This would need to join with materials data in a real implementation
      filtered = filtered.filter(inv => 
        inv.materialId.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }

    if (filters.warehouseId) {
      filtered = filtered.filter(inv => 
        inv.warehouseStocks.some(stock => stock.warehouseId === filters.warehouseId)
      );
    }

    if (filters.stockStatus) {
      filtered = filtered.filter(inv => {
        switch (filters.stockStatus) {
          case 'in-stock':
            return inv.availableQuantity > inv.minimumStockLevel;
          case 'low-stock':
            return inv.availableQuantity <= inv.minimumStockLevel && inv.availableQuantity > 0;
          case 'out-of-stock':
            return inv.availableQuantity === 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  // Mock data generation methods (simplified versions)
  private generateMockInventory(): MaterialInventory[] {
    const inventory: MaterialInventory[] = [];
    
    for (let i = 1; i <= 50; i++) {
      inventory.push({
        materialId: `mat-${String(i).padStart(3, '0')}`,
        totalQuantity: Math.floor(Math.random() * 1000) + 100,
        availableQuantity: Math.floor(Math.random() * 800) + 50,
        reservedQuantity: Math.floor(Math.random() * 100),
        minimumStockLevel: Math.floor(Math.random() * 50) + 10,
        maximumStockLevel: Math.floor(Math.random() * 500) + 200,
        reorderPoint: Math.floor(Math.random() * 100) + 20,
        reorderQuantity: Math.floor(Math.random() * 200) + 50,
        warehouseStocks: [
          {
            warehouseId: 'wh-001',
            warehouseName: 'Main Warehouse',
            quantity: Math.floor(Math.random() * 500) + 50,
            lastUpdated: new Date()
          }
        ],
        valuation: {
          method: 'Average',
          currentValue: Math.random() * 10000 + 1000,
          currency: 'USD'
        },
        lastStockTakeDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastMovementDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }

    return inventory;
  }

  private generateMockWarehouses(): WarehouseLocation[] {
    return [
      {
        id: 'wh-001',
        name: 'Main Warehouse',
        code: 'MAIN',
        isActive: true,
        type: 'main',
        managerId: 'user-001',
        managerName: 'John Doe'
      },
      {
        id: 'wh-002',
        name: 'Site Storage A',
        code: 'SITE-A',
        isActive: true,
        type: 'site-storage',
        managerId: 'user-002',
        managerName: 'Jane Smith'
      }
    ];
  }

  private generateMockCategories(): MaterialCategory[] {
    return [
      {
        id: 'cat-001',
        name: 'Construction Materials',
        description: 'Basic construction materials',
        parentId: undefined,
        level: 0,
        path: [],
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat-002',
        name: 'Electrical Components',
        description: 'Electrical parts and components',
        parentId: undefined,
        level: 0,
        path: [],
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private generateMockMaterials(): MaterialWithInventory[] {
    const materials: MaterialWithInventory[] = [];
    const inventory = this.inventorySubject.value;
    
    for (let i = 1; i <= 50; i++) {
      const materialId = `mat-${String(i).padStart(3, '0')}`;
      const inventoryData = inventory.find(inv => inv.materialId === materialId);
      
      const material: MaterialWithInventory = {
        id: materialId,
        code: `MTL-${String(i).padStart(3, '0')}`,
        description: `Material ${i}`,
        unit: ['pcs', 'kg', 'm', 'box'][Math.floor(Math.random() * 4)],
        materialType: Math.random() > 0.5 ? MaterialType.PURCHASABLE : MaterialType.RECEIVABLE,
        clientType: Math.random() > 0.7 ? ClientType.SEC : ClientType.OTHER,
        inventoryData
      };

      // Add stock status if inventory data exists
      if (inventoryData) {
        material.totalStock = inventoryData.totalQuantity;
        material.minimumStock = inventoryData.minimumStockLevel;
        material.stockStatus = calculateStockStatus(material);
      }
      
      materials.push(material);
    }

    return materials;
  }
}
