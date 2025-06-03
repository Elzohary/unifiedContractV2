import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, delay, switchMap } from 'rxjs/operators';
import { MaterialService } from './material.service';
import { MaterialIntegrationService } from './material-integration.service';
import { BaseMaterial, StockStatus, calculateStockStatus } from '../models/material.model';
import { MaterialInventory, StockAdjustment, MaterialMovement } from '../models/inventory.model';
import { StockAdjustmentResult } from '../components/dialogs/stock-adjustment-dialog/stock-adjustment-dialog.component';
import { MaterialRequisitionResult } from '../components/dialogs/material-requisition-dialog/material-requisition-dialog.component';

export interface MaterialRequisition {
  id: string;
  requestNumber: string;
  requestType: 'work-order' | 'maintenance' | 'general';
  workOrderId?: string;
  workOrderNumber?: string;
  requestedBy: string;
  requestedByName: string;
  requestDate: Date;
  requiredBy: Date;
  status: 'pending' | 'approved' | 'rejected' | 'partially-fulfilled' | 'fulfilled' | 'cancelled';
  items: RequisitionItem[];
  justification: string;
  totalEstimatedCost: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  approvalRequired: boolean;
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
}

export interface RequisitionItem {
  id: string;
  materialId: string;
  material: BaseMaterial;
  requestedQuantity: number;
  approvedQuantity?: number;
  fulfilledQuantity?: number;
  remainingQuantity?: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'partially-fulfilled';
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface StockAlert {
  id: string;
  type: 'low-stock' | 'out-of-stock' | 'overstocked' | 'expiring' | 'expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  materialId: string;
  materialCode: string;
  materialDescription: string;
  currentStock: number;
  thresholdValue: number;
  message: string;
  actionRequired: string;
  dateDetected: Date;
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
}

export interface MaterialDashboardData {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingRequisitions: number;
  pendingAdjustments: number;
  recentMovements: MaterialMovement[];
  stockAlerts: StockAlert[];
  topUsedMaterials: MaterialUsageSummary[];
  monthlyTrends: MaterialTrend[];
}

export interface MaterialUsageSummary {
  materialId: string;
  materialCode: string;
  materialDescription: string;
  totalUsed: number;
  totalCost: number;
  usageFrequency: number;
  lastUsedDate: Date;
}

export interface MaterialTrend {
  month: string;
  totalValue: number;
  totalMovements: number;
  newMaterials: number;
  lowStockItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialManagementService {
  // State Management
  private requisitionsSubject = new BehaviorSubject<MaterialRequisition[]>([]);
  private adjustmentsSubject = new BehaviorSubject<StockAdjustment[]>([]);
  private alertsSubject = new BehaviorSubject<StockAlert[]>([]);
  private dashboardDataSubject = new BehaviorSubject<MaterialDashboardData | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables
  public requisitions$ = this.requisitionsSubject.asObservable();
  public adjustments$ = this.adjustmentsSubject.asObservable();
  public alerts$ = this.alertsSubject.asObservable();
  public dashboardData$ = this.dashboardDataSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  // Filtered Observables
  public activeAlerts$ = this.alerts$.pipe(
    map(alerts => alerts.filter(alert => alert.isActive))
  );

  public pendingRequisitions$ = this.requisitions$.pipe(
    map(requisitions => requisitions.filter(req => req.status === 'pending'))
  );

  public criticalAlerts$ = this.alerts$.pipe(
    map(alerts => alerts.filter(alert => 
      alert.isActive && (alert.severity === 'high' || alert.severity === 'critical')
    ))
  );

  constructor(
    private materialService: MaterialService,
    private integrationService: MaterialIntegrationService
  ) {
    this.initializeService();
  }

  private initializeService(): void {
    this.loadDashboardData();
    this.loadRequisitions();
    this.loadAdjustments();
    this.loadAlerts();
  }

  /**
   * Process stock adjustment
   */
  processStockAdjustment(adjustmentData: StockAdjustmentResult): Observable<boolean> {
    this.setLoading(true);
    
    const adjustment: StockAdjustment = {
      id: this.generateId(),
      materialId: adjustmentData.materialId,
      warehouseId: 'main-warehouse', // Default warehouse
      adjustmentType: adjustmentData.adjustmentType === 'set-absolute' ? 'increase' : adjustmentData.adjustmentType,
      quantity: adjustmentData.quantity,
      reason: adjustmentData.reason,
      notes: adjustmentData.notes,
      performedBy: adjustmentData.performedBy,
      performedDate: adjustmentData.adjustmentDate,
      status: 'pending'
    };

    return this.materialService.materials$.pipe(
      map(materials => materials.find(m => m.id === adjustmentData.materialId)),
      switchMap(material => {
        if (!material) {
          return throwError(() => new Error('Material not found'));
        }

        // Calculate new stock level
        const currentStock = material.totalStock || 0;
        let newStock = currentStock;
        let actualQuantity = adjustmentData.quantity;

        switch (adjustmentData.adjustmentType) {
          case 'increase':
            newStock = currentStock + adjustmentData.quantity;
            break;
          case 'decrease':
            newStock = Math.max(0, currentStock - adjustmentData.quantity);
            actualQuantity = currentStock - newStock; // Actual decrease amount
            break;
          case 'set-absolute':
            newStock = adjustmentData.quantity;
            actualQuantity = Math.abs(newStock - currentStock);
            adjustment.adjustmentType = newStock > currentStock ? 'increase' : 'decrease';
            break;
        }

        // Update adjustment quantity to actual amount
        adjustment.quantity = actualQuantity;

        // Create movement record
        const movement: MaterialMovement = {
          id: this.generateId(),
          movementNumber: this.generateMovementNumber(),
          materialId: material.id!,
          materialCode: material.code,
          materialDescription: material.description,
          movementType: adjustment.adjustmentType === 'increase' ? 'receipt' : 'issue',
          quantity: actualQuantity,
          unit: material.unit,
          fromLocation: adjustment.adjustmentType === 'increase' ? 
            { type: 'warehouse', id: 'external-adjustment', name: 'Stock Adjustment' } : 
            { type: 'warehouse', id: 'main-warehouse', name: 'Main Warehouse' },
          toLocation: adjustment.adjustmentType === 'increase' ? 
            { type: 'warehouse', id: 'main-warehouse', name: 'Main Warehouse' } : 
            { type: 'warehouse', id: 'external-adjustment', name: 'Stock Adjustment' },
          relatedEntity: {
            type: 'adjustment',
            id: adjustment.id,
            reference: `ADJ-${adjustment.id.slice(-6)}`
          },
          performedBy: adjustmentData.performedBy,
          performedByName: adjustmentData.performedBy, // TODO: Get actual name
          performedDate: adjustmentData.adjustmentDate,
          notes: `Stock adjustment: ${adjustmentData.reason}`
        };

        // Save adjustment and movement
        return this.saveAdjustmentAndMovement(adjustment, movement, material, newStock);
      }),
      tap(() => {
        this.refreshData();
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(`Failed to process stock adjustment: ${error.message}`);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Process material requisition
   */
  processRequisition(requisitionData: MaterialRequisitionResult): Observable<MaterialRequisition> {
    this.setLoading(true);

    const requisition: MaterialRequisition = {
      id: this.generateId(),
      requestNumber: this.generateRequisitionNumber(),
      requestType: requisitionData.requestType,
      workOrderId: requisitionData.workOrderId,
      workOrderNumber: requisitionData.workOrderNumber,
      requestedBy: requisitionData.requestedBy,
      requestedByName: requisitionData.requestedBy, // TODO: Get actual name
      requestDate: requisitionData.requestDate,
      requiredBy: requisitionData.requiredBy,
      status: requisitionData.approvalRequired ? 'pending' : 'approved',
      items: requisitionData.items.map((item, index) => ({
        id: `${this.generateId()}-${index}`,
        materialId: item.materialId,
        material: item.material,
        requestedQuantity: item.requestedQuantity,
        urgency: item.urgency,
        status: requisitionData.approvalRequired ? 'pending' : 'approved',
        notes: item.notes,
        estimatedCost: item.estimatedCost
      })),
      justification: requisitionData.justification,
      totalEstimatedCost: requisitionData.totalEstimatedCost,
      urgency: requisitionData.urgency,
      approvalRequired: requisitionData.approvalRequired
    };

    return this.saveRequisition(requisition).pipe(
      tap(() => {
        this.refreshData();
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError(`Failed to process requisition: ${error.message}`);
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Approve requisition
   */
  approveRequisition(requisitionId: string, approvedBy: string, notes?: string): Observable<boolean> {
    const requisitions = this.requisitionsSubject.value;
    const requisition = requisitions.find(r => r.id === requisitionId);
    
    if (!requisition) {
      return throwError(() => new Error('Requisition not found'));
    }

    requisition.status = 'approved';
    requisition.approvedBy = approvedBy;
    requisition.approvedDate = new Date();
    if (notes) requisition.notes = notes;

    // Update all items to approved
    requisition.items.forEach(item => {
      item.status = 'approved';
      item.approvedQuantity = item.requestedQuantity;
      item.remainingQuantity = item.requestedQuantity;
    });

    this.requisitionsSubject.next([...requisitions]);
    return of(true).pipe(delay(500));
  }

  /**
   * Generate stock alerts
   */
  generateStockAlerts(): Observable<StockAlert[]> {
    return this.materialService.materials$.pipe(
      map(materials => {
        const alerts: StockAlert[] = [];

        materials.forEach(material => {
          const stock = material.totalStock || 0;
          const stockStatus = calculateStockStatus(material);

          // Low stock alert
          if (stockStatus === StockStatus.LOW_STOCK) {
            alerts.push({
              id: `low-stock-${material.id}`,
              type: 'low-stock',
              severity: stock === 0 ? 'critical' : 'high',
              materialId: material.id!,
              materialCode: material.code,
              materialDescription: material.description,
              currentStock: stock,
              thresholdValue: material.minimumStock || material.reorderPoint || 0,
              message: `Low stock: ${stock} ${material.unit} remaining`,
              actionRequired: 'Reorder required',
              dateDetected: new Date(),
              isActive: true
            });
          }

          // Out of stock alert
          if (stockStatus === StockStatus.OUT_OF_STOCK) {
            alerts.push({
              id: `out-of-stock-${material.id}`,
              type: 'out-of-stock',
              severity: 'critical',
              materialId: material.id!,
              materialCode: material.code,
              materialDescription: material.description,
              currentStock: stock,
              thresholdValue: 0,
              message: 'Out of stock',
              actionRequired: 'Immediate reorder required',
              dateDetected: new Date(),
              isActive: true
            });
          }

          // Overstocked alert
          if (material.maximumStock && stock > material.maximumStock) {
            alerts.push({
              id: `overstocked-${material.id}`,
              type: 'overstocked',
              severity: 'medium',
              materialId: material.id!,
              materialCode: material.code,
              materialDescription: material.description,
              currentStock: stock,
              thresholdValue: material.maximumStock,
              message: `Overstocked: ${stock - material.maximumStock} ${material.unit} over maximum`,
              actionRequired: 'Consider redistribution or promotion',
              dateDetected: new Date(),
              isActive: true
            });
          }
        });

        return alerts;
      }),
      tap(alerts => this.alertsSubject.next(alerts))
    );
  }

  /**
   * Load dashboard data
   */
  loadDashboardData(): Observable<MaterialDashboardData> {
    this.setLoading(true);

    // Simulate API call with mock data
    const mockData: MaterialDashboardData = {
      totalMaterials: 1247,
      totalValue: 2456789.50,
      lowStockItems: 23,
      outOfStockItems: 5,
      pendingRequisitions: 12,
      pendingAdjustments: 3,
      recentMovements: [],
      stockAlerts: [],
      topUsedMaterials: [],
      monthlyTrends: []
    };

    return of(mockData).pipe(
      delay(800),
      tap(data => {
        this.dashboardDataSubject.next(data);
        this.setLoading(false);
      }),
      catchError(error => {
        this.setError('Failed to load dashboard data');
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  // Private helper methods
  private saveAdjustmentAndMovement(
    adjustment: StockAdjustment, 
    movement: MaterialMovement, 
    material: BaseMaterial, 
    newStock: number
  ): Observable<boolean> {
    // In a real implementation, this would call the API
    adjustment.status = 'approved';
    
    const adjustments = this.adjustmentsSubject.value;
    this.adjustmentsSubject.next([adjustment, ...adjustments]);
    
    // Update material stock
    material.totalStock = newStock;
    material.availableStock = newStock - (material.reservedStock || 0);
    
    return of(true).pipe(delay(500));
  }

  private saveRequisition(requisition: MaterialRequisition): Observable<MaterialRequisition> {
    const requisitions = this.requisitionsSubject.value;
    this.requisitionsSubject.next([requisition, ...requisitions]);
    return of(requisition).pipe(delay(500));
  }

  private loadRequisitions(): void {
    // Mock data loading
    const mockRequisitions: MaterialRequisition[] = [];
    this.requisitionsSubject.next(mockRequisitions);
  }

  private loadAdjustments(): void {
    // Mock data loading
    const mockAdjustments: StockAdjustment[] = [];
    this.adjustmentsSubject.next(mockAdjustments);
  }

  private loadAlerts(): void {
    this.generateStockAlerts().subscribe();
  }

  private refreshData(): void {
    this.loadDashboardData().subscribe();
    this.generateStockAlerts().subscribe();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
    if (error) {
      setTimeout(() => this.errorSubject.next(null), 5000);
    }
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  private generateAdjustmentNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `ADJ-${year}${month}-${random}`;
  }

  private generateRequisitionNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `REQ-${year}${month}-${random}`;
  }

  private generateMovementNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `MOV-${year}${month}-${random}`;
  }
} 