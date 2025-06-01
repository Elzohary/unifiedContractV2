import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

// Models and Services
import {
  MaterialCategory,
  StockStatus,
  MaterialType,
  ClientType
} from '../../models/material.model';
import { MaterialInventoryViewModel, MaterialWithInventory } from '../../viewModels/material-inventory.viewmodel';
import { WarehouseLocation } from '../../models/inventory.model';

interface FilterPreset {
  id: string;
  name: string;
  filters: MaterialFilters;
  createdAt: Date;
  isDefault?: boolean;
}

interface MaterialFilters {
  searchTerm?: string;
  categories?: string[];
  stockStatus?: StockStatus[];
  warehouses?: string[];
  materialType?: MaterialType[];
  clientType?: ClientType[];
  dateRange?: {
    field: 'createdAt' | 'updatedAt' | 'lastUsedAt';
    start: Date | null;
    end: Date | null;
  };
  priceRange?: {
    min: number | null;
    max: number | null;
  };
  hazardous?: boolean | null;
  hasBarcode?: boolean | null;
}

@Component({
  selector: 'app-material-catalog-list',
  templateUrl: './material-catalog-list.component.html',
  styleUrls: ['./material-catalog-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  providers: [MaterialInventoryViewModel]
})
export class MaterialCatalogListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'code',
    'description',
    'category',
    'stockStatus',
    'availableStock',
    'warehouse',
    'unit',
    'averageCost',
    'lastUsed',
    'actions'
  ];

  dataSource = new MatTableDataSource<MaterialWithInventory>([]);
  selection = new SelectionModel<MaterialWithInventory>(true, []);

  // Form groups
  searchForm: FormGroup;
  filterForm: FormGroup;

  // Data
  materials: MaterialWithInventory[] = [];
  categories: MaterialCategory[] = [];
  warehouses: WarehouseLocation[] = [];
  filterPresets: FilterPreset[] = [];

  // Filter state
  activeFilters: MaterialFilters = {};
  activeFilterCount = 0;
  isFilterExpanded = false;

  // Enums for template
  stockStatuses = Object.values(StockStatus);
  materialTypes = Object.values(MaterialType);
  clientTypes = Object.values(ClientType);

  // Date range options
  dateRangeOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'lastUsedAt', label: 'Last Used Date' }
  ];

  constructor(
    private fb: FormBuilder,
    private viewModel: MaterialInventoryViewModel,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.createSearchForm();
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupSearchListener();
    this.loadFilterPresets();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'stockStatus':
          return this.getStockStatusOrder(item.stockStatus);
        case 'availableStock':
          return item.availableStock || 0;
        case 'averageCost':
          return item.averageCost || 0;
        case 'lastUsed':
          return item.lastUsedAt?.getTime() || 0;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return ((item as Record<string, any>)[property] as string | number) || '';
      }
    };
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: ['']
    });
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      categories: [[]],
      stockStatus: [[]],
      warehouses: [[]],
      materialType: [[]],
      clientType: [[]],
      dateRangeField: ['createdAt'],
      dateRangeStart: [null],
      dateRangeEnd: [null],
      priceMin: [null],
      priceMax: [null],
      hazardous: [null],
      hasBarcode: [null]
    });
  }

  private setupSearchListener(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.activeFilters.searchTerm = searchTerm;
        this.applyFilters();
      });
  }

  private loadData(): void {
    // Load materials
    this.viewModel.materials$.subscribe(materials => {
      this.materials = materials;
      this.applyFilters();
    });

    // Load categories
    this.viewModel.categories$.subscribe(categories => {
      this.categories = categories;
    });

    // Load warehouses
    this.viewModel.warehouses$.subscribe(warehouses => {
      this.warehouses = warehouses;
    });
  }

  private loadFilterPresets(): void {
    // Load from localStorage or service
    const savedPresets = localStorage.getItem('materialFilterPresets');
    if (savedPresets) {
      this.filterPresets = JSON.parse(savedPresets);
    } else {
      // Default presets
      this.filterPresets = [
        {
          id: 'low-stock',
          name: 'Low Stock Items',
          filters: { stockStatus: [StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK] },
          createdAt: new Date(),
          isDefault: true
        },
        {
          id: 'high-value',
          name: 'High Value Items',
          filters: { priceRange: { min: 1000, max: null } },
          createdAt: new Date(),
          isDefault: true
        }
      ];
    }
  }

  applyFilters(): void {
    let filteredData = [...this.materials];

    // Search filter
    if (this.activeFilters.searchTerm) {
      const searchLower = this.activeFilters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(material =>
        material.code.toLowerCase().includes(searchLower) ||
        material.description.toLowerCase().includes(searchLower) ||
        (material.barcode && material.barcode.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (this.activeFilters.categories?.length) {
      filteredData = filteredData.filter(material =>
        this.activeFilters.categories!.includes(material.categoryId || '')
      );
    }

    // Stock status filter
    if (this.activeFilters.stockStatus?.length) {
      filteredData = filteredData.filter(material =>
        this.activeFilters.stockStatus!.includes(material.stockStatus || StockStatus.IN_STOCK)
      );
    }

    // Warehouse filter
    if (this.activeFilters.warehouses?.length) {
      filteredData = filteredData.filter(material =>
        this.activeFilters.warehouses!.includes(material.primaryWarehouseId || '')
      );
    }

    // Material type filter
    if (this.activeFilters.materialType?.length) {
      filteredData = filteredData.filter(material =>
        this.activeFilters.materialType!.includes(material.materialType)
      );
    }

    // Client type filter
    if (this.activeFilters.clientType?.length) {
      filteredData = filteredData.filter(material =>
        this.activeFilters.clientType!.includes(material.clientType)
      );
    }

    // Date range filter
    if (this.activeFilters.dateRange?.start || this.activeFilters.dateRange?.end) {
      const field = this.activeFilters.dateRange.field;
      filteredData = filteredData.filter(material => {
        const date = material[field];
        if (!date) return false;

        if (this.activeFilters.dateRange!.start && date < this.activeFilters.dateRange!.start) {
          return false;
        }
        if (this.activeFilters.dateRange!.end && date > this.activeFilters.dateRange!.end) {
          return false;
        }
        return true;
      });
    }

    // Price range filter
    if (this.activeFilters.priceRange?.min !== null || this.activeFilters.priceRange?.max !== null) {
      filteredData = filteredData.filter(material => {
        const price = material.averageCost || 0;
        if (this.activeFilters.priceRange!.min !== null && price < this.activeFilters.priceRange!.min) {
          return false;
        }
        if (this.activeFilters.priceRange!.max !== null && price > this.activeFilters.priceRange!.max) {
          return false;
        }
        return true;
      });
    }

    // Hazardous filter
    if (this.activeFilters.hazardous !== null && this.activeFilters.hazardous !== undefined) {
      filteredData = filteredData.filter(material =>
        material.hazardous === this.activeFilters.hazardous
      );
    }

    // Barcode filter
    if (this.activeFilters.hasBarcode !== null && this.activeFilters.hasBarcode !== undefined) {
      filteredData = filteredData.filter(material =>
        this.activeFilters.hasBarcode ? !!material.barcode : !material.barcode
      );
    }

    this.dataSource.data = filteredData;
    this.updateFilterCount();
  }

  onFilterFormChange(): void {
    const formValue = this.filterForm.value;

    this.activeFilters = {
      ...this.activeFilters,
      categories: formValue.categories,
      stockStatus: formValue.stockStatus,
      warehouses: formValue.warehouses,
      materialType: formValue.materialType,
      clientType: formValue.clientType,
      hazardous: formValue.hazardous,
      hasBarcode: formValue.hasBarcode,
      priceRange: {
        min: formValue.priceMin,
        max: formValue.priceMax
      }
    };

    // Handle date range
    if (formValue.dateRangeStart || formValue.dateRangeEnd) {
      this.activeFilters.dateRange = {
        field: formValue.dateRangeField,
        start: formValue.dateRangeStart,
        end: formValue.dateRangeEnd
      };
    } else {
      this.activeFilters.dateRange = undefined;
    }

    this.applyFilters();
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.filterForm.reset({
      dateRangeField: 'createdAt'
    });
    this.activeFilters = {};
    this.applyFilters();
  }

  private updateFilterCount(): void {
    let count = 0;

    if (this.activeFilters.searchTerm) count++;
    if (this.activeFilters.categories?.length) count++;
    if (this.activeFilters.stockStatus?.length) count++;
    if (this.activeFilters.warehouses?.length) count++;
    if (this.activeFilters.materialType?.length) count++;
    if (this.activeFilters.clientType?.length) count++;
    if (this.activeFilters.dateRange) count++;
    if (this.activeFilters.priceRange?.min !== null || this.activeFilters.priceRange?.max !== null) count++;
    if (this.activeFilters.hazardous !== null) count++;
    if (this.activeFilters.hasBarcode !== null) count++;

    this.activeFilterCount = count;
  }

  // Filter preset methods
  saveFilterPreset(): void {
    const presetName = prompt('Enter a name for this filter preset:');
    if (!presetName) return;

    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      filters: { ...this.activeFilters },
      createdAt: new Date()
    };

    this.filterPresets.push(newPreset);
    this.savePresetsToStorage();
    this.snackBar.open('Filter preset saved successfully', 'Close', { duration: 3000 });
  }

  loadFilterPreset(preset: FilterPreset): void {
    this.activeFilters = { ...preset.filters };

    // Update forms
    if (preset.filters.searchTerm) {
      this.searchForm.patchValue({ searchTerm: preset.filters.searchTerm });
    }

    this.filterForm.patchValue({
      categories: preset.filters.categories || [],
      stockStatus: preset.filters.stockStatus || [],
      warehouses: preset.filters.warehouses || [],
      materialType: preset.filters.materialType || [],
      clientType: preset.filters.clientType || [],
      hazardous: preset.filters.hazardous,
      hasBarcode: preset.filters.hasBarcode,
      priceMin: preset.filters.priceRange?.min,
      priceMax: preset.filters.priceRange?.max
    });

    if (preset.filters.dateRange) {
      this.filterForm.patchValue({
        dateRangeField: preset.filters.dateRange.field,
        dateRangeStart: preset.filters.dateRange.start,
        dateRangeEnd: preset.filters.dateRange.end
      });
    }

    this.applyFilters();
    this.snackBar.open(`Loaded filter preset: ${preset.name}`, 'Close', { duration: 2000 });
  }

  deleteFilterPreset(preset: FilterPreset): void {
    if (preset.isDefault) {
      this.snackBar.open('Cannot delete default presets', 'Close', { duration: 3000 });
      return;
    }

    this.filterPresets = this.filterPresets.filter(p => p.id !== preset.id);
    this.savePresetsToStorage();
    this.snackBar.open('Filter preset deleted', 'Close', { duration: 2000 });
  }

  private savePresetsToStorage(): void {
    localStorage.setItem('materialFilterPresets', JSON.stringify(this.filterPresets));
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  // Export methods
  exportSelected(): void {
    const selectedData = this.selection.selected;
    if (selectedData.length === 0) {
      this.snackBar.open('No items selected for export', 'Close', { duration: 3000 });
      return;
    }
    this.exportData(selectedData);
  }

  exportAll(): void {
    this.exportData(this.dataSource.data);
  }

  private exportData(data: MaterialWithInventory[]): void {
    const exportData = data.map(material => ({
      code: material.code,
      description: material.description,
      category: this.getCategoryName(material.categoryId),
      stockStatus: material.stockStatus,
      totalStock: material.totalStock,
      availableStock: material.availableStock,
      reservedStock: material.reservedStock,
      warehouse: this.getWarehouseName(material.primaryWarehouseId),
      unit: material.unit,
      averageCost: material.averageCost,
      barcode: material.barcode || '',
      hazardous: material.hazardous ? 'Yes' : 'No',
      lastUsed: material.lastUsedAt?.toISOString() || '',
      created: material.createdAt?.toISOString() || '',
      updated: material.updatedAt?.toISOString() || ''
    }));

    const csv = this.convertToCSV(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `materials-export-${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open(`Exported ${data.length} materials successfully`, 'Close', { duration: 3000 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertToCSV(data: Record<string, any>[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  // Helper methods
  getCategoryName(categoryId?: string): string {
    if (!categoryId) return '-';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || '-';
  }

  getWarehouseName(warehouseId?: string): string {
    if (!warehouseId) return '-';
    const warehouse = this.warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || '-';
  }

  getStockStatusColor(status?: StockStatus): string {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'primary';
      case StockStatus.LOW_STOCK:
        return 'warn';
      case StockStatus.OUT_OF_STOCK:
        return 'error';
      default:
        return '';
    }
  }

  getStockStatusIcon(status?: StockStatus): string {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'check_circle';
      case StockStatus.LOW_STOCK:
        return 'warning';
      case StockStatus.OUT_OF_STOCK:
        return 'cancel';
      case StockStatus.ORDERED:
        return 'local_shipping';
      default:
        return 'help';
    }
  }

  private getStockStatusOrder(status?: StockStatus): number {
    const order: Record<StockStatus, number> = {
      [StockStatus.OUT_OF_STOCK]: 0,
      [StockStatus.LOW_STOCK]: 1,
      [StockStatus.ORDERED]: 2,
      [StockStatus.IN_STOCK]: 3,
      [StockStatus.DISCONTINUED]: 4
    };
    return order[status || StockStatus.IN_STOCK];
  }

  formatCurrency(value?: number): string {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(value);
  }

  // Action methods
  viewMaterial(material: MaterialWithInventory): void {
    // TODO: Navigate to material details
    console.log('View material:', material.id);
  }

  editMaterial(material: MaterialWithInventory): void {
    // TODO: Open edit dialog
    console.log('Edit material:', material.id);
  }

  deleteMaterial(material: MaterialWithInventory): void {
    if (confirm(`Are you sure you want to delete material "${material.code}"?`)) {
      // TODO: Implement delete
      this.snackBar.open('Delete functionality coming soon', 'Close', { duration: 3000 });
    }
  }

  checkStock(material: MaterialWithInventory): void {
    // TODO: Open stock details dialog
    this.snackBar.open(`Stock check for ${material.code} coming soon`, 'Close', { duration: 3000 });
  }

  assignToWorkOrder(material: MaterialWithInventory): void {
    // TODO: Open work order assignment dialog
    this.snackBar.open(`Assign ${material.code} to work order coming soon`, 'Close', { duration: 3000 });
  }

  bulkOperation(operation: string): void {
    if (this.selection.selected.length === 0) {
      this.snackBar.open('No items selected', 'Close', { duration: 3000 });
      return;
    }

    switch (operation) {
      case 'update-category':
        this.snackBar.open('Bulk category update coming soon', 'Close', { duration: 3000 });
        break;
      case 'update-warehouse':
        this.snackBar.open('Bulk warehouse update coming soon', 'Close', { duration: 3000 });
        break;
      case 'delete':
        if (confirm(`Delete ${this.selection.selected.length} selected materials?`)) {
          this.snackBar.open('Bulk delete coming soon', 'Close', { duration: 3000 });
        }
        break;
    }
  }
}
