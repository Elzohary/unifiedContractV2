import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BaseMaterial } from '../../../models/material.model';
import { MaterialInventory, StockAdjustment } from '../../../models/inventory.model';

export interface StockAdjustmentDialogData {
  material?: BaseMaterial;
  currentInventory?: MaterialInventory;
  availableMaterials?: BaseMaterial[];
}

export interface StockAdjustmentResult {
  materialId: string;
  adjustmentType: 'increase' | 'decrease' | 'set-absolute';
  quantity: number;
  reason: string;
  notes?: string;
  performedBy: string;
  adjustmentDate: Date;
  referenceDocument?: string;
}

@Component({
  selector: 'app-stock-adjustment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatDividerModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="stock-adjustment-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon>inventory</mat-icon>
        <span>Stock Adjustment</span>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="adjustmentForm" class="adjustment-form">
          <!-- Material Selection -->
          <mat-card class="material-selection-card" *ngIf="!data.material">
            <mat-card-header>
              <mat-card-title>Select Material</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Material</mat-label>
                <input matInput
                       formControlName="materialSearch"
                       [matAutocomplete]="materialAuto"
                       placeholder="Search for material...">
                <mat-icon matSuffix>search</mat-icon>
                <mat-autocomplete #materialAuto="matAutocomplete" [displayWith]="displayMaterial">
                  <mat-option *ngFor="let material of filteredMaterials$ | async" 
                             [value]="material"
                             (onSelectionChange)="onMaterialSelected(material)">
                    <div class="material-option">
                      <span class="material-code">{{material.code}}</span>
                      <span class="material-description">{{material.description}}</span>
                      <span class="material-stock">Stock: {{getCurrentStock(material)}}</span>
                    </div>
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Selected Material Info -->
          <mat-card class="selected-material-card" *ngIf="selectedMaterial">
            <mat-card-header>
              <mat-card-title>{{selectedMaterial.code}} - {{selectedMaterial.description}}</mat-card-title>
              <mat-card-subtitle>Current Stock: {{currentStock}} {{selectedMaterial.unit}}</mat-card-subtitle>
            </mat-card-header>
          </mat-card>

          <!-- Adjustment Details -->
          <mat-card class="adjustment-details-card">
            <mat-card-header>
              <mat-card-title>Adjustment Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Adjustment Type</mat-label>
                  <mat-select formControlName="adjustmentType">
                    <mat-option value="increase">Increase Stock</mat-option>
                    <mat-option value="decrease">Decrease Stock</mat-option>
                    <mat-option value="set-absolute">Set Absolute Value</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{getQuantityLabel()}}</mat-label>
                  <input matInput 
                         type="number" 
                         formControlName="quantity"
                         [min]="getMinQuantity()"
                         step="0.01">
                  <span matSuffix>{{selectedMaterial?.unit || 'units'}}</span>
                </mat-form-field>
              </div>

              <div class="result-preview" *ngIf="adjustmentForm.get('quantity')?.value && selectedMaterial">
                <mat-divider></mat-divider>
                <div class="preview-content">
                  <h4>Preview</h4>
                  <div class="preview-calculation">
                    <span>Current: {{currentStock}}</span>
                    <mat-icon>{{getPreviewIcon()}}</mat-icon>
                    <span>{{getPreviewText()}}</span>
                    <mat-icon>arrow_forward</mat-icon>
                    <span class="new-stock">New: {{getNewStock()}}</span>
                  </div>
                </div>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reason for Adjustment</mat-label>
                <mat-select formControlName="reason" required>
                  <mat-option value="physical-count">Physical Count Correction</mat-option>
                  <mat-option value="damage">Damaged Stock</mat-option>
                  <mat-option value="expiry">Expired Stock</mat-option>
                  <mat-option value="found-stock">Found Additional Stock</mat-option>
                  <mat-option value="system-error">System Error Correction</mat-option>
                  <mat-option value="theft-loss">Theft/Loss</mat-option>
                  <mat-option value="quality-reject">Quality Rejection</mat-option>
                  <mat-option value="other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Additional Notes</mat-label>
                <textarea matInput 
                         formControlName="notes"
                         rows="3"
                         placeholder="Optional: Add any additional details..."></textarea>
              </mat-form-field>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Adjustment Date</mat-label>
                  <input matInput 
                         [matDatepicker]="picker"
                         formControlName="adjustmentDate"
                         readonly>
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Reference Document</mat-label>
                  <input matInput 
                         formControlName="referenceDocument"
                         placeholder="PO#, Invoice#, etc.">
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="onConfirm()"
                [disabled]="!adjustmentForm.valid || !selectedMaterial">
          <mat-icon>save</mat-icon>
          Apply Adjustment
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .stock-adjustment-dialog {
      width: 100%;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .dialog-content {
      padding: 0 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .adjustment-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .material-selection-card,
    .selected-material-card,
    .adjustment-details-card {
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .form-row > mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .material-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .material-code {
      font-weight: 500;
      color: #1976d2;
    }

    .material-description {
      color: rgba(0, 0, 0, 0.87);
    }

    .material-stock {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .result-preview {
      margin-top: 16px;
    }

    .preview-content {
      margin-top: 16px;
    }

    .preview-calculation {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      font-family: 'Roboto Mono', monospace;
    }

    .new-stock {
      font-weight: 500;
      color: #4caf50;
    }

    .dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class StockAdjustmentDialogComponent implements OnInit {
  adjustmentForm: FormGroup;
  selectedMaterial: BaseMaterial | null = null;
  currentStock = 0;
  filteredMaterials$: Observable<BaseMaterial[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StockAdjustmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StockAdjustmentDialogData
  ) {
    this.adjustmentForm = this.createForm();
    this.selectedMaterial = data.material || null;
    this.currentStock = data.material?.totalStock || 0;
  }

  ngOnInit(): void {
    this.setupMaterialAutocomplete();
    
    if (this.selectedMaterial) {
      this.adjustmentForm.patchValue({
        materialSearch: this.selectedMaterial
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      materialSearch: [null, this.data.material ? [] : [Validators.required]],
      adjustmentType: ['increase', Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      reason: ['', Validators.required],
      notes: [''],
      adjustmentDate: [new Date(), Validators.required],
      referenceDocument: ['']
    });
  }

  private setupMaterialAutocomplete(): void {
    const materialSearchControl = this.adjustmentForm.get('materialSearch');
    if (materialSearchControl && this.data.availableMaterials) {
      this.filteredMaterials$ = materialSearchControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterMaterials(value))
      );
    }
  }

  private filterMaterials(value: string | BaseMaterial): BaseMaterial[] {
    if (!this.data.availableMaterials) return [];
    
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.data.availableMaterials.filter(material =>
      material.code.toLowerCase().includes(filterValue) ||
      material.description.toLowerCase().includes(filterValue)
    );
  }

  displayMaterial(material: BaseMaterial): string {
    return material ? `${material.code} - ${material.description}` : '';
  }

  onMaterialSelected(material: BaseMaterial): void {
    this.selectedMaterial = material;
    this.currentStock = this.getCurrentStock(material);
  }

  getCurrentStock(material: BaseMaterial): number {
    return material.totalStock || 0;
  }

  getQuantityLabel(): string {
    const type = this.adjustmentForm.get('adjustmentType')?.value;
    switch (type) {
      case 'increase': return 'Quantity to Add';
      case 'decrease': return 'Quantity to Remove';
      case 'set-absolute': return 'New Stock Level';
      default: return 'Quantity';
    }
  }

  getMinQuantity(): number {
    const type = this.adjustmentForm.get('adjustmentType')?.value;
    return type === 'decrease' ? 0 : 0.01;
  }

  getPreviewIcon(): string {
    const type = this.adjustmentForm.get('adjustmentType')?.value;
    switch (type) {
      case 'increase': return 'add';
      case 'decrease': return 'remove';
      case 'set-absolute': return 'trending_flat';
      default: return 'help';
    }
  }

  getPreviewText(): string {
    const type = this.adjustmentForm.get('adjustmentType')?.value;
    const quantity = this.adjustmentForm.get('quantity')?.value || 0;
    
    switch (type) {
      case 'increase': return `+${quantity}`;
      case 'decrease': return `-${quantity}`;
      case 'set-absolute': return `=${quantity}`;
      default: return '';
    }
  }

  getNewStock(): number {
    const type = this.adjustmentForm.get('adjustmentType')?.value;
    const quantity = this.adjustmentForm.get('quantity')?.value || 0;
    
    switch (type) {
      case 'increase': return this.currentStock + quantity;
      case 'decrease': return Math.max(0, this.currentStock - quantity);
      case 'set-absolute': return quantity;
      default: return this.currentStock;
    }
  }

  onConfirm(): void {
    if (this.adjustmentForm.valid && this.selectedMaterial) {
      const formValue = this.adjustmentForm.value;
      
      const result: StockAdjustmentResult = {
        materialId: this.selectedMaterial.id!,
        adjustmentType: formValue.adjustmentType,
        quantity: formValue.quantity,
        reason: formValue.reason,
        notes: formValue.notes,
        performedBy: 'Current User', // TODO: Get from auth service
        adjustmentDate: formValue.adjustmentDate,
        referenceDocument: formValue.referenceDocument
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 