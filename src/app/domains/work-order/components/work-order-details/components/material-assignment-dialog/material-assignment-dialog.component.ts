import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

import { BaseMaterial, ClientType, StockStatus } from '../../../../../materials/models/material.model';
import { MaterialIntegrationService } from '../../../../../materials/services/material-integration.service';
import { WarehouseLocation, AvailabilityResult, WarehouseAvailability } from '../../../../../materials/models/inventory.model';

export interface MaterialAssignmentDialogData {
  workOrderId: string;
  availableMaterials: BaseMaterial[];
  materialsViewModel?: unknown;
  workOrderClient?: string;
  warehouses?: WarehouseLocation[];
}

export interface WarehouseAvailabilityInfo {
  warehouseId: string;
  warehouseName: string;
  available: number;
  reserved?: number;
  distance?: number; // Distance from work order site
}

@Component({
  selector: 'app-material-assignment-dialog',
  templateUrl: './material-assignment-dialog.component.html',
  styleUrls: ['./material-assignment-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  providers: [MaterialIntegrationService]
})
export class MaterialAssignmentDialogComponent implements OnInit {
  form: FormGroup;
  materialType: 'purchasable' | 'receivable' = 'purchasable';
  filteredMaterials$!: Observable<BaseMaterial[]>;
  selectedMaterial: BaseMaterial | null = null;
  availableMaterialsByType: BaseMaterial[] = [];
  totalCost = 0;
  workOrderClientType: ClientType | null = null;

  // Availability tracking
  checkingAvailability = false;
  materialAvailability: {
    isAvailable: boolean;
    totalAvailable: number;
    warehouseAvailability: WarehouseAvailabilityInfo[];
  } | null = null;
  selectedWarehouse: string | null = null;
  stockStatus: StockStatus | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialAssignmentDialogData,
    private materialIntegrationService: MaterialIntegrationService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    // Determine work order client type
    if (this.data.workOrderClient) {
      if (this.data.workOrderClient.toLowerCase().includes('sec') ||
          this.data.workOrderClient.toLowerCase().includes('saudi electricity')) {
        this.workOrderClientType = ClientType.SEC;
      } else {
        this.workOrderClientType = ClientType.OTHER;
      }
    }

    // Update available materials when type changes
    this.filterMaterialsByType(this.materialType);

    // Set up material autocomplete filtering
    this.filteredMaterials$ = this.form.get('material')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string' ? value : value?.description || '';
        return this.filterMaterials(searchValue);
      })
    );

    // Update form based on material type selection
    this.form.get('materialType')!.valueChanges.subscribe(type => {
      this.materialType = type;
      this.updateFormValidation();
      this.selectedMaterial = null;
      this.materialAvailability = null;
      this.form.get('material')!.reset();
      this.form.get('warehouse')!.reset();
      this.filterMaterialsByType(type);

      // Trigger the autocomplete to refresh with new materials
      this.form.get('material')!.updateValueAndValidity();
    });

    // Check availability when quantity changes
    this.form.get('quantity')!.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      if (this.selectedMaterial) {
        this.checkMaterialAvailability();
      }
    });

    // Calculate total cost when quantity or unit cost changes
    this.setupTotalCostCalculation();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      materialType: ['purchasable', Validators.required],
      material: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],

      // Warehouse selection for material pickup
      warehouse: [''],

      // Purchasable material fields
      unitCost: [0, [Validators.min(0)]],
      supplier: [''],
      orderDate: [new Date()],
      deliveryDate: [null],

      // Additional info
      notes: ['']
    });
  }

  private updateFormValidation(): void {
    if (this.materialType === 'purchasable') {
      this.form.get('unitCost')!.setValidators([Validators.required, Validators.min(0)]);
      this.form.get('supplier')!.setValidators(Validators.required);
      this.form.get('warehouse')!.clearValidators();
    } else {
      this.form.get('unitCost')!.clearValidators();
      this.form.get('supplier')!.clearValidators();
      // For receivable materials, warehouse selection might be required
      if (this.materialAvailability && !this.materialAvailability.isAvailable) {
        this.form.get('warehouse')!.setValidators(Validators.required);
      }
    }

    this.form.get('unitCost')!.updateValueAndValidity();
    this.form.get('supplier')!.updateValueAndValidity();
    this.form.get('warehouse')!.updateValueAndValidity();
  }

  private filterMaterialsByType(type: 'purchasable' | 'receivable'): void {
    if (!this.data.availableMaterials || this.data.availableMaterials.length === 0) {
      console.warn('No available materials to filter');
      this.availableMaterialsByType = [];
      return;
    }

    this.availableMaterialsByType = this.data.availableMaterials.filter(material => {
      // First filter by material type
      if (material.materialType !== type) {
        return false;
      }

      // For receivable materials, also filter by client type
      if (type === 'receivable' && this.workOrderClientType) {
        return material.clientType === this.workOrderClientType;
      }

      // For purchasable materials, include all
      return true;
    });

    console.log(`Filtered ${this.availableMaterialsByType.length} materials for type: ${type}${type === 'receivable' ? ' and client: ' + this.workOrderClientType : ''}`);
  }

  private filterMaterials(value: string): BaseMaterial[] {
    if (!value) return this.availableMaterialsByType;

    const filterValue = value.toLowerCase();
    return this.availableMaterialsByType.filter(material =>
      material.description.toLowerCase().includes(filterValue) ||
      (material.code && material.code.toLowerCase().includes(filterValue))
    );
  }

  displayMaterial(material: BaseMaterial | string): string {
    if (!material) return '';
    if (typeof material === 'string') return material;
    return material.description || '';
  }

  onMaterialSelected(event: { option: { value: BaseMaterial } }): void {
    const material = event.option.value;
    if (material && typeof material === 'object') {
      this.selectedMaterial = material;
      this.checkMaterialAvailability();
    }
  }

  private checkMaterialAvailability(): void {
    if (!this.selectedMaterial || !this.selectedMaterial.id) {
      return;
    }

    const quantity = this.form.get('quantity')?.value || 1;
    this.checkingAvailability = true;
    this.materialAvailability = null;

    this.materialIntegrationService.checkAvailability(
      this.selectedMaterial.id,
      quantity
    ).subscribe({
      next: (result: AvailabilityResult) => {
        this.checkingAvailability = false;

        // Transform the service result to our component's format
        this.materialAvailability = {
          isAvailable: result.isAvailable,
          totalAvailable: result.totalAvailable,
          warehouseAvailability: result.warehouseAvailability.map((w: WarehouseAvailability) => ({
            warehouseId: w.warehouseId,
            warehouseName: this.getWarehouseName(w.warehouseId),
            available: w.available,
            reserved: w.reserved,
            distance: Math.random() * 20 // Mock distance
          }))
        };

        // Update stock status
        if (result.isAvailable) {
          this.stockStatus = StockStatus.IN_STOCK;
        } else if (result.totalAvailable > 0) {
          this.stockStatus = StockStatus.LOW_STOCK;
        } else {
          this.stockStatus = StockStatus.OUT_OF_STOCK;
        }

        // Auto-select warehouse if there's only one with stock
        const warehousesWithStock = this.materialAvailability.warehouseAvailability.filter(w => w.available > 0);
        if (warehousesWithStock.length === 1) {
          this.form.get('warehouse')?.setValue(warehousesWithStock[0].warehouseId);
          this.selectedWarehouse = warehousesWithStock[0].warehouseId;
        } else if (warehousesWithStock.length > 1) {
          // Sort by distance and select closest
          const closest = warehousesWithStock.sort((a, b) =>
            (a.distance || 999999) - (b.distance || 999999)
          )[0];
          this.form.get('warehouse')?.setValue(closest.warehouseId);
          this.selectedWarehouse = closest.warehouseId;
        }

        this.updateFormValidation();
      },
      error: (error) => {
        console.error('Error checking availability:', error);
        this.checkingAvailability = false;
        // Use mock data for demo
        this.materialAvailability = this.getMockAvailability(quantity);
      }
    });
  }

  private getWarehouseName(warehouseId: string): string {
    const warehouseNames: Record<string, string> = {
      'wh-001': 'Main Warehouse',
      'wh-002': 'Site Storage A',
      'wh-003': 'Site Storage B'
    };
    return warehouseNames[warehouseId] || warehouseId;
  }

  private getMockAvailability(requestedQuantity: number): {
    isAvailable: boolean;
    totalAvailable: number;
    warehouseAvailability: WarehouseAvailabilityInfo[];
  } {
    // Generate mock availability data
    const totalStock = Math.floor(Math.random() * 1000) + 100;
    const available = Math.floor(totalStock * 0.8);

    return {
      isAvailable: available >= requestedQuantity,
      totalAvailable: available,
      warehouseAvailability: [
        {
          warehouseId: 'wh-001',
          warehouseName: 'Main Warehouse',
          available: Math.floor(available * 0.6),
          reserved: Math.floor(available * 0.1),
          distance: 5.2
        },
        {
          warehouseId: 'wh-002',
          warehouseName: 'Site Storage A',
          available: Math.floor(available * 0.3),
          reserved: 0,
          distance: 0.5
        },
        {
          warehouseId: 'wh-003',
          warehouseName: 'Site Storage B',
          available: Math.floor(available * 0.1),
          reserved: Math.floor(available * 0.05),
          distance: 12.8
        }
      ]
    };
  }

  getStockStatusColor(): string {
    switch (this.stockStatus) {
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

  getStockStatusIcon(): string {
    switch (this.stockStatus) {
      case StockStatus.IN_STOCK:
        return 'check_circle';
      case StockStatus.LOW_STOCK:
        return 'warning';
      case StockStatus.OUT_OF_STOCK:
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStockStatusMessage(): string {
    if (!this.materialAvailability) {
      return '';
    }

    if (this.materialAvailability.isAvailable) {
      return `Sufficient stock available (${this.materialAvailability.totalAvailable} ${this.selectedMaterial?.unit || 'units'})`;
    } else if (this.materialAvailability.totalAvailable > 0) {
      return `Only ${this.materialAvailability.totalAvailable} ${this.selectedMaterial?.unit || 'units'} available`;
    } else {
      return 'Out of stock';
    }
  }

  canAssignPartialQuantity(): boolean {
    return this.materialAvailability !== null &&
           this.materialAvailability.totalAvailable > 0 &&
           !this.materialAvailability.isAvailable;
  }

  assignPartialQuantity(): void {
    if (this.materialAvailability) {
      this.form.get('quantity')?.setValue(this.materialAvailability.totalAvailable);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid && this.selectedMaterial) {
      const formValue = this.form.value;

      const result = {
        material: this.selectedMaterial,
        quantity: formValue.quantity,
        warehouseId: formValue.warehouse,
        additionalInfo: {
          unitCost: formValue.unitCost,
          supplier: formValue.supplier,
          orderDate: formValue.orderDate,
          deliveryDate: formValue.deliveryDate,
          notes: formValue.notes,
          stockStatus: this.stockStatus,
          totalAvailable: this.materialAvailability?.totalAvailable
        }
      };

      this.dialogRef.close(result);
    }
  }

  private setupTotalCostCalculation(): void {
    // Listen to changes in quantity and unitCost
    this.form.get('quantity')?.valueChanges.subscribe(() => this.calculateTotalCost());
    this.form.get('unitCost')?.valueChanges.subscribe(() => this.calculateTotalCost());
  }

  private calculateTotalCost(): void {
    if (this.materialType === 'purchasable') {
      const quantity = this.form.get('quantity')?.value || 0;
      const unitCost = this.form.get('unitCost')?.value || 0;
      this.totalCost = quantity * unitCost;
    }
  }
}
