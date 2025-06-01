import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { materialAssignment } from '../../../../models/work-order.model';

export interface MaterialEditDialogData {
  material: materialAssignment;
  workOrderId: string;
}

@Component({
  selector: 'app-material-edit-dialog',
  templateUrl: './material-edit-dialog.component.html',
  styleUrls: ['./material-edit-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class MaterialEditDialogComponent implements OnInit {
  form: FormGroup;
  isPurchasable: boolean;
  totalCost: number = 0;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialEditDialogData
  ) {
    this.isPurchasable = data.material.materialType === 'purchasable';
    this.form = this.createForm();
  }
  
  ngOnInit(): void {
    this.populateForm();
    this.setupTotalCostCalculation();
  }
  
  private createForm(): FormGroup {
    if (this.isPurchasable) {
      return this.fb.group({
        name: ['', Validators.required],
        description: [''],
        quantity: [0, [Validators.required, Validators.min(0)]],
        unit: ['', Validators.required],
        unitCost: [0, [Validators.required, Validators.min(0)]],
        supplier: [''],
        orderDate: [null],
        deliveryDate: [null]
      });
    } else {
      return this.fb.group({
        name: ['', Validators.required],
        description: [''],
        estimatedQuantity: [0, [Validators.required, Validators.min(0)]],
        unit: ['', Validators.required]
      });
    }
  }
  
  private populateForm(): void {
    const material = this.isPurchasable 
      ? this.data.material.purchasableMaterial 
      : this.data.material.receivableMaterial;
      
    if (material) {
      if (this.isPurchasable && this.data.material.purchasableMaterial) {
        this.form.patchValue({
          name: this.data.material.purchasableMaterial.name,
          description: this.data.material.purchasableMaterial.description,
          quantity: this.data.material.purchasableMaterial.quantity,
          unit: this.data.material.purchasableMaterial.unit,
          unitCost: this.data.material.purchasableMaterial.unitCost,
          supplier: this.data.material.purchasableMaterial.supplier,
          orderDate: this.data.material.purchasableMaterial.orderDate,
          deliveryDate: this.data.material.purchasableMaterial.deliveryDate
        });
      } else if (!this.isPurchasable && this.data.material.receivableMaterial) {
        this.form.patchValue({
          name: this.data.material.receivableMaterial.name,
          description: this.data.material.receivableMaterial.description,
          estimatedQuantity: this.data.material.receivableMaterial.estimatedQuantity,
          unit: this.data.material.receivableMaterial.unit
        });
      }
    }
  }
  
  private setupTotalCostCalculation(): void {
    if (this.isPurchasable) {
      // Calculate total cost whenever quantity or unit cost changes
      this.form.get('quantity')?.valueChanges.subscribe(() => this.calculateTotalCost());
      this.form.get('unitCost')?.valueChanges.subscribe(() => this.calculateTotalCost());
      
      // Calculate initial total cost
      this.calculateTotalCost();
    }
  }
  
  private calculateTotalCost(): void {
    if (this.isPurchasable) {
      const quantity = this.form.get('quantity')?.value || 0;
      const unitCost = this.form.get('unitCost')?.value || 0;
      this.totalCost = quantity * unitCost;
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const updates: Partial<materialAssignment> = {
        ...this.data.material
      };
      
      if (this.isPurchasable) {
        updates.purchasableMaterial = {
          ...this.data.material.purchasableMaterial!,
          ...formValue,
          totalCost: this.totalCost
        };
      } else {
        updates.receivableMaterial = {
          ...this.data.material.receivableMaterial!,
          ...formValue
        };
      }
      
      this.dialogRef.close(updates);
    }
  }
} 