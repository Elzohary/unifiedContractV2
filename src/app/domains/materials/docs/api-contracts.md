# Materials Management System - API Contracts

## Overview
This document defines the RESTful API contracts for the Materials Management System. All endpoints follow REST conventions and return JSON responses.

## Base URL
```
/api/v1/materials
```

## Authentication
All endpoints require authentication using Bearer tokens:
```
Authorization: Bearer <token>
```

## Common Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

## Material Catalog Endpoints

### Get Materials List
```
GET /api/v1/materials
```

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search term for code/description
- `type` (string): Filter by material type (purchasable/receivable)
- `clientType` (string): Filter by client type (sec/other)
- `sortBy` (string): Sort field (code/description/unit)
- `sortOrder` (string): Sort order (asc/desc)

Response:
```typescript
{
  success: true,
  data: BaseMaterial[],
  meta: {
    pagination: {
      page: 1,
      limit: 20,
      total: 150,
      totalPages: 8
    }
  }
}
```

### Get Material Details
```
GET /api/v1/materials/:materialId
```

Response:
```typescript
{
  success: true,
  data: {
    material: BaseMaterial,
    inventory: MaterialInventory,
    recentMovements: MaterialMovement[],
    suppliers?: Supplier[]
  }
}
```

### Create Material
```
POST /api/v1/materials
```

Request Body:
```typescript
{
  code: string;
  description: string;
  unit: string;
  materialType: 'purchasable' | 'receivable';
  clientType: string;
  attributes?: Record<string, any>;
}
```

### Update Material
```
PUT /api/v1/materials/:materialId
```

### Delete Material
```
DELETE /api/v1/materials/:materialId
```

## Inventory Management Endpoints

### Get Inventory Status
```
GET /api/v1/materials/inventory
```

Query Parameters:
- `warehouseId` (string): Filter by warehouse
- `stockStatus` (string): in-stock/low-stock/out-of-stock
- `materialType` (string): Filter by material type

### Get Inventory Dashboard
```
GET /api/v1/materials/inventory/dashboard
```

Response:
```typescript
{
  success: true,
  data: {
    totalMaterials: number;
    totalValue: number;
    lowStockItems: number;
    expiringItems: number;
    pendingOrders: number;
    warehouseUtilization: WarehouseUtilization[];
    stockAlerts: StockAlert[];
    recentMovements: MaterialMovement[];
  }
}
```

### Record Stock Movement
```
POST /api/v1/materials/inventory/movements
```

Request Body:
```typescript
{
  materialId: string;
  movementType: 'receipt' | 'issue' | 'transfer' | 'return' | 'adjustment' | 'write-off';
  quantity: number;
  fromLocation?: {
    type: string;
    id: string;
  };
  toLocation?: {
    type: string;
    id: string;
  };
  relatedEntity: {
    type: string;
    id: string;
    reference: string;
  };
  notes?: string;
  attachments?: string[];
}
```

### Get Stock Movements
```
GET /api/v1/materials/inventory/movements
```

Query Parameters:
- `materialId` (string): Filter by material
- `movementType` (string): Filter by movement type
- `dateFrom` (string): Start date (ISO format)
- `dateTo` (string): End date (ISO format)
- `locationId` (string): Filter by location

### Stock Adjustment
```
POST /api/v1/materials/inventory/adjustments
```

Request Body:
```typescript
{
  adjustmentType: string;
  materialId: string;
  warehouseId: string;
  previousQuantity: number;
  adjustedQuantity: number;
  reason: string;
  evidence?: string[];
}
```

## Warehouse Management Endpoints

### Get Warehouses
```
GET /api/v1/materials/warehouses
```

### Create Warehouse
```
POST /api/v1/materials/warehouses
```

Request Body:
```typescript
{
  name: string;
  address: string;
  type: 'main' | 'satellite' | 'site-storage';
  managerId: string;
  managerName: string;
}
```

### Update Warehouse
```
PUT /api/v1/materials/warehouses/:warehouseId
```

### Delete Warehouse
```
DELETE /api/v1/materials/warehouses/:warehouseId
```

### Get Warehouse Stock
```
GET /api/v1/materials/warehouses/:warehouseId/stock
```

### Manage Bin Locations
```
GET /api/v1/materials/warehouses/:warehouseId/locations
POST /api/v1/materials/warehouses/:warehouseId/locations
PUT /api/v1/materials/warehouses/:warehouseId/locations/:locationId
DELETE /api/v1/materials/warehouses/:warehouseId/locations/:locationId
```

## Material Assignment Endpoints

### Assign Material to Work Order
```
POST /api/v1/materials/assignments/work-orders
```

Request Body:
```typescript
{
  workOrderId: string;
  materialId: string;
  materialType: 'purchasable' | 'receivable';
  quantity: number;
  additionalInfo?: {
    unitCost?: number;
    supplier?: string;
    orderDate?: string;
    deliveryDate?: string;
    notes?: string;
  };
}
```

### Update Material Assignment
```
PUT /api/v1/materials/assignments/:assignmentId
```

### Remove Material Assignment
```
DELETE /api/v1/materials/assignments/:assignmentId
```

### Get Work Order Materials
```
GET /api/v1/materials/assignments/work-orders/:workOrderId
```

## Material Requisition Endpoints

### Create Requisition
```
POST /api/v1/materials/requisitions
```

Request Body:
```typescript
{
  purpose: {
    type: string;
    id?: string;
    reference?: string;
    description: string;
  };
  requiredDate: string;
  items: Array<{
    materialId: string;
    requestedQuantity: number;
    requiredDate: string;
    notes?: string;
  }>;
}
```

### Get Requisitions
```
GET /api/v1/materials/requisitions
```

Query Parameters:
- `status` (string): Filter by status
- `requestedBy` (string): Filter by requester
- `dateFrom` (string): Start date
- `dateTo` (string): End date

### Approve/Reject Requisition
```
PUT /api/v1/materials/requisitions/:requisitionId/approve
PUT /api/v1/materials/requisitions/:requisitionId/reject
```

Request Body:
```typescript
{
  comments?: string;
}
```

### Fulfill Requisition
```
POST /api/v1/materials/requisitions/:requisitionId/fulfill
```

Request Body:
```typescript
{
  items: Array<{
    materialId: string;
    issuedQuantity: number;
    fromWarehouse: string;
    notes?: string;
  }>;
}
```

## Material Usage Tracking

### Record Usage
```
POST /api/v1/materials/usage
```

Request Body:
```typescript
{
  materialId: string;
  quantity: number;
  usageType: string;
  entityType: string;
  entityId: string;
  entityReference: string;
  locationId: string;
  notes?: string;
  attachments?: string[];
}
```

### Get Usage History
```
GET /api/v1/materials/usage
```

Query Parameters:
- `materialId` (string): Filter by material
- `entityType` (string): Filter by entity type
- `entityId` (string): Filter by entity ID
- `dateFrom` (string): Start date
- `dateTo` (string): End date

### Get Usage Analytics
```
GET /api/v1/materials/usage/analytics
```

Query Parameters:
- `materialId` (string): Material to analyze
- `period` (string): daily/weekly/monthly/yearly
- `dateFrom` (string): Start date
- `dateTo` (string): End date

Response includes:
- Usage trends
- Cost analysis
- Efficiency metrics
- Predictions

## Stock Alerts Endpoints

### Get Active Alerts
```
GET /api/v1/materials/alerts
```

Query Parameters:
- `type` (string): Alert type filter
- `severity` (string): Severity filter
- `status` (string): Status filter

### Acknowledge Alert
```
PUT /api/v1/materials/alerts/:alertId/acknowledge
```

### Resolve Alert
```
PUT /api/v1/materials/alerts/:alertId/resolve
```

Request Body:
```typescript
{
  resolution: string;
}
```

## Error Codes

| Code | Description |
|------|-------------|
| MAT001 | Material not found |
| MAT002 | Insufficient stock |
| MAT003 | Invalid material type |
| MAT004 | Warehouse not found |
| MAT005 | Duplicate material code |
| MAT006 | Invalid quantity |
| MAT007 | Reservation conflict |
| MAT008 | Movement validation failed |
| MAT009 | Requisition approval required |
| MAT010 | Permission denied |

## Rate Limiting

API calls are limited to:
- 1000 requests per hour per user
- 100 requests per minute per user
- Bulk operations limited to 50 items per request

## Webhook Events

The system can send webhooks for the following events:

- `material.created`
- `material.updated`
- `material.deleted`
- `stock.low`
- `stock.movement`
- `requisition.created`
- `requisition.approved`
- `requisition.fulfilled`
- `alert.created`

Webhook payload format:
```typescript
{
  event: string;
  timestamp: string;
  data: any;
  metadata: {
    userId: string;
    correlationId: string;
  }
}
```

## Implementation Notes

1. All dates should be in ISO 8601 format
2. Pagination is required for list endpoints
3. Implement proper caching headers
4. Use ETags for resource versioning
5. Support partial responses with field selection
6. Implement request/response compression
7. Log all API calls for audit trail
8. Implement idempotency keys for POST requests 
