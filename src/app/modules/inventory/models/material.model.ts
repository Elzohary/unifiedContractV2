export interface Material {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  unit: string;
  quantity: number;
  minimumQuantity: number;
  maximumQuantity: number;
  reorderPoint: number;
  status: MaterialStatus;
  location: string;
  supplier: Supplier;
  purchaseHistory: PurchaseRecord[];
  usageHistory: UsageRecord[];
  specifications: MaterialSpecification;
  documents: MaterialDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  leadTime: number;
  minimumOrder: number;
  paymentTerms: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface PurchaseRecord {
  id: string;
  date: Date;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId: string;
  purchaseOrderNumber: string;
  receivedBy: string;
  notes?: string;
}

export interface UsageRecord {
  id: string;
  date: Date;
  quantity: number;
  workOrderId: string;
  usedBy: string;
  location: string;
  notes?: string;
}

export interface MaterialSpecification {
  dimensions?: string;
  weight?: string;
  color?: string;
  grade?: string;
  composition?: string;
  shelfLife?: string;
  storageConditions?: string;
  safetyInformation?: string[];
}

export interface MaterialDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadDate: Date;
  expiryDate?: Date;
}

export enum MaterialStatus {
  Available = 'available',
  LowStock = 'low_stock',
  OutOfStock = 'out_of_stock',
  OnOrder = 'on_order',
  Discontinued = 'discontinued'
}

export enum DocumentType {
  MSDS = 'msds',
  Certificate = 'certificate',
  Specification = 'specification',
  Other = 'other'
} 