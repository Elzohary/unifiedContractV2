# Materials Domain Structure Improvements

## Current Issues & Recommendations

### 1. Component Organization Improvements

#### Current Structure Issues:
- `material-dialog/` is redundant with `dialogs/` folder
- Component naming could be more consistent
- Some components are too generic (`materials-management`)

#### Recommended Structure:
```
components/
├── dashboards/
│   ├── materials-hub/
│   ├── material-inventory-dashboard/
│   └── work-order-material-hub/
├── catalog/
│   ├── material-catalog-list/
│   ├── material-details/
│   └── material-category-manager/
├── dialogs/
│   ├── material-requisition-dialog/
│   ├── stock-adjustment-dialog/
│   └── material-form-dialog/          # Merge material-dialog here
├── warehouse/
│   └── warehouse-management/
└── shared/
    └── material-common-components/
```

### 2. Service Layer Optimization

#### Current Services Analysis:
- ✅ `material-management.service.ts` (21KB) - Main orchestrator
- ✅ `material-integration.service.ts` (13KB) - Cross-domain integration  
- ✅ `material-data.service.ts` (6.6KB) - Data persistence
- ⚠️ `material.service.ts` (3.6KB) - Potentially redundant

#### Recommendation:
- **Merge** `material.service.ts` into `material-management.service.ts` if it's basic CRUD
- **Keep** if it serves a specific purpose (check implementation)

### 3. ViewModels Structure

#### Current:
- `material-inventory.viewmodel.ts` (24KB) - Very large, consider splitting
- `material.viewmodel.ts` (3.4KB) - Good size

#### Recommendation:
```
viewModels/
├── inventory/
│   ├── material-inventory-dashboard.viewmodel.ts
│   ├── stock-movements.viewmodel.ts
│   └── warehouse-operations.viewmodel.ts
├── catalog/
│   ├── material-catalog.viewmodel.ts
│   └── material-details.viewmodel.ts
└── work-orders/
    └── work-order-materials.viewmodel.ts
```

### 4. Models Enhancement

#### Current Models (Good):
- ✅ `inventory.model.ts`
- ✅ `material.model.ts` 
- ✅ `procurement.model.ts`
- ✅ `usage-tracking.model.ts`

#### Suggested Additions:
```
models/
├── core/
│   ├── material.model.ts
│   └── inventory.model.ts
├── operations/
│   ├── procurement.model.ts
│   ├── usage-tracking.model.ts
│   └── stock-movement.model.ts
└── integration/
    └── work-order-material.model.ts
```

### 5. Feature Modules Organization

#### Recommended Feature Modules:
```
materials/
├── features/
│   ├── inventory-management/
│   │   ├── components/
│   │   ├── services/
│   │   └── inventory.module.ts
│   ├── catalog-management/
│   │   ├── components/
│   │   ├── services/
│   │   └── catalog.module.ts
│   ├── warehouse-operations/
│   │   ├── components/
│   │   ├── services/
│   │   └── warehouse.module.ts
│   └── work-order-integration/
│       ├── components/
│       ├── services/
│       └── work-order-materials.module.ts
├── shared/
│   ├── components/
│   ├── services/
│   ├── models/
│   └── utils/
└── materials.module.ts (main module)
```

### 6. Immediate Action Items

#### High Priority:
1. **Move** `material-dialog/` contents to `dialogs/`
2. **Analyze** `material.service.ts` for potential merge
3. **Split** large `material-inventory.viewmodel.ts` (24KB)
4. **Standardize** component naming conventions

#### Medium Priority:
1. **Reorganize** components into feature-based folders
2. **Create** feature modules for better lazy loading
3. **Add** barrel exports (index.ts files)

#### Low Priority:
1. **Consider** moving to standalone components architecture
2. **Implement** micro-frontend patterns if needed

### 7. Benefits of Improvements

#### Developer Experience:
- ✅ Easier navigation and file discovery
- ✅ Better code organization and maintainability
- ✅ Clearer separation of concerns
- ✅ Improved lazy loading capabilities

#### Performance:
- ✅ Better tree-shaking with feature modules
- ✅ Reduced bundle sizes through lazy loading
- ✅ Improved initial load times

#### Maintainability:
- ✅ Easier to add new features
- ✅ Better testability with isolated modules
- ✅ Clearer dependencies and relationships

## Implementation Priority

### Phase 1 (Immediate - 1-2 days):
- Fix component organization issues
- Merge redundant services
- Split large viewModels

### Phase 2 (Short-term - 1 week):
- Implement feature modules
- Add barrel exports
- Standardize naming

### Phase 3 (Long-term - 2-3 weeks):
- Consider standalone components migration
- Implement micro-frontend patterns if needed
- Add advanced lazy loading strategies 