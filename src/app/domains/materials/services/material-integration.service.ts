import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, switchMap, delay } from 'rxjs/operators';
import { MaterialUsageRecord, MaterialAllocation, UsageAlert } from '../models/usage-tracking.model';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StockReservation, MaterialMovement, AvailabilityResult, WarehouseAvailability } from '../models/inventory.model';
import { MaterialService } from './material.service';
import { MaterialDataService } from './material-data.service';

export interface MaterialUsageRequest {
  materialId: string;
  quantity: number;
  usageType: 'consumption' | 'installation' | 'wastage' | 'return' | 'damage' | 'transfer';
  entityType: 'work-order' | 'expense' | 'manpower' | 'activity' | 'issue' | 'action' | 'maintenance';
  entityId: string;
  entityReference: string;
  locationId: string;
  userId: string;
  notes?: string;
  attachments?: { fileUrl: string; description: string }[];
}

export interface MaterialReservation {
  materialId: string;
  quantity: number;
  entityType: 'work-order' | 'activity' | 'project' | 'maintenance-schedule';
  entityId: string;
  entityReference: string;
  expectedUsageDate?: Date;
  warehouseId?: string;
  notes?: string;
}

export interface UsageFilters {
  entityType?: string;
  entityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  usageType?: string;
  locationId?: string;
}

interface MaterialSummaryItem {
  materialId: string;
  materialCode: string;
  description: string;
  totalQuantity: number;
  totalCost: number;
  lastUsageDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialIntegrationService {
  private usageRecords$ = new BehaviorSubject<MaterialUsageRecord[]>([]);
  private movements$ = new BehaviorSubject<MaterialMovement[]>([]);
  private alerts$ = new BehaviorSubject<UsageAlert[]>([]);

  constructor(
    private materialService: MaterialService,
    private materialDataService: MaterialDataService
  ) {
    this.initializeService();
  }

  private initializeService(): void {
    // Load initial data
    this.loadUsageRecords();
    this.loadMovements();
    this.checkForAlerts();
  }

  /**
   * Track material usage across all entities
   */
  trackMaterialUsage(usage: MaterialUsageRequest): Observable<MaterialMovement> {
    console.log('[MaterialIntegration] Tracking material usage:', usage);

    // First check availability
    return this.checkAvailability(usage.materialId, usage.quantity).pipe(
      switchMap(availability => {
        if (!availability.isAvailable && usage.usageType !== 'return') {
          throw new Error(`Insufficient material quantity. Available: ${availability.totalAvailable}, Requested: ${usage.quantity}`);
        }

        // Create movement record
        const movement: MaterialMovement = {
          id: this.generateId(),
          movementNumber: this.generateMovementNumber(),
          materialId: usage.materialId,
          materialCode: '', // Will be filled from material data
          materialDescription: '', // Will be filled from material data
          movementType: this.mapUsageTypeToMovementType(usage.usageType),
          quantity: usage.quantity,
          unit: '', // Will be filled from material data
          toLocation: {
            type: this.mapEntityTypeToLocationType(usage.entityType),
            id: usage.entityId,
            name: usage.entityReference
          },
          relatedEntity: {
            type: usage.entityType,
            id: usage.entityId,
            reference: usage.entityReference
          },
          performedBy: usage.userId,
          performedByName: '', // Should be filled from user service
          performedDate: new Date(),
          notes: usage.notes
        };

        // Save movement and update inventory
        return this.saveMovementAndUpdateInventory(movement);
      })
    );
  }

  /**
   * Check material availability before assignment
   */
  checkAvailability(materialId: string, quantity: number): Observable<AvailabilityResult> {
    console.log(`[MaterialIntegration] Checking availability for material ${materialId}, quantity: ${quantity}`);

    // Mock implementation - replace with real API call
    const mockResult: AvailabilityResult = {
      isAvailable: true,
      totalAvailable: 500,
      warehouseAvailability: [
        {
          warehouseId: 'wh-001',
          available: 300,
          reserved: 50,
          inTransit: 20,
          lastUpdated: new Date()
        },
        {
          warehouseId: 'wh-002',
          available: 150,
          reserved: 30,
          lastUpdated: new Date()
        },
        {
          warehouseId: 'wh-003',
          available: 50,
          reserved: 10,
          lastUpdated: new Date()
        }
      ],
      lastUpdated: new Date()
    };

    // Simulate API delay
    return of(mockResult).pipe(delay(500));
  }

  /**
   * Reserve materials for future use
   */
  reserveMaterial(reservation: MaterialReservation): Observable<boolean> {
    console.log('[MaterialIntegration] Creating material reservation:', reservation);

    return this.checkAvailability(reservation.materialId, reservation.quantity).pipe(
      switchMap(availability => {
        if (!availability.isAvailable) {
          throw new Error('Insufficient quantity for reservation');
        }

        const stockReservation: StockReservation = {
          id: this.generateId(),
          reservedFor: {
            type: reservation.entityType,
            id: reservation.entityId,
            reference: reservation.entityReference
          },
          quantity: reservation.quantity,
          reservedBy: 'current-user', // Should get from auth service
          reservedDate: new Date(),
          expectedUsageDate: reservation.expectedUsageDate,
          status: 'active'
        };

        // Save reservation
        return this.saveReservation(stockReservation);
      })
    );
  }

  /**
   * Get material usage history across all entities
   */
  getMaterialHistory(materialId: string, filters?: UsageFilters): Observable<MaterialMovement[]> {
    console.log(`[MaterialIntegration] Getting material history for ${materialId}`, filters);

    return this.movements$.pipe(
      map(movements => {
        let filtered = movements.filter(m => m.materialId === materialId);

        if (filters) {
          if (filters.entityType) {
            filtered = filtered.filter(m => m.relatedEntity.type === filters.entityType);
          }
          if (filters.entityId) {
            filtered = filtered.filter(m => m.relatedEntity.id === filters.entityId);
          }
          if (filters.dateFrom) {
            filtered = filtered.filter(m => new Date(m.performedDate) >= filters.dateFrom!);
          }
          if (filters.dateTo) {
            filtered = filtered.filter(m => new Date(m.performedDate) <= filters.dateTo!);
          }
          if (filters.usageType) {
            filtered = filtered.filter(m => m.movementType === filters.usageType);
          }
          if (filters.locationId) {
            filtered = filtered.filter(m =>
              m.fromLocation?.id === filters.locationId ||
              m.toLocation?.id === filters.locationId
            );
          }
        }

        // Sort by date descending
        return filtered.sort((a, b) =>
          new Date(b.performedDate).getTime() - new Date(a.performedDate).getTime()
        );
      })
    );
  }

  /**
   * Get all usage records for analytics
   */
  getUsageRecords(): Observable<MaterialUsageRecord[]> {
    return this.usageRecords$.asObservable();
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Observable<UsageAlert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(a => a.status !== 'resolved' && a.status !== 'false-alarm'))
    );
  }

  /**
   * Create allocation for planned usage
   */
  createAllocation(allocation: MaterialAllocation): Observable<MaterialAllocation> {
    console.log('[MaterialIntegration] Creating material allocation:', allocation);

    // Mock implementation
    const newAllocation = {
      ...allocation,
      id: this.generateId(),
      allocationNumber: this.generateAllocationNumber(),
      allocationDate: new Date(),
      status: 'active' as const,
      consumedQuantity: 0,
      remainingQuantity: allocation.quantity
    };

    return of(newAllocation);
  }

  /**
   * Update allocation when material is consumed
   */
  consumeAllocation(allocationId: string, quantity: number): Observable<MaterialAllocation> {
    console.log(`[MaterialIntegration] Consuming ${quantity} from allocation ${allocationId}`);

    // Mock implementation - should update the actual allocation
    return of({} as MaterialAllocation);
  }

  /**
   * Check for unusual usage patterns and create alerts
   */
  private checkForAlerts(): void {
    // Mock implementation - should analyze usage patterns
    const mockAlert: UsageAlert = {
      id: this.generateId(),
      alertType: 'unusual-usage',
      severity: 'medium',
      materialId: 'mat-001',
      materialCode: 'MAT-001',
      description: 'Unusual usage pattern detected',
      detectedDate: new Date(),
      context: {
        expectedValue: 100,
        actualValue: 250,
        deviation: 150,
        location: 'Site A',
        entity: 'WO-2024-001'
      },
      status: 'new'
    };

    this.alerts$.next([mockAlert]);
  }

  /**
   * Get material usage summary for a specific entity
   */
  getEntityMaterialSummary(entityType: string, entityId: string): Observable<MaterialSummaryItem[]> {
    return this.getMaterialHistory('', { entityType, entityId }).pipe(
      map(movements => {
        const summary = new Map<string, MaterialSummaryItem>();

        movements.forEach(movement => {
          const existing = summary.get(movement.materialId) || {
            materialId: movement.materialId,
            materialCode: movement.materialCode,
            description: movement.materialDescription,
            totalQuantity: 0,
            totalCost: 0,
            lastUsageDate: movement.performedDate
          };

          existing.totalQuantity += movement.quantity;
          existing.totalCost += movement.totalCost || 0;
          if (new Date(movement.performedDate) > new Date(existing.lastUsageDate)) {
            existing.lastUsageDate = movement.performedDate;
          }

          summary.set(movement.materialId, existing);
        });

        return Array.from(summary.values());
      })
    );
  }

  // Helper methods

  private mapUsageTypeToMovementType(usageType: string): MaterialMovement['movementType'] {
    const mapping: Record<string, MaterialMovement['movementType']> = {
      'consumption': 'issue',
      'installation': 'issue',
      'wastage': 'write-off',
      'return': 'return',
      'damage': 'write-off',
      'transfer': 'transfer'
    };
    return mapping[usageType] || 'issue';
  }

  private mapEntityTypeToLocationType(entityType: string): 'warehouse' | 'site' | 'work-order' | 'employee' {
    const mapping: Record<string, 'warehouse' | 'site' | 'work-order' | 'employee'> = {
      'work-order': 'work-order',
      'manpower': 'employee',
      'activity': 'site',
      'maintenance': 'site'
    };
    return mapping[entityType] || 'site';
  }

  private saveMovementAndUpdateInventory(movement: MaterialMovement): Observable<MaterialMovement> {
    // Mock implementation - should save to backend
    const currentMovements = this.movements$.value;
    this.movements$.next([...currentMovements, movement]);
    return of(movement);
  }

  private saveReservation(reservation: StockReservation): Observable<boolean> {
    // Mock implementation - should save to backend
    console.log('[MaterialIntegration] Saving reservation:', reservation);
    return of(true);
  }

  private loadUsageRecords(): void {
    // Mock implementation - should load from backend
    this.usageRecords$.next([]);
  }

  private loadMovements(): void {
    // Mock implementation - should load from backend
    this.movements$.next([]);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMovementNumber(): string {
    return `MOV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }

  private generateAllocationNumber(): string {
    return `ALLOC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }
}
