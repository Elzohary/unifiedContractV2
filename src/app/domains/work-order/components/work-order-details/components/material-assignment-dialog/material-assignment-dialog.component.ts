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
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { BaseMaterial, MaterialType, ClientType } from '../../../../../materials/models/material.model';
import { materialAssignment } from '../../../../models/work-order.model';

export interface MaterialAssignmentDialogData {
  workOrderId: string;
  availableMaterials: BaseMaterial[];
  materialsViewModel?: any;
  workOrderClient?: string;
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
    MatIconModule
  ]
})
export class MaterialAssignmentDialogComponent implements OnInit {
  form: FormGroup;
  materialType: 'purchasable' | 'receivable' = 'purchasable';
  filteredMaterials$!: Observable<BaseMaterial[]>;
  selectedMaterial: BaseMaterial | null = null;
  availableMaterialsByType: BaseMaterial[] = [];
  totalCost: number = 0;
  workOrderClientType: ClientType | null = null;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialAssignmentDialogData
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
      this.form.get('material')!.reset();
      this.filterMaterialsByType(type);
      
      // Trigger the autocomplete to refresh with new materials
      this.form.get('material')!.updateValueAndValidity();
    });
    
    // Calculate total cost when quantity or unit cost changes
    this.setupTotalCostCalculation();
  }
  
  private createForm(): FormGroup {
    return this.fb.group({
      materialType: ['purchasable', Validators.required],
      material: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      
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
    } else {
      this.form.get('unitCost')!.clearValidators();
      this.form.get('supplier')!.clearValidators();
    }
    
    this.form.get('unitCost')!.updateValueAndValidity();
    this.form.get('supplier')!.updateValueAndValidity();
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
  
  onMaterialSelected(event: any): void {
    const material = event.option.value;
    if (material && typeof material === 'object') {
      this.selectedMaterial = material;
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
        additionalInfo: {
          unitCost: formValue.unitCost,
          supplier: formValue.supplier,
          orderDate: formValue.orderDate,
          deliveryDate: formValue.deliveryDate,
          notes: formValue.notes
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