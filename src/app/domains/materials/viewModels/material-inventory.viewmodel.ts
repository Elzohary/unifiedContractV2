import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { MaterialInventory, WarehouseLocation, MaterialMovement, StockAdjustment, WarehouseStock, StockReservation } from '../models/inventory.model';
import { MaterialService } from '../services/material.service';
import { MaterialIntegrationService } from '../services/material-integration.service';
import { MaterialCategory, BaseMaterial, StockStatus, calculateStockStatus, MaterialType, ClientType } from '../models/material.model';

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

@Injectable()
export class MaterialInventoryViewModel {
  // State
  private inventorySubject = new BehaviorSubject<MaterialInventory[]>([]);
  private warehousesSubject = new BehaviorSubject<WarehouseLocation[]>([]);
  private movementsSubject = new BehaviorSubject<MaterialMovement[]>([]);
  private dashboardDataSubject = new BehaviorSubject<InventoryDashboardData | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private filtersSubject = new BehaviorSubject<InventoryFilter>({});
  private categoriesSubject = new BehaviorSubject<MaterialCategory[]>([]);
  private materialsSubject = new BehaviorSubject<MaterialWithInventory[]>([]);

  // Observables
  public inventory$ = this.inventorySubject.asObservable();
  public warehouses$ = this.warehousesSubject.asObservable();
  public movements$ = this.movementsSubject.asObservable();
  public dashboardData$ = this.dashboardDataSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
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

  // Mock data flag
  private useMockData = true; // Set to false when API is ready

  constructor(
    private materialService: MaterialService,
    private integrationService: MaterialIntegrationService
  ) {
    this.initialize();
  }

  private initialize(): void {
    this.loadDashboardData();
    this.loadInventory();
    this.loadWarehouses();
    this.loadRecentMovements();
    this.loadCategories();
    this.loadMaterials();
  }

  /**
   * Load dashboard data
   */
  public loadDashboardData(): void {
    this.loadingSubject.next(true);

    if (this.useMockData) {
      // Use mock data
      const mockData = this.generateMockDashboardData();
      of(mockData).pipe(
        delay(500), // Simulate API delay
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
      // TODO: Implement actual API call
      this.errorSubject.next('API not implemented yet');
      this.loadingSubject.next(false);
    }
  }

  /**
   * Load inventory data
   */
  public loadInventory(): void {
    if (this.useMockData) {
      const mockInventory = this.generateMockInventory();
      of(mockInventory).pipe(
        delay(300),
        tap(inventory => {
          this.inventorySubject.next(inventory);
        })
      ).subscribe();
    } else {
      // TODO: Implement actual API call
    }
  }

  /**
   * Load warehouse locations
   */
  public loadWarehouses(): void {
    if (this.useMockData) {
      const mockWarehouses = this.generateMockWarehouses();
      of(mockWarehouses).pipe(
        delay(200),
        tap(warehouses => {
          this.warehousesSubject.next(warehouses);
        })
      ).subscribe();
    } else {
      // TODO: Implement actual API call
    }
  }

  /**
   * Load recent material movements
   */
  public loadRecentMovements(limit = 10): void {
    if (this.useMockData) {
      const mockMovements = this.generateMockMovements(limit);
      of(mockMovements).pipe(
        delay(400),
        tap(movements => {
          this.movementsSubject.next(movements);
        })
      ).subscribe();
    } else {
      // TODO: Implement actual API call
    }
  }

  /**
   * Load material categories
   */
  public loadCategories(): void {
    if (this.useMockData) {
      const mockCategories = this.generateMockCategories();
      of(mockCategories).pipe(
        delay(200),
        tap(categories => {
          this.categoriesSubject.next(categories);
        })
      ).subscribe();
    } else {
      // TODO: Implement actual API call
    }
  }

  /**
   * Load materials with full details
   */
  public loadMaterials(): void {
    if (this.useMockData) {
      const mockMaterials = this.generateMockMaterials();
      of(mockMaterials).pipe(
        delay(300),
        tap(materials => {
          this.materialsSubject.next(materials);
        })
      ).subscribe();
    } else {
      // TODO: Implement actual API call
    }
  }

  /**
   * Update inventory filters
   */
  public updateFilters(filters: Partial<InventoryFilter>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  /**
   * Record a stock adjustment
   */
  public recordStockAdjustment(adjustment: Omit<StockAdjustment, 'id'>): Observable<boolean> {
    if (this.useMockData) {
      // Simulate saving adjustment
      console.log('Recording stock adjustment:', adjustment);
      return of(true).pipe(
        delay(500),
        tap(() => {
          // Refresh inventory after adjustment
          this.loadInventory();
          this.loadRecentMovements();
        })
      );
    } else {
      // TODO: Implement actual API call
      return of(false);
    }
  }

  /**
   * Get inventory for a specific material
   */
  public getMaterialInventory(materialId: string): Observable<MaterialInventory | null> {
    return this.inventory$.pipe(
      map(inventory => inventory.find(inv => inv.materialId === materialId) || null)
    );
  }

  /**
   * Check stock availability across warehouses
   */
  public checkStockAvailability(materialId: string, requiredQuantity: number): Observable<{
    isAvailable: boolean;
    totalAvailable: number;
    warehouseAvailability: { warehouseId: string; available: number }[];
  }> {
    return this.getMaterialInventory(materialId).pipe(
      map(inventory => {
        if (!inventory) {
          return {
            isAvailable: false,
            totalAvailable: 0,
            warehouseAvailability: []
          };
        }

        const warehouseAvailability = inventory.warehouseStocks.map((stock: WarehouseStock) => ({
          warehouseId: stock.warehouseId,
          available: stock.quantity - (stock.reservations?.reduce((sum: number, res: StockReservation) =>
            res.status === 'active' ? sum + res.quantity : sum, 0) || 0)
        }));

        const totalAvailable = warehouseAvailability.reduce((sum: number, w: { available: number }) => sum + w.available, 0);

        return {
          isAvailable: totalAvailable >= requiredQuantity,
          totalAvailable,
          warehouseAvailability
        };
      })
    );
  }

  // Helper methods

  private applyFilters(inventory: MaterialInventory[], filters: InventoryFilter): MaterialInventory[] {
    let filtered = [...inventory];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(inv => {
        // TODO: Get material details from material service
        return inv.materialId.toLowerCase().includes(searchLower);
      });
    }

    // Warehouse filter
    if (filters.warehouseId && filters.warehouseId !== 'all') {
      filtered = filtered.filter(inv =>
        inv.warehouseStocks.some((stock: WarehouseStock) => stock.warehouseId === filters.warehouseId)
      );
    }

    // Stock status filter
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      filtered = filtered.filter(inv => {
        switch (filters.stockStatus) {
          case 'in-stock':
            return inv.availableQuantity > inv.minimumStockLevel;
          case 'low-stock':
            return inv.availableQuantity > 0 && inv.availableQuantity <= inv.minimumStockLevel;
          case 'out-of-stock':
            return inv.availableQuantity === 0;
          default:
            return true;
        }
      });
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'quantity':
            comparison = a.totalQuantity - b.totalQuantity;
            break;
          case 'value':
            comparison = a.valuation.currentValue - b.valuation.currentValue;
            break;
          // TODO: Add more sort options when material details are available
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }

  // Mock data generators

  private generateMockDashboardData(): InventoryDashboardData {
    return {
      totalMaterials: 1250,
      totalValue: 2450000,
      lowStockItems: 23,
      expiringItems: 5,
      pendingOrders: 12,
      recentMovements: this.generateMockMovements(5),
      warehouseUtilization: [
        {
          warehouseId: 'wh-001',
          warehouseName: 'Main Warehouse',
          capacity: 10000,
          used: 7500,
          utilizationPercentage: 75
        },
        {
          warehouseId: 'wh-002',
          warehouseName: 'Site Storage A',
          capacity: 5000,
          used: 3200,
          utilizationPercentage: 64
        },
        {
          warehouseId: 'wh-003',
          warehouseName: 'Site Storage B',
          capacity: 3000,
          used: 2100,
          utilizationPercentage: 70
        }
      ],
      stockAlerts: [
        {
          id: 'alert-001',
          type: 'low-stock',
          severity: 'high',
          materialId: 'mat-001',
          materialCode: 'CABLE-001',
          materialDescription: 'Power Cable 16mm',
          message: 'Stock level below minimum threshold',
          actionRequired: 'Create purchase order',
          dateDetected: new Date()
        },
        {
          id: 'alert-002',
          type: 'expiring',
          severity: 'medium',
          materialId: 'mat-002',
          materialCode: 'CHEM-001',
          materialDescription: 'Material expiring in 30 days',
          message: 'Plan usage or disposal',
          actionRequired: 'Plan usage or disposal',
          dateDetected: new Date()
        }
      ]
    };
  }

  private generateMockInventory(): MaterialInventory[] {
    const materials = [
      { id: 'mat-001', code: 'CABLE-001', description: 'Power Cable 16mm', unit: 'meter' },
      { id: 'mat-002', code: 'PIPE-001', description: 'Steel Pipe 2"', unit: 'piece' },
      { id: 'mat-003', code: 'VALVE-001', description: 'Gate Valve 2"', unit: 'piece' },
      { id: 'mat-004', code: 'CEMENT-001', description: 'Portland Cement', unit: 'bag' },
      { id: 'mat-005', code: 'STEEL-001', description: 'Steel Rebar 12mm', unit: 'ton' }
    ];

    return materials.map(mat => ({
      materialId: mat.id,
      totalQuantity: Math.floor(Math.random() * 1000) + 100,
      availableQuantity: Math.floor(Math.random() * 800) + 50,
      reservedQuantity: Math.floor(Math.random() * 100),
      inTransitQuantity: Math.floor(Math.random() * 50),
      minimumStockLevel: 100,
      maximumStockLevel: 1000,
      reorderPoint: 150,
      reorderQuantity: 500,
      warehouseStocks: [
        {
          warehouseId: 'wh-001',
          warehouseName: 'Main Warehouse',
          quantity: Math.floor(Math.random() * 500) + 50,
          binLocation: `A${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}`,
          lastUpdated: new Date()
        }
      ],
      valuation: {
        method: 'Average',
        currentValue: Math.floor(Math.random() * 50000) + 10000,
        currency: 'SAR'
      },
      lastStockTakeDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastMovementDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));
  }

  private generateMockWarehouses(): WarehouseLocation[] {
    return [
      {
        id: 'wh-001',
        name: 'Main Warehouse',
        code: 'MWH-001',
        address: 'Industrial Area, Block A',
        type: 'main',
        managerId: 'emp-001',
        managerName: 'Ahmed Al-Rashid',
        isActive: true
      },
      {
        id: 'wh-002',
        name: 'Site Storage A',
        code: 'SSH-002',
        address: 'Project Site A, Eastern Region',
        type: 'site-storage',
        managerId: 'emp-002',
        managerName: 'Mohammed Al-Qahtani',
        isActive: true
      },
      {
        id: 'wh-003',
        name: 'Site Storage B',
        code: 'SSH-003',
        address: 'Project Site B, Western Region',
        type: 'site-storage',
        managerId: 'emp-003',
        managerName: 'Khalid Al-Zahrani',
        isActive: true
      }
    ];
  }

  private generateMockMovements(count: number): MaterialMovement[] {
    const movements: MaterialMovement[] = [];
    const movementTypes: MaterialMovement['movementType'][] = ['receipt', 'issue', 'transfer', 'return'];

    for (let i = 0; i < count; i++) {
      movements.push({
        id: `mov-${Date.now()}-${i}`,
        movementNumber: `MOV-2024-${String(1000 + i).padStart(4, '0')}`,
        materialId: `mat-${Math.floor(Math.random() * 5) + 1}`,
        materialCode: `MAT-${Math.floor(Math.random() * 5) + 1}`,
        materialDescription: `Material ${Math.floor(Math.random() * 5) + 1}`,
        movementType: movementTypes[Math.floor(Math.random() * movementTypes.length)],
        quantity: Math.floor(Math.random() * 100) + 10,
        unit: 'piece',
        toLocation: {
          type: 'work-order',
          id: `wo-${Math.floor(Math.random() * 100)}`,
          name: `Work Order ${Math.floor(Math.random() * 100)}`
        },
        relatedEntity: {
          type: 'work-order',
          id: `wo-${Math.floor(Math.random() * 100)}`,
          reference: `WO-2024-${Math.floor(Math.random() * 100)}`
        },
        performedBy: 'user-001',
        performedByName: 'System User',
        performedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        unitCost: Math.floor(Math.random() * 100) + 10,
        totalCost: 0
      });

      // Calculate total cost
      movements[i].totalCost = movements[i].quantity * (movements[i].unitCost || 0);
    }

    return movements.sort((a, b) => b.performedDate.getTime() - a.performedDate.getTime());
  }

  private generateMockCategories(): MaterialCategory[] {
    const categories: MaterialCategory[] = [
      {
        id: 'cat-001',
        name: 'Electrical',
        description: 'Electrical materials and components',
        parentId: null,
        level: 0,
        path: [],
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        customFields: [
          {
            fieldName: 'voltage_rating',
            fieldType: 'select',
            required: true,
            options: ['110V', '220V', '380V'],
            defaultValue: '220V'
          }
        ]
      },
      {
        id: 'cat-002',
        name: 'Cables',
        description: 'All types of cables',
        parentId: 'cat-001',
        level: 1,
        path: ['cat-001'],
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-003',
        name: 'Mechanical',
        description: 'Mechanical materials and components',
        parentId: null,
        level: 0,
        path: [],
        isActive: true,
        sortOrder: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-004',
        name: 'Pipes & Fittings',
        description: 'Pipes, valves, and fittings',
        parentId: 'cat-003',
        level: 1,
        path: ['cat-003'],
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-005',
        name: 'Construction',
        description: 'Construction materials',
        parentId: null,
        level: 0,
        path: [],
        isActive: true,
        sortOrder: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    return categories;
  }

  private generateMockMaterials(): MaterialWithInventory[] {
    const materials: MaterialWithInventory[] = [
      {
        id: 'mat-001',
        code: 'CABLE-001',
        description: 'Power Cable 16mm²',
        unit: 'meter',
        materialType: MaterialType.PURCHASABLE,
        clientType: ClientType.OTHER,
        categoryId: 'cat-002',
        subcategoryId: undefined,
        totalStock: 850,
        availableStock: 750,
        reservedStock: 100,
        minimumStock: 200,
        maximumStock: 2000,
        reorderPoint: 300,
        reorderQuantity: 1000,
        primaryWarehouseId: 'wh-001',
        averageCost: 45.50,
        lastPurchaseCost: 48.00,
        standardCost: 46.00,
        barcode: '1234567890123',
        qrCode: 'QR-CABLE-001',
        specifications: [
          { name: 'Conductor Material', value: 'Copper', required: true },
          { name: 'Insulation', value: 'XLPE', required: true },
          { name: 'Voltage Rating', value: '1000V', unit: 'V', required: true }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        lastUsedAt: new Date('2024-01-25'),
        hazardous: false
      },
      {
        id: 'mat-002',
        code: 'PIPE-001',
        description: 'Steel Pipe 2" Schedule 40',
        unit: 'piece',
        materialType: MaterialType.PURCHASABLE,
        clientType: ClientType.OTHER,
        categoryId: 'cat-004',
        totalStock: 245,
        availableStock: 200,
        reservedStock: 45,
        minimumStock: 50,
        maximumStock: 500,
        reorderPoint: 75,
        reorderQuantity: 200,
        primaryWarehouseId: 'wh-001',
        averageCost: 125.00,
        lastPurchaseCost: 130.00,
        standardCost: 128.00,
        barcode: '1234567890124',
        specifications: [
          { name: 'Material', value: 'Carbon Steel', required: true },
          { name: 'Diameter', value: '2', unit: 'inch', required: true },
          { name: 'Wall Thickness', value: '3.91', unit: 'mm', required: true }
        ],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: 'mat-003',
        code: 'VALVE-001',
        description: 'Gate Valve 2" Flanged',
        unit: 'piece',
        materialType: MaterialType.PURCHASABLE,
        clientType: ClientType.OTHER,
        categoryId: 'cat-004',
        totalStock: 35,
        availableStock: 30,
        reservedStock: 5,
        minimumStock: 10,
        maximumStock: 100,
        reorderPoint: 15,
        reorderQuantity: 50,
        primaryWarehouseId: 'wh-002',
        averageCost: 450.00,
        lastPurchaseCost: 475.00,
        standardCost: 460.00,
        barcode: '1234567890125',
        specifications: [
          { name: 'Body Material', value: 'Cast Iron', required: true },
          { name: 'Pressure Rating', value: '150', unit: 'PSI', required: true },
          { name: 'End Connection', value: 'Flanged RF', required: true }
        ],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-22')
      },
      {
        id: 'mat-004',
        code: 'CEMENT-001',
        description: 'Portland Cement Type I',
        unit: 'bag',
        materialType: MaterialType.PURCHASABLE,
        clientType: ClientType.OTHER,
        categoryId: 'cat-005',
        totalStock: 500,
        availableStock: 450,
        reservedStock: 50,
        minimumStock: 100,
        maximumStock: 1000,
        reorderPoint: 200,
        reorderQuantity: 500,
        primaryWarehouseId: 'wh-003',
        averageCost: 35.00,
        lastPurchaseCost: 36.50,
        standardCost: 35.50,
        barcode: '1234567890126',
        shelfLife: 90, // 90 days
        specifications: [
          { name: 'Type', value: 'Type I', required: true },
          { name: 'Weight', value: '50', unit: 'kg', required: true },
          { name: 'Standard', value: 'ASTM C150', required: true }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: 'mat-005',
        code: 'CHEM-001',
        description: 'Industrial Adhesive',
        unit: 'liter',
        materialType: MaterialType.PURCHASABLE,
        clientType: ClientType.OTHER,
        categoryId: 'cat-005',
        totalStock: 25,
        availableStock: 20,
        reservedStock: 5,
        minimumStock: 10,
        maximumStock: 50,
        reorderPoint: 15,
        reorderQuantity: 30,
        primaryWarehouseId: 'wh-001',
        averageCost: 85.00,
        lastPurchaseCost: 88.00,
        standardCost: 86.00,
        barcode: '1234567890127',
        hazardous: true,
        shelfLife: 365, // 1 year
        specifications: [
          { name: 'Type', value: 'Epoxy', required: true },
          { name: 'Cure Time', value: '24', unit: 'hours', required: true },
          { name: 'Temperature Range', value: '-40 to 120', unit: '°C', required: true }
        ],
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    // Calculate stock status for each material
    materials.forEach(material => {
      material.stockStatus = calculateStockStatus(material);

      // Generate stock locations
      material.stockLocations = [
        {
          warehouseId: material.primaryWarehouseId || 'wh-001',
          warehouseName: this.getWarehouseName(material.primaryWarehouseId || 'wh-001'),
          binLocation: `A${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 10) + 1}`,
          quantity: material.totalStock || 0,
          reservedQuantity: material.reservedStock || 0,
          availableQuantity: (material.totalStock || 0) - (material.reservedStock || 0),
          lastUpdated: new Date()
        }
      ];
    });

    return materials;
  }

  private getWarehouseName(warehouseId: string): string {
    const warehouseNames: Record<string, string> = {
      'wh-001': 'Main Warehouse',
      'wh-002': 'Site Storage A',
      'wh-003': 'Site Storage B'
    };
    return warehouseNames[warehouseId] || 'Unknown Warehouse';
  }
}
