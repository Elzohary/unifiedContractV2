import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { MaterialMovement, StockAdjustment } from '../../models/inventory.model';

export interface MovementFilter {
  searchTerm?: string;
  warehouseId?: string;
  movementType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'date' | 'material' | 'quantity' | 'type';
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementsViewModel {
  // State
  private movementsSubject = new BehaviorSubject<MaterialMovement[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private filtersSubject = new BehaviorSubject<MovementFilter>({});

  // Observables
  public movements$ = this.movementsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();

  // Filtered movements
  public filteredMovements$ = this.movements$.pipe(
    map(movements => this.applyFilters(movements, this.filtersSubject.value))
  );

  // Mock data flag
  private useMockData = true;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.loadMovements();
  }

  /**
   * Load material movements
   */
  public loadMovements(limit = 50): void {
    this.loadingSubject.next(true);

    if (this.useMockData) {
      const mockMovements = this.generateMockMovements(limit);
      of(mockMovements).pipe(
        delay(400),
        tap(movements => {
          this.movementsSubject.next(movements);
          this.loadingSubject.next(false);
        }),
        catchError(() => {
          this.errorSubject.next('Failed to load movements');
          this.loadingSubject.next(false);
          return of([]);
        })
      ).subscribe();
    } else {
      this.errorSubject.next('API not implemented yet');
      this.loadingSubject.next(false);
    }
  }

  /**
   * Record a stock adjustment
   */
  public recordStockAdjustment(adjustment: Omit<StockAdjustment, 'id'>): Observable<boolean> {
    this.loadingSubject.next(true);

    if (this.useMockData) {
      return of(true).pipe(
        delay(1000),
        tap(() => {
          // Add a corresponding movement record
          const newMovement: MaterialMovement = {
            id: `mov-${Date.now()}`,
            movementNumber: `ADJ-${Date.now()}`,
            materialId: adjustment.materialId,
            materialCode: `MTL-${adjustment.materialId}`,
            materialDescription: 'Material Description',
            movementType: 'write-off',
            quantity: adjustment.quantity,
            unit: 'pcs',
            toLocation: {
              type: 'warehouse',
              id: adjustment.warehouseId,
              name: 'Warehouse'
            },
            relatedEntity: {
              type: 'adjustment',
              id: `adj-${Date.now()}`,
              reference: `Stock Adjustment`
            },
            performedBy: adjustment.performedBy,
            performedByName: 'User Name',
            performedDate: adjustment.performedDate,
            notes: adjustment.notes
          };

          const currentMovements = this.movementsSubject.value;
          this.movementsSubject.next([newMovement, ...currentMovements]);
          this.loadingSubject.next(false);
        }),
        catchError(() => {
          this.errorSubject.next('Failed to record stock adjustment');
          this.loadingSubject.next(false);
          return of(false);
        })
      );
    } else {
      return of(false);
    }
  }

  /**
   * Update movement filters
   */
  public updateFilters(filters: Partial<MovementFilter>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this.filtersSubject.next({});
  }

  /**
   * Apply filters to movements
   */
  private applyFilters(movements: MaterialMovement[], filters: MovementFilter): MaterialMovement[] {
    let filtered = [...movements];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(movement =>
        movement.materialCode.toLowerCase().includes(searchLower) ||
        movement.materialDescription.toLowerCase().includes(searchLower) ||
        movement.movementNumber.toLowerCase().includes(searchLower)
      );
    }

    // Warehouse filter
    if (filters.warehouseId) {
      filtered = filtered.filter(movement =>
        movement.fromLocation?.id === filters.warehouseId ||
        movement.toLocation.id === filters.warehouseId
      );
    }

    // Movement type filter
    if (filters.movementType) {
      filtered = filtered.filter(movement => movement.movementType === filters.movementType);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(movement => 
        movement.performedDate >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(movement => 
        movement.performedDate <= filters.dateTo!
      );
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'date':
            comparison = a.performedDate.getTime() - b.performedDate.getTime();
            break;
          case 'material':
            comparison = a.materialCode.localeCompare(b.materialCode);
            break;
          case 'quantity':
            comparison = a.quantity - b.quantity;
            break;
          case 'type':
            comparison = a.movementType.localeCompare(b.movementType);
            break;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }

  /**
   * Generate mock movements
   */
  private generateMockMovements(count: number): MaterialMovement[] {
    const movements: MaterialMovement[] = [];
    const movementTypes = ['receipt', 'issue', 'transfer', 'return', 'write-off'] as const;
    const warehouseNames = ['Main Warehouse', 'Site Storage A', 'Site Storage B', 'Secondary Warehouse'];
    
    for (let i = 0; i < count; i++) {
      const fromWarehouseIndex = Math.floor(Math.random() * warehouseNames.length);
      let toWarehouseIndex = Math.floor(Math.random() * warehouseNames.length);
      
      // Ensure different warehouses for transfers
      if (toWarehouseIndex === fromWarehouseIndex) {
        toWarehouseIndex = (toWarehouseIndex + 1) % warehouseNames.length;
      }

      movements.push({
        id: `mov-${String(i + 1).padStart(3, '0')}`,
        movementNumber: `MV-2024-${String(i + 1).padStart(4, '0')}`,
        materialId: `mat-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
        materialCode: `MTL-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
        materialDescription: `Material Description ${i + 1}`,
        movementType: movementTypes[Math.floor(Math.random() * movementTypes.length)],
        quantity: Math.floor(Math.random() * 100) + 1,
        unit: ['pcs', 'kg', 'm', 'box', 'liter'][Math.floor(Math.random() * 5)],
        fromLocation: {
          type: 'warehouse',
          id: `wh-${String(fromWarehouseIndex + 1).padStart(3, '0')}`,
          name: warehouseNames[fromWarehouseIndex]
        },
        toLocation: {
          type: 'warehouse',
          id: `wh-${String(toWarehouseIndex + 1).padStart(3, '0')}`,
          name: warehouseNames[toWarehouseIndex]
        },
        relatedEntity: {
          type: Math.random() > 0.5 ? 'work-order' : 'project',
          id: `entity-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
          reference: `REF-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}`
        },
        performedBy: `user-${Math.floor(Math.random() * 10) + 1}`,
        performedByName: `User ${Math.floor(Math.random() * 10) + 1}`,
        performedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        notes: Math.random() > 0.7 ? `Notes for movement ${i + 1}` : undefined,
        totalCost: Math.random() * 1000,
        unitCost: Math.random() * 100
      });
    }

    return movements.sort((a, b) => b.performedDate.getTime() - a.performedDate.getTime());
  }
} 