import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map, finalize, takeUntil, catchError, switchMap } from 'rxjs/operators';
import { materialAssignment } from '../models/work-order.model';
import { WorkOrderService } from '../services/work-order.service';
import { MaterialService } from '../../materials/services/material.service';
import { BaseMaterial, MaterialType, ClientType } from '../../materials/models/material.model';
import { of } from 'rxjs';

export interface WorkOrderMaterialsState {
  materials: materialAssignment[];
  availableMaterials: BaseMaterial[];
  loading: boolean;
  error: string | null;
  filter: {
    materialType?: 'purchasable' | 'receivable';
    status?: string;
    searchTerm?: string;
  };
  workOrderClient?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkOrderMaterialsViewModel {
  // State management
  private stateSubject = new BehaviorSubject<WorkOrderMaterialsState>({
    materials: [],
    availableMaterials: [],
    loading: false,
    error: null,
    filter: {}
  });

  // Expose state as observables
  public state$ = this.stateSubject.asObservable();
  public materials$ = this.state$.pipe(map(state => this.applyFilters(state.materials, state.filter)));
  public loading$ = this.state$.pipe(map(state => state.loading));
  public error$ = this.state$.pipe(map(state => state.error));
  public availableMaterials$ = this.state$.pipe(map(state => state.availableMaterials));
  
  // Material type specific observables
  public purchasableMaterials$ = this.materials$.pipe(
    map(materials => materials.filter(m => m.materialType === 'purchasable'))
  );
  
  public receivableMaterials$ = this.materials$.pipe(
    map(materials => materials.filter(m => m.materialType === 'receivable'))
  );

  // Total cost observable for purchasable materials
  public totalMaterialsCost$ = this.purchasableMaterials$.pipe(
    map(materials => materials.reduce((total, m) => 
      total + (m.purchasableMaterial?.totalCost || 0), 0
    ))
  );

  // Lifecycle management
  private destroy$ = new Subject<void>();
  private currentWorkOrderId: string | null = null;

  constructor(
    private workOrderService: WorkOrderService,
    private materialService: MaterialService
  ) {}

  /**
   * Load materials for a specific work order
   */
  loadMaterialsForWorkOrder(workOrderId: string): void {
    this.currentWorkOrderId = workOrderId;
    this.updateState({ loading: true, error: null });

    // Load work order details to get client information
    this.workOrderService.getWorkOrderById(workOrderId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(workOrder => {
          const client = workOrder?.details.client || '';
          this.updateState({ workOrderClient: client });
          
          // Load materials assigned to this work order
          const materials = workOrder?.materials || [];
          
          // Also load available materials from catalog
          return combineLatest([
            of(materials),
            this.loadAvailableMaterials(client)
          ]);
        }),
        finalize(() => this.updateState({ loading: false })),
        catchError(error => {
          console.error('Error loading materials:', error);
          this.updateState({ error: 'Failed to load materials' });
          return of([[], []]);
        })
      )
      .subscribe(([materials, availableMaterials]) => {
        this.updateState({ 
          materials,
          availableMaterials
        });
      });
  }

  /**
   * Load available materials from catalog based on client
   */
  private loadAvailableMaterials(client: string): Observable<BaseMaterial[]> {
    // Load all materials - the dialog will filter by material type
    // For receivable materials, the dialog will further filter by client type
    return this.materialService.loadMaterials();
  }

  /**
   * Get filtered available materials by type
   */
  getAvailableMaterialsByType(materialType: 'purchasable' | 'receivable'): Observable<BaseMaterial[]> {
    return this.availableMaterials$.pipe(
      map(materials => materials.filter(m => m.materialType === materialType))
    );
  }

  /**
   * Assign a material to the work order
   */
  assignMaterial(dialogResult: any): Observable<boolean> {
    if (!this.currentWorkOrderId) return of(false);

    const material = dialogResult.material;
    const quantity = dialogResult.quantity;
    const additionalInfo = dialogResult.additionalInfo;

    const newAssignment: materialAssignment = {
      id: `mat_${Date.now()}`,
      materialType: material.materialType as 'purchasable' | 'receivable',
      assignDate: new Date(),
      assignedBy: 'Current User', // TODO: Get from auth service
      workOrderNumber: this.currentWorkOrderId
    };

    // Create the appropriate material object based on type
    if (material.materialType === MaterialType.PURCHASABLE || material.materialType === 'purchasable') {
      newAssignment.purchasableMaterial = {
        id: material.id || `pmat_${Date.now()}`,
        name: material.description,
        description: material.description,
        quantity: quantity,
        unit: material.unit,
        unitCost: additionalInfo?.unitCost || 0,
        totalCost: quantity * (additionalInfo?.unitCost || 0),
        status: 'pending',
        supplier: additionalInfo?.supplier || '',
        orderDate: additionalInfo?.orderDate,
        deliveryDate: additionalInfo?.deliveryDate
      };
    } else {
      newAssignment.receivableMaterial = {
        id: material.id || `rmat_${Date.now()}`,
        name: material.description,
        description: material.description,
        unit: material.unit,
        estimatedQuantity: quantity,
        status: 'pending'
      };
    }

    return this.workOrderService.assignMaterial(this.currentWorkOrderId, newAssignment)
      .pipe(
        map(success => {
          if (success) {
            const materials = [...this.getCurrentState().materials, newAssignment];
            this.updateState({ materials });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error assigning material:', error);
          this.updateState({ error: 'Failed to assign material' });
          return of(false);
        })
      );
  }

  /**
   * Update material assignment
   */
  updateMaterialAssignment(assignmentId: string, updates: Partial<materialAssignment>): Observable<boolean> {
    if (!this.currentWorkOrderId) return of(false);

    return this.workOrderService.updateMaterialAssignment(this.currentWorkOrderId, assignmentId, updates)
      .pipe(
        map(success => {
          if (success) {
            const materials = this.getCurrentState().materials.map(m =>
              m.id === assignmentId ? { ...m, ...updates } : m
            );
            this.updateState({ materials });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error updating material assignment:', error);
          this.updateState({ error: 'Failed to update material assignment' });
          return of(false);
        })
      );
  }

  /**
   * Remove material assignment
   */
  removeMaterialAssignment(assignmentId: string): Observable<boolean> {
    if (!this.currentWorkOrderId) return of(false);

    return this.workOrderService.removeMaterialAssignment(this.currentWorkOrderId, assignmentId)
      .pipe(
        map(success => {
          if (success) {
            const materials = this.getCurrentState().materials.filter(
              m => m.id !== assignmentId
            );
            this.updateState({ materials });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error removing material assignment:', error);
          this.updateState({ error: 'Failed to remove material assignment' });
          return of(false);
        })
      );
  }

  /**
   * Update material status
   */
  updateMaterialStatus(assignmentId: string, status: string): Observable<boolean> {
    const material = this.getCurrentState().materials.find(m => m.id === assignmentId);
    if (!material) return of(false);

    const updates: Partial<materialAssignment> = { ...material };
    
    if (material.materialType === 'purchasable' && material.purchasableMaterial) {
      updates.purchasableMaterial = {
        ...material.purchasableMaterial,
        status: status as 'pending' | 'ordered' | 'delivered' | 'in-use' | 'used'
      };
    } else if (material.materialType === 'receivable' && material.receivableMaterial) {
      updates.receivableMaterial = {
        ...material.receivableMaterial,
        status: status as 'pending' | 'ordered' | 'received' | 'used'
      };
    }

    return this.updateMaterialAssignment(assignmentId, updates);
  }

  /**
   * Update filters
   */
  updateFilters(filters: Partial<WorkOrderMaterialsState['filter']>): void {
    const currentState = this.getCurrentState();
    this.updateState({
      filter: {
        ...currentState.filter,
        ...filters
      }
    });
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.updateState({ filter: {} });
  }

  /**
   * Apply filters to materials
   */
  private applyFilters(
    materials: materialAssignment[],
    filter: WorkOrderMaterialsState['filter']
  ): materialAssignment[] {
    let filtered = [...materials];

    // Filter by material type
    if (filter.materialType) {
      filtered = filtered.filter(m => m.materialType === filter.materialType);
    }

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter(m => {
        if (m.materialType === 'purchasable' && m.purchasableMaterial) {
          return m.purchasableMaterial.status === filter.status;
        } else if (m.materialType === 'receivable' && m.receivableMaterial) {
          return m.receivableMaterial.status === filter.status;
        }
        return false;
      });
    }

    // Filter by search term
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(m => {
        const name = m.purchasableMaterial?.name || m.receivableMaterial?.name || '';
        const description = m.purchasableMaterial?.description || m.receivableMaterial?.description || '';
        return name.toLowerCase().includes(term) || description.toLowerCase().includes(term);
      });
    }

    // Sort by assign date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.assignDate).getTime();
      const dateB = new Date(b.assignDate).getTime();
      return dateB - dateA;
    });

    return filtered;
  }

  /**
   * Get current state
   */
  private getCurrentState(): WorkOrderMaterialsState {
    return this.stateSubject.getValue();
  }

  /**
   * Update state
   */
  private updateState(partialState: Partial<WorkOrderMaterialsState>): void {
    this.stateSubject.next({
      ...this.getCurrentState(),
      ...partialState
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentWorkOrderId = null;
  }
} 