// Procurement Models for supplier and purchase order management

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: 'manufacturer' | 'distributor' | 'retailer' | 'service-provider';
  status: 'active' | 'inactive' | 'blocked';

  // Contact information
  contact: {
    primaryContact: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
  };

  // Business information
  businessInfo: {
    taxId: string;
    registrationNumber: string;
    website?: string;
    establishedDate?: Date;
  };

  // Financial terms
  paymentTerms: {
    creditLimit: number;
    paymentDays: number;
    currency: string;
    discountPercentage?: number;
    discountDays?: number;
  };

  // Performance metrics
  performance: {
    onTimeDeliveryRate: number;
    qualityRating: number;
    responseTime: number; // in hours
    totalOrders: number;
    totalValue: number;
  };

  // Materials supplied
  materials: SuppliedMaterial[];

  // Certifications
  certifications?: Certification[];

  // Additional info
  notes?: string;
  createdDate: Date;
  lastUpdated: Date;
}

export interface SuppliedMaterial {
  materialId: string;
  materialCode: string;
  materialDescription: string;
  supplierCode?: string; // Supplier's material code
  unitPrice: number;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  lastPurchaseDate?: Date;
  lastPurchasePrice?: number;
}

export interface Certification {
  id: string;
  type: string;
  name: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate: Date;
  documentUrl?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: Date;

  // Supplier information
  supplier: {
    id: string;
    name: string;
    contact: string;
  };

  // Order details
  status: 'draft' | 'submitted' | 'confirmed' | 'partially-delivered' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Delivery information
  deliveryTerms: {
    expectedDate: Date;
    address: string;
    warehouseId?: string;
    warehouseName?: string;
    specialInstructions?: string;
  };

  // Items
  items: PurchaseOrderItem[];

  // Financial summary
  financial: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
  };

  // Payment
  paymentTerms: string;
  paymentStatus: 'pending' | 'partially-paid' | 'paid';

  // Related entities
  relatedTo?: {
    type: 'work-order' | 'requisition' | 'project';
    id: string;
    reference: string;
  };

  // Approval workflow
  approvals: PurchaseApproval[];

  // Tracking
  createdBy: string;
  createdDate: Date;
  lastUpdated: Date;

  // Deliveries
  deliveries?: PurchaseDelivery[];

  // Documents
  attachments?: PurchaseDocument[];
}

export interface PurchaseOrderItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialDescription: string;
  supplierCode?: string;

  // Quantities
  orderedQuantity: number;
  deliveredQuantity: number;
  pendingQuantity: number;
  unit: string;

  // Pricing
  unitPrice: number;
  discountPercentage?: number;
  taxPercentage: number;
  lineTotal: number;

  // Delivery
  expectedDeliveryDate: Date;
  notes?: string;
}

export interface PurchaseApproval {
  level: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: Date;
  comments?: string;
  amountLimit?: number; // Approval limit for this level
}

export interface PurchaseDelivery {
  id: string;
  deliveryNumber: string;
  deliveryDate: Date;
  receivedBy: string;
  receivedByName: string;

  // Items received
  items: DeliveryItem[];

  // Quality check
  qualityCheck: {
    performed: boolean;
    performedBy?: string;
    date?: Date;
    status?: 'passed' | 'failed' | 'partial-pass';
    notes?: string;
  };

  // Documents
  deliveryNote?: string;
  invoiceNumber?: string;
  attachments?: PurchaseDocument[];

  // Warehouse details
  warehouse: {
    id: string;
    name: string;
    locations: DeliveryLocation[];
  };
}

export interface DeliveryItem {
  purchaseOrderItemId: string;
  materialId: string;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity?: number;
  rejectionReason?: string;
  batchNumber?: string;
  expiryDate?: Date;
}

export interface DeliveryLocation {
  materialId: string;
  binLocation: string;
  quantity: number;
}

export interface PurchaseDocument {
  id: string;
  type: 'purchase-order' | 'confirmation' | 'delivery-note' | 'invoice' | 'quality-certificate' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedDate: Date;
  description?: string;
}

export interface SupplierEvaluation {
  id: string;
  supplierId: string;
  evaluationPeriod: {
    startDate: Date;
    endDate: Date;
  };

  // Performance metrics
  metrics: {
    onTimeDelivery: {
      score: number; // 0-100
      totalDeliveries: number;
      onTimeCount: number;
    };
    quality: {
      score: number; // 0-100
      totalItems: number;
      acceptedItems: number;
      rejectedItems: number;
    };
    pricing: {
      score: number; // 0-100
      competitiveness: 'below-market' | 'market' | 'above-market';
      priceStability: number; // percentage variance
    };
    service: {
      score: number; // 0-100
      responseTime: number; // average hours
      issueResolution: number; // percentage resolved
    };
  };

  // Overall rating
  overallScore: number;
  recommendation: 'preferred' | 'approved' | 'conditional' | 'not-recommended';

  // Comments and action items
  comments?: string;
  actionItems?: string[];

  // Evaluation details
  evaluatedBy: string;
  evaluatedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
}

export interface PriceQuotation {
  id: string;
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;

  // Supplier
  supplier: {
    id: string;
    name: string;
  };

  // Request details
  requestedBy: string;
  purpose?: string;

  // Items
  items: QuotationItem[];

  // Status
  status: 'requested' | 'received' | 'under-review' | 'accepted' | 'rejected' | 'expired';

  // Comparison
  isSelected?: boolean;
  selectionReason?: string;

  // Documents
  attachments?: PurchaseDocument[];
}

export interface QuotationItem {
  materialId: string;
  materialCode: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  notes?: string;
}
