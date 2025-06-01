# Week 2-3 Implementation Plan - Quick Wins

## Overview
Based on the successful completion of Week 1, we're moving to the "Quick Wins" phase focusing on immediate value delivery through enhanced catalog, availability checking, and basic stock movements.

## Completed Color Updates ✅
- Updated all component styles to use Angular Material theme variables
- Removed hardcoded colors (#f5f5f5, #1976d2, #388e3c, etc.)
- Now using CSS variables for consistency:
  - `var(--mat-app-primary)` for primary colors
  - `var(--mat-app-accent)` for accent colors  
  - `var(--mat-app-warn)` for warnings
  - `var(--mat-app-error)` for errors
  - `var(--mat-app-text-color)` with opacity for text
  - `var(--mat-app-surface)` for surfaces
  - `var(--mat-app-background)` for backgrounds

## Task 1: Enhance Material Catalog (Week 2)

### 1.1 Extend Material Model with Inventory Fields
**Priority**: High
**Duration**: 2 days

**Files to modify**:
- `domains/work-order-details/models/material.model.ts`

**Fields to add**:
```typescript
interface Material {
  // ... existing fields ...
  
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
}
```

### 1.2 Create Material Category Management
**Priority**: High  
**Duration**: 2 days

**Components to create**:
- `components/material-category-manager/`
  - Hierarchical category tree
  - Drag-and-drop reorganization
  - Category-specific attributes
  - Bulk material assignment

**Features**:
- Parent-child category relationships
- Category templates for quick setup
- Inherit properties from parent categories
- Custom fields per category

### 1.3 Implement Advanced Search and Filtering
**Priority**: Medium
**Duration**: 1 day

**Components to enhance**:
- `components/material-catalog-list/`

**Features**:
- Multi-field search (name, code, description, barcode)
- Advanced filters:
  - By category (with hierarchy)
  - By stock status (in stock, low stock, out of stock)
  - By warehouse location
  - By supplier
  - By date range (created, modified, last used)
- Save filter presets
- Export filtered results

## Task 2: Availability Checking Integration (Week 2)

### 2.1 Update Work Order Material Assignment Dialog
**Priority**: Critical
**Duration**: 2 days

**Files to modify**:
- `domains/work-order-details/components/work-order-materials/assign-material-dialog/`

**Changes**:
```typescript
// Add real-time availability display
interface MaterialAssignmentRow {
  material: Material;
  requestedQuantity: number;
  availableQuantity: number; // NEW
  warehouseStock: WarehouseStock[]; // NEW
  canFulfill: boolean; // NEW
  suggestedWarehouses?: string[]; // NEW
}
```

**UI Updates**:
- Show available stock next to each material
- Color coding: green (available), yellow (partial), red (unavailable)
- Warehouse dropdown showing stock per location
- Auto-suggest closest warehouse with stock
- Warning messages for insufficient stock

### 2.2 Implement Real-time Stock Updates
**Priority**: High
**Duration**: 1 day

**Service enhancements**:
- WebSocket connection for real-time updates
- Optimistic UI updates with rollback
- Conflict resolution for concurrent updates

## Task 3: Basic Stock Movement Recording (Week 3)

### 3.1 Create Stock Movement Form Component
**Priority**: High
**Duration**: 2 days

**Component**: `components/stock-movement-form/`

**Features**:
- Movement types:
  - Receipt (from purchase)
  - Issue (to work order)
  - Transfer (between warehouses)
  - Adjustment (inventory count)
  - Return (from work order)
  - Waste/Damage
  
**Form fields**:
```typescript
interface StockMovementForm {
  movementType: MovementType;
  materialId: string;
  quantity: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  referenceType?: 'work-order' | 'purchase-order' | 'manual';
  referenceId?: string;
  reason?: string;
  photos?: File[];
  notes?: string;
}
```

### 3.2 Photo Upload Integration
**Priority**: Medium
**Duration**: 1 day

**Features**:
- Multiple photo upload
- Image compression before upload
- Preview thumbnails
- Photo annotation/markup
- Geotagging for site movements

### 3.3 Barcode Scanning Preparation
**Priority**: Low
**Duration**: 1 day

**Implementation**:
- Install barcode scanning library
- Create scanning service
- Mock scanning for development
- Prepare UI for scanner integration
- Handle multiple barcode formats

## Integration Points

### Work Order Integration
```typescript
// Update work order service
class WorkOrderService {
  assignMaterial(workOrderId: string, materials: MaterialAssignment[]) {
    // Check availability first
    const availability = await materialIntegrationService.checkBulkAvailability(materials);
    
    // Reserve stock
    const reservations = await materialIntegrationService.reserveMaterials(materials);
    
    // Create assignment
    // ... existing logic ...
  }
}
```

### Activity Integration
```typescript
// Pre-allocate materials for scheduled activities
class ActivityService {
  scheduleMaterialRequirements(activityId: string) {
    const requirements = await this.getMaterialRequirements(activityId);
    const allocations = await materialIntegrationService.allocateFutureMaterials(
      requirements,
      activity.scheduledDate
    );
  }
}
```

## API Endpoints to Implement

### Priority 1 (Week 2)
```
GET    /api/materials/availability/:materialId
POST   /api/materials/check-availability
GET    /api/materials/categories
POST   /api/materials/categories
GET    /api/warehouses/:id/stock
```

### Priority 2 (Week 3)
```
POST   /api/stock-movements
GET    /api/stock-movements/history/:materialId
POST   /api/materials/reserve
DELETE /api/materials/reserve/:reservationId
POST   /api/materials/bulk-update
```

## Mock Data Enhancements

### Additional Mock Data Needed
1. Material categories hierarchy
2. Stock levels per warehouse
3. Historical movement data
4. Reservation records
5. Cost history

## Success Metrics

### Week 2 Goals
- [ ] Material model extended with inventory fields
- [ ] Category management UI functional
- [ ] Advanced search working with mock data
- [ ] Work order assignment shows availability
- [ ] Real-time updates mocked

### Week 3 Goals
- [ ] Stock movement form complete
- [ ] Photo upload working
- [ ] Movement history viewable
- [ ] Barcode scanner service ready
- [ ] All mock data generators complete

## Risk Mitigation

### Technical Risks
1. **Performance with large catalogs**
   - Implement virtual scrolling
   - Use pagination
   - Add caching layer

2. **Real-time sync conflicts**
   - Implement optimistic locking
   - Show conflict resolution UI
   - Add retry mechanisms

### Business Risks
1. **User training needed**
   - Create interactive tutorials
   - Add tooltips and help text
   - Provide video guides

## Next Steps Checklist

### Immediate (Today)
- [ ] Extend material model with inventory fields
- [ ] Create MaterialCategoryManager component
- [ ] Update mock data generators

### Tomorrow
- [ ] Implement category CRUD operations
- [ ] Add category tree visualization
- [ ] Create advanced search filters

### Day 3-4
- [ ] Update work order material assignment
- [ ] Add availability checking
- [ ] Implement stock reservation logic

### Day 5-7
- [ ] Create stock movement form
- [ ] Add photo upload capability
- [ ] Implement movement history view

## Development Guidelines

### Code Quality
- Maintain strict TypeScript typing
- Follow Angular style guide
- Write unit tests for services
- Document complex business logic

### UI/UX Consistency
- Use Angular Material components
- Follow established patterns
- Maintain responsive design
- Test on mobile devices

### Performance
- Lazy load heavy components
- Implement change detection strategy
- Use trackBy for lists
- Optimize bundle size

## Conclusion

This plan provides a clear path for the next two weeks of development. Focus on delivering working features with mock data that can be easily connected to real APIs later. The enhanced color scheme using Angular Material theme variables ensures a modern, consistent look throughout the application. 
