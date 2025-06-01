/* eslint-disable @typescript-eslint/no-explicit-any */
// Base Material interface for all types of materials
export interface BaseMaterial {
  id?: string;
  code: string;
  description: string;
  unit: string;
  materialType: MaterialType;
  clientType: ClientType;
  // Dynamic attributes for client-specific properties
  attributes?: Record<string, any>;

  // Inventory fields
  totalStock?: number;
  availableStock?: number;
  reservedStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;

  // Location tracking
  primaryWarehouseId?: string;
  stockLocations?: StockLocation[];

  // Cost tracking
  averageCost?: number;
  lastPurchaseCost?: number;
  standardCost?: number;

  // Additional metadata
  barcode?: string;
  qrCode?: string;
  shelfLife?: number; // in days
  hazardous?: boolean;
  specifications?: MaterialSpecification[];

  // Category management
  categoryId?: string;
  subcategoryId?: string;

  // Tracking fields
  createdAt?: Date;
  updatedAt?: Date;
  lastUsedAt?: Date;
  lastCountedAt?: Date;
}

// Enum for material types
export enum MaterialType {
  RECEIVABLE = 'receivable',
  PURCHASABLE = 'purchasable'
}

// Enum for client types
export enum ClientType {
  SEC = 'sec',
  // Add other clients as needed
  OTHER = 'other'
}

// Stock location interface
export interface StockLocation {
  warehouseId: string;
  warehouseName: string;
  binLocation?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: Date;
}

// Material specification interface
export interface MaterialSpecification {
  name: string;
  value: string;
  unit?: string;
  required?: boolean;
}

// Material category interface
export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level: number;
  path: string[]; // Array of parent category IDs for hierarchy
  customFields?: CategoryCustomField[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Category custom field definition
export interface CategoryCustomField {
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// SEC specific material interface
export interface SecMaterial extends BaseMaterial {
  clientType: ClientType.SEC;
  groupCode: string;
  groupCodeDescription: string;
  SEQ: number;
  materialMasterCode: string;
}

// Helper function to create a SEC material
export function createSecMaterial(data: Omit<SecMaterial, 'clientType' | 'materialType'>): SecMaterial {
  return {
    ...data,
    clientType: ClientType.SEC,
    materialType: MaterialType.RECEIVABLE,
    code: data.materialMasterCode,
  };
}

// Helper function to convert legacy SEC material to new format
export function convertLegacySecMaterial(legacy: {
  groupCode: string;
  groupCodeDescription: string;
  SEQ: number;
  materialMasterCode: string;
  materialDescription: string;
  unit: string;
}): SecMaterial {
  return {
    groupCode: legacy.groupCode,
    groupCodeDescription: legacy.groupCodeDescription,
    SEQ: legacy.SEQ,
    materialMasterCode: legacy.materialMasterCode,
    code: legacy.materialMasterCode,
    description: legacy.materialDescription,
    unit: legacy.unit,
    clientType: ClientType.SEC,
    materialType: MaterialType.RECEIVABLE
  };
}

// Stock status enum
export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ORDERED = 'ordered',
  DISCONTINUED = 'discontinued'
}

// Helper function to calculate stock status
export function calculateStockStatus(material: BaseMaterial): StockStatus {
  if (!material.totalStock || material.totalStock === 0) {
    return StockStatus.OUT_OF_STOCK;
  }

  if (material.minimumStock && material.totalStock <= material.minimumStock) {
    return StockStatus.LOW_STOCK;
  }

  if (material.reorderPoint && material.totalStock <= material.reorderPoint) {
    return StockStatus.LOW_STOCK;
  }

  return StockStatus.IN_STOCK;
}

// Helper function to check if material needs reordering
export function needsReorder(material: BaseMaterial): boolean {
  if (!material.reorderPoint || !material.totalStock) {
    return false;
  }
  return material.totalStock <= material.reorderPoint;
}
