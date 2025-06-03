# ViewModels Migration Guide

## Overview

The materials domain viewModels have been refactored from a single monolithic `MaterialInventoryViewModel` into focused, single-responsibility viewModels for better maintainability and performance.

## New Architecture

### Focused ViewModels

```typescript
// Dashboard-specific functionality
import { MaterialInventoryDashboardViewModel } from './inventory/material-inventory-dashboard.viewmodel';

// Stock movements and adjustments
import { StockMovementsViewModel } from './inventory/stock-movements.viewmodel';

// Or import all at once
import { 
  MaterialInventoryDashboardViewModel, 
  StockMovementsViewModel 
} from './inventory';
```

## Migration Path

### ✅ Current Status (Phase 1)
The old `MaterialInventoryViewModel` has been **refactored as a facade** that delegates to the new focused viewModels. All existing components continue to work without changes.

### 🚀 Recommended Migration (Phase 2)

For new components or when updating existing ones, use the focused viewModels directly:

#### Before (Old Approach):
```typescript
// ❌ Old monolithic approach
import { MaterialInventoryViewModel } from '../viewModels/material-inventory.viewmodel';

@Component({...})
export class MyComponent {
  constructor(private inventoryVM: MaterialInventoryViewModel) {}

  loadDashboard() {
    this.inventoryVM.loadDashboardData();
    this.data$ = this.inventoryVM.dashboardData$;
  }

  loadMovements() {
    this.inventoryVM.loadRecentMovements();
    this.movements$ = this.inventoryVM.movements$;
  }
}
```

#### After (New Focused Approach):
```typescript
// ✅ New focused approach
import { 
  MaterialInventoryDashboardViewModel,
  StockMovementsViewModel 
} from '../viewModels/inventory';

@Component({...})
export class MyComponent {
  constructor(
    private dashboardVM: MaterialInventoryDashboardViewModel,
    private movementsVM: StockMovementsViewModel
  ) {}

  loadDashboard() {
    this.dashboardVM.loadDashboardData();
    this.data$ = this.dashboardVM.dashboardData$;
  }

  loadMovements() {
    this.movementsVM.loadMovements();
    this.movements$ = this.movementsVM.movements$;
  }
}
```

## Benefits of Migration

### Performance Benefits
- **Smaller Bundle Size**: Only load the viewModel functionality you need
- **Better Tree Shaking**: Unused functionality gets eliminated
- **Faster Initialization**: Smaller viewModels initialize faster

### Development Benefits
- **Single Responsibility**: Each viewModel has a clear, focused purpose
- **Better Testing**: Easier to unit test individual concerns
- **Improved Maintainability**: Smaller files are easier to understand and modify
- **Enhanced Reusability**: ViewModels can be used independently

### Type Safety Benefits
- **Focused Interfaces**: More specific interfaces for each concern
- **Better IntelliSense**: IDE provides more relevant suggestions
- **Reduced Coupling**: Dependencies are more explicit

## Interface Changes

### Dashboard Functionality
```typescript
// ✅ Use MaterialInventoryDashboardViewModel
interface InventoryDashboardData {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  pendingOrders: number;
  recentMovements: MaterialMovement[];
  warehouseUtilization: WarehouseUtilization[];
  stockAlerts: StockAlert[];
}
```

### Movement Functionality
```typescript
// ✅ Use StockMovementsViewModel
interface MovementFilter {
  searchTerm?: string;
  warehouseId?: string;
  movementType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'date' | 'material' | 'quantity' | 'type';
  sortOrder?: 'asc' | 'desc';
}
```

## Deprecated Methods

The following methods in `MaterialInventoryViewModel` are deprecated:

```typescript
// ❌ Deprecated - use MaterialInventoryDashboardViewModel instead
loadDashboardData(): void

// ❌ Deprecated - use StockMovementsViewModel instead  
loadRecentMovements(limit?: number): void
recordStockAdjustment(adjustment: Omit<StockAdjustment, 'id'>): Observable<boolean>
```

## Component Examples

### Dashboard Component
```typescript
import { MaterialInventoryDashboardViewModel } from '../viewModels/inventory';

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="dashboardData$ | async as data">
      <h2>Total Materials: {{data.totalMaterials}}</h2>
      <h2>Low Stock: {{data.lowStockItems}}</h2>
    </div>
  `
})
export class DashboardComponent {
  dashboardData$ = this.dashboardVM.dashboardData$;
  loading$ = this.dashboardVM.loading$;

  constructor(private dashboardVM: MaterialInventoryDashboardViewModel) {}

  ngOnInit() {
    this.dashboardVM.loadDashboardData();
  }

  refresh() {
    this.dashboardVM.refresh();
  }
}
```

### Movements Component
```typescript
import { StockMovementsViewModel } from '../viewModels/inventory';

@Component({
  selector: 'app-movements',
  template: `
    <div *ngFor="let movement of movements$ | async">
      {{movement.materialCode}} - {{movement.quantity}} {{movement.unit}}
    </div>
  `
})
export class MovementsComponent {
  movements$ = this.movementsVM.movements$;
  loading$ = this.movementsVM.loading$;

  constructor(private movementsVM: StockMovementsViewModel) {}

  ngOnInit() {
    this.movementsVM.loadMovements(20);
  }

  recordAdjustment(adjustment: Omit<StockAdjustment, 'id'>) {
    this.movementsVM.recordStockAdjustment(adjustment).subscribe(
      success => console.log('Adjustment recorded:', success)
    );
  }
}
```

## Timeline for Complete Migration

### Phase 1 (✅ Completed)
- ✅ Created new focused viewModels
- ✅ Implemented facade pattern for backward compatibility
- ✅ All existing components continue working

### Phase 2 (Recommended)
- 🎯 Migrate components one by one to use focused viewModels
- 🎯 Update imports and dependencies
- 🎯 Take advantage of improved performance and maintainability

### Phase 3 (Future)
- 🔮 Remove the facade pattern
- 🔮 Delete the old monolithic viewModel
- 🔮 Clean up deprecated interfaces

## Questions?

For any questions about migrating to the new viewModel architecture, refer to:
- `IMPROVEMENTS_COMPLETED.md` for implementation details
- `STRUCTURE_IMPROVEMENTS.md` for architectural decisions
- The new viewModel source code for usage examples 