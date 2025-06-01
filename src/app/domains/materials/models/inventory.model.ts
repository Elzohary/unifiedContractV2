export interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  type: 'main' | 'site' | 'site-storage' | 'temporary';
  capacity?: number;
  currentUtilization?: number;
  managerId: string;
  managerName: string;
}

export interface WarehouseAvailability {
  warehouseId: string;
  available: number;
  reserved: number;
  inTransit?: number;
  lastUpdated: Date;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  totalAvailable: number;
  warehouseAvailability: WarehouseAvailability[];
  lastUpdated: Date;
}

export interface StockReservation {
  id: string;
  reservedFor: {
    type: 'work-order' | 'activity' | 'project' | 'maintenance-schedule';
    id: string;
    reference: string;
  };
  quantity: number;
  reservedBy: string;
  reservedDate: Date;
  expectedUsageDate?: Date;
  status: 'active' | 'used' | 'cancelled' | 'expired';
}

export interface MaterialMovement {
  id: string;
  movementNumber: string;
  materialId: string;
  materialCode: string;
  materialDescription: string;
  movementType: 'receipt' | 'issue' | 'transfer' | 'return' | 'write-off';
  quantity: number;
  unit: string;
  fromLocation?: {
    type: 'warehouse' | 'site' | 'work-order' | 'employee';
    id: string;
    name: string;
  };
  toLocation: {
    type: 'warehouse' | 'site' | 'work-order' | 'employee';
    id: string;
    name: string;
  };
  relatedEntity: {
    type: string;
    id: string;
    reference: string;
  };
  performedBy: string;
  performedByName: string;
  performedDate: Date;
  notes?: string;
  totalCost?: number;
  unitCost?: number;
}

export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  binLocation?: string;
  lastUpdated: Date;
  reservations?: StockReservation[];
}

export interface MaterialInventory {
  materialId: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  inTransitQuantity?: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  warehouseStocks: WarehouseStock[];
  valuation: {
    method: 'Average' | 'FIFO' | 'LIFO';
    currentValue: number;
    currency: string;
  };
  lastStockTakeDate: Date;
  lastMovementDate: Date;
}

export interface StockAdjustment {
  id: string;
  materialId: string;
  warehouseId: string;
  adjustmentType: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  notes?: string;
  performedBy: string;
  performedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  status: 'pending' | 'approved' | 'rejected';
  attachments?: { fileUrl: string; description: string }[];
}
