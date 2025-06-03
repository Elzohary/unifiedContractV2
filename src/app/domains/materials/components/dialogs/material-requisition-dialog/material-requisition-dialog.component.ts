import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { BaseMaterial } from '../../../models/material.model';

export interface MaterialRequisitionDialogData {
  workOrderId?: string;
  workOrderNumber?: string;
  availableMaterials?: BaseMaterial[];
  requestType?: 'work-order' | 'maintenance' | 'general';
}

export interface RequisitionItem {
  materialId: string;
  material: BaseMaterial;
  requestedQuantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  estimatedCost?: number;
}

export interface MaterialRequisitionResult {
  requestId?: string;
  requestType: 'work-order' | 'maintenance' | 'general';
  workOrderId?: string;
  workOrderNumber?: string;
  requestedBy: string;
  requestDate: Date;
  requiredBy: Date;
  items: RequisitionItem[];
  justification: string;
  totalEstimatedCost: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  approvalRequired: boolean;
}

@Component({
  selector: 'app-material-requisition-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatAutocompleteModule,
    MatTableModule,
    MatCheckboxModule,
    MatStepperModule
  ],
  template: `
    <div class="material-requisition-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon>assignment</mat-icon>
        <span>Material Requisition</span>
      </div>

      <mat-dialog-content class="dialog-content">
        <mat-stepper [linear]="true" #stepper>
          <!-- Step 1: Request Information -->
          <mat-step [stepControl]="requestInfoForm" label="Request Information">
            <form [formGroup]="requestInfoForm" class="step-form">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Request Details</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Request Type</mat-label>
                      <mat-select formControlName="requestType">
                        <mat-option value="work-order">Work Order</mat-option>
                        <mat-option value="maintenance">Maintenance</mat-option>
                        <mat-option value="general">General</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Overall Urgency</mat-label>
                      <mat-select formControlName="urgency">
                        <mat-option value="low">Low</mat-option>
                        <mat-option value="medium">Medium</mat-option>
                        <mat-option value="high">High</mat-option>
                        <mat-option value="critical">Critical</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width" 
                                 *ngIf="requestInfoForm.get('requestType')?.value === 'work-order'">
                    <mat-label>Work Order Number</mat-label>
                    <input matInput formControlName="workOrderNumber" readonly>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Required By</mat-label>
                      <input matInput 
                             [matDatepicker]="requiredByPicker"
                             formControlName="requiredBy">
                      <mat-datepicker-toggle matSuffix [for]="requiredByPicker"></mat-datepicker-toggle>
                      <mat-datepicker #requiredByPicker></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Requested By</mat-label>
                      <input matInput formControlName="requestedBy" readonly>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Justification</mat-label>
                    <textarea matInput 
                             formControlName="justification"
                             rows="3"
                             placeholder="Explain the business need for these materials..."></textarea>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>

              <div class="stepper-buttons">
                <button mat-raised-button color="primary" matStepperNext>
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Material Selection -->
          <mat-step [stepControl]="materialsForm" label="Select Materials">
            <form [formGroup]="materialsForm" class="step-form">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Add Materials to Request</mat-card-title>
                  <div class="header-actions">
                    <button mat-raised-button color="primary" (click)="addMaterial()">
                      <mat-icon>add</mat-icon>
                      Add Material
                    </button>
                  </div>
                </mat-card-header>
                <mat-card-content>
                  <!-- Material Selection Form -->
                  <div class="material-selection" *ngIf="showAddMaterialForm">
                    <mat-divider></mat-divider>
                    <div class="add-material-form">
                      <h4>Add New Material</h4>
                      
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Search Material</mat-label>
                        <input matInput
                               [(ngModel)]="materialSearchTerm"
                               [matAutocomplete]="materialAuto"
                               placeholder="Search by code or description...">
                        <mat-icon matSuffix>search</mat-icon>
                        <mat-autocomplete #materialAuto="matAutocomplete" 
                                         [displayWith]="displayMaterial"
                                         (optionSelected)="onMaterialSelected($event.option.value)">
                          <mat-option *ngFor="let material of filteredMaterials$ | async" [value]="material">
                            <div class="material-option">
                              <span class="material-code">{{material.code}}</span>
                              <span class="material-description">{{material.description}}</span>
                              <span class="material-unit">{{material.unit}}</span>
                            </div>
                          </mat-option>
                        </mat-autocomplete>
                      </mat-form-field>

                      <div class="form-row" *ngIf="selectedMaterialToAdd">
                        <mat-form-field appearance="outline">
                          <mat-label>Quantity</mat-label>
                          <input matInput 
                                 type="number" 
                                 [(ngModel)]="materialQuantity"
                                 min="0.01"
                                 step="0.01">
                          <span matSuffix>{{selectedMaterialToAdd.unit}}</span>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Item Urgency</mat-label>
                          <mat-select [(ngModel)]="materialUrgency">
                            <mat-option value="low">Low</mat-option>
                            <mat-option value="medium">Medium</mat-option>
                            <mat-option value="high">High</mat-option>
                            <mat-option value="critical">Critical</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>

                      <mat-form-field appearance="outline" class="full-width" *ngIf="selectedMaterialToAdd">
                        <mat-label>Notes</mat-label>
                        <input matInput 
                               [(ngModel)]="materialNotes"
                               placeholder="Any specific requirements...">
                      </mat-form-field>

                      <div class="add-material-actions">
                        <button mat-button (click)="cancelAddMaterial()">Cancel</button>
                        <button mat-raised-button 
                                color="primary" 
                                (click)="confirmAddMaterial()"
                                [disabled]="!selectedMaterialToAdd || !materialQuantity">
                          Add to Request
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Selected Materials Table -->
                  <div class="selected-materials" *ngIf="selectedMaterials.length > 0">
                    <mat-divider *ngIf="showAddMaterialForm"></mat-divider>
                    <h4>Selected Materials ({{selectedMaterials.length}})</h4>
                    
                    <table mat-table [dataSource]="selectedMaterials" class="materials-table">
                      <ng-container matColumnDef="material">
                        <th mat-header-cell *matHeaderCellDef>Material</th>
                        <td mat-cell *matCellDef="let item">
                          <div class="material-cell">
                            <span class="material-code">{{item.material.code}}</span>
                            <span class="material-description">{{item.material.description}}</span>
                          </div>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="quantity">
                        <th mat-header-cell *matHeaderCellDef>Quantity</th>
                        <td mat-cell *matCellDef="let item">
                          {{item.requestedQuantity}} {{item.material.unit}}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="urgency">
                        <th mat-header-cell *matHeaderCellDef>Urgency</th>
                        <td mat-cell *matCellDef="let item">
                          <span class="urgency-badge" [class]="'urgency-' + item.urgency">
                            {{item.urgency | titlecase}}
                          </span>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="estimatedCost">
                        <th mat-header-cell *matHeaderCellDef>Est. Cost</th>
                        <td mat-cell *matCellDef="let item">
                          {{item.estimatedCost | currency}}
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef></th>
                        <td mat-cell *matCellDef="let item; let i = index">
                          <button mat-icon-button (click)="removeMaterial(i)" color="warn">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="materialColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: materialColumns;"></tr>
                    </table>

                    <div class="total-cost">
                      <strong>Total Estimated Cost: {{getTotalEstimatedCost() | currency}}</strong>
                    </div>
                  </div>

                  <div class="no-materials" *ngIf="selectedMaterials.length === 0 && !showAddMaterialForm">
                    <mat-icon>inventory_2</mat-icon>
                    <p>No materials selected. Click "Add Material" to start.</p>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="stepper-buttons">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-raised-button 
                        color="primary" 
                        matStepperNext
                        [disabled]="selectedMaterials.length === 0">
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Review & Submit -->
          <mat-step label="Review & Submit">
            <div class="review-step">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Review Requisition</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="review-section">
                    <h4>Request Information</h4>
                    <div class="review-grid">
                      <div class="review-item">
                        <span class="label">Type:</span>
                        <span class="value">{{requestInfoForm.get('requestType')?.value | titlecase}}</span>
                      </div>
                      <div class="review-item">
                        <span class="label">Urgency:</span>
                        <span class="value urgency-badge" [class]="'urgency-' + requestInfoForm.get('urgency')?.value">
                          {{requestInfoForm.get('urgency')?.value | titlecase}}
                        </span>
                      </div>
                      <div class="review-item">
                        <span class="label">Required By:</span>
                        <span class="value">{{requestInfoForm.get('requiredBy')?.value | date}}</span>
                      </div>
                      <div class="review-item" *ngIf="requestInfoForm.get('workOrderNumber')?.value">
                        <span class="label">Work Order:</span>
                        <span class="value">{{requestInfoForm.get('workOrderNumber')?.value}}</span>
                      </div>
                    </div>
                    
                    <div class="review-item full-width">
                      <span class="label">Justification:</span>
                      <span class="value">{{requestInfoForm.get('justification')?.value}}</span>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="review-section">
                    <h4>Materials Summary</h4>
                    <div class="materials-summary">
                      <div class="summary-stats">
                        <div class="stat">
                          <span class="stat-value">{{selectedMaterials.length}}</span>
                          <span class="stat-label">Items</span>
                        </div>
                        <div class="stat">
                          <span class="stat-value">{{getTotalEstimatedCost() | currency}}</span>
                          <span class="stat-label">Total Cost</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="approval-info" *ngIf="requiresApproval()">
                    <mat-icon>info</mat-icon>
                    <span>This requisition requires approval due to high value or urgency.</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="stepper-buttons">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Back
                </button>
                <button mat-raised-button 
                        color="primary" 
                        (click)="submitRequisition()"
                        [disabled]="selectedMaterials.length === 0">
                  <mat-icon>send</mat-icon>
                  Submit Requisition
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .material-requisition-dialog {
      width: 100%;
      max-width: 1000px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .dialog-content {
      padding: 0 24px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .step-form {
      margin: 16px 0;
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

    .stepper-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .header-actions {
      margin-left: auto;
    }

    .material-selection {
      margin-top: 16px;
    }

    .add-material-form {
      padding: 16px 0;
    }

    .add-material-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
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

    .material-unit {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .selected-materials {
      margin-top: 24px;
    }

    .materials-table {
      width: 100%;
      margin-top: 16px;
    }

    .material-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .urgency-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .urgency-low { background-color: #e8f5e8; color: #2e7d32; }
    .urgency-medium { background-color: #fff3e0; color: #ef6c00; }
    .urgency-high { background-color: #ffebee; color: #c62828; }
    .urgency-critical { background-color: #fce4ec; color: #ad1457; }

    .total-cost {
      margin-top: 16px;
      text-align: right;
      font-size: 18px;
    }

    .no-materials {
      text-align: center;
      padding: 40px;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-materials mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .review-section {
      margin: 16px 0;
    }

    .review-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .review-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .review-item.full-width {
      grid-column: 1 / -1;
    }

    .review-item .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .review-item .value {
      color: rgba(0, 0, 0, 0.87);
    }

    .materials-summary {
      margin-top: 16px;
    }

    .summary-stats {
      display: flex;
      gap: 32px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 500;
      color: #1976d2;
    }

    .stat-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
    }

    .approval-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #fff3e0;
      border-radius: 4px;
      margin-top: 16px;
      color: #ef6c00;
    }

    .dialog-actions {
      padding: 16px 24px;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 8px;
      }

      .summary-stats {
        flex-direction: column;
        gap: 16px;
      }

      .review-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MaterialRequisitionDialogComponent implements OnInit {
  requestInfoForm: FormGroup;
  materialsForm: FormGroup;
  
  selectedMaterials: RequisitionItem[] = [];
  showAddMaterialForm = false;
  materialSearchTerm = '';
  selectedMaterialToAdd: BaseMaterial | null = null;
  materialQuantity = 0;
  materialUrgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  materialNotes = '';
  
  filteredMaterials$: Observable<BaseMaterial[]> = of([]);
  materialColumns = ['material', 'quantity', 'urgency', 'estimatedCost', 'actions'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialRequisitionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialRequisitionDialogData
  ) {
    this.requestInfoForm = this.createRequestInfoForm();
    this.materialsForm = this.createMaterialsForm();
  }

  ngOnInit(): void {
    this.setupMaterialAutocomplete();
    
    if (this.data.workOrderId) {
      this.requestInfoForm.patchValue({
        requestType: 'work-order',
        workOrderNumber: this.data.workOrderNumber
      });
    }
  }

  private createRequestInfoForm(): FormGroup {
    return this.fb.group({
      requestType: [this.data.requestType || 'general', Validators.required],
      workOrderNumber: [this.data.workOrderNumber || ''],
      urgency: ['medium', Validators.required],
      requiredBy: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), Validators.required], // Default to 1 week
      requestedBy: ['Current User', Validators.required], // TODO: Get from auth service
      justification: ['', Validators.required]
    });
  }

  private createMaterialsForm(): FormGroup {
    return this.fb.group({
      materials: this.fb.array([])
    });
  }

  private setupMaterialAutocomplete(): void {
    if (this.data.availableMaterials) {
      this.filteredMaterials$ = of(this.data.availableMaterials);
    }
  }

  displayMaterial(material: BaseMaterial): string {
    return material ? `${material.code} - ${material.description}` : '';
  }

  addMaterial(): void {
    this.showAddMaterialForm = true;
    this.resetAddMaterialForm();
  }

  cancelAddMaterial(): void {
    this.showAddMaterialForm = false;
    this.resetAddMaterialForm();
  }

  onMaterialSelected(material: BaseMaterial): void {
    this.selectedMaterialToAdd = material;
    this.materialQuantity = 1;
  }

  confirmAddMaterial(): void {
    if (this.selectedMaterialToAdd && this.materialQuantity > 0) {
      const newItem: RequisitionItem = {
        materialId: this.selectedMaterialToAdd.id!,
        material: this.selectedMaterialToAdd,
        requestedQuantity: this.materialQuantity,
        urgency: this.materialUrgency,
        notes: this.materialNotes,
        estimatedCost: this.calculateEstimatedCost()
      };

      this.selectedMaterials.push(newItem);
      this.showAddMaterialForm = false;
      this.resetAddMaterialForm();
    }
  }

  removeMaterial(index: number): void {
    this.selectedMaterials.splice(index, 1);
  }

  private resetAddMaterialForm(): void {
    this.materialSearchTerm = '';
    this.selectedMaterialToAdd = null;
    this.materialQuantity = 0;
    this.materialUrgency = 'medium';
    this.materialNotes = '';
  }

  private calculateEstimatedCost(): number {
    if (this.selectedMaterialToAdd) {
      // Use standard cost or average cost if available
      const unitCost = this.selectedMaterialToAdd.standardCost || 
                      this.selectedMaterialToAdd.averageCost || 
                      this.selectedMaterialToAdd.lastPurchaseCost || 0;
      return unitCost * this.materialQuantity;
    }
    return 0;
  }

  getTotalEstimatedCost(): number {
    return this.selectedMaterials.reduce((total, item) => total + (item.estimatedCost || 0), 0);
  }

  requiresApproval(): boolean {
    const totalCost = this.getTotalEstimatedCost();
    const hasHighUrgency = this.selectedMaterials.some(item => 
      item.urgency === 'high' || item.urgency === 'critical'
    );
    const overallUrgency = this.requestInfoForm.get('urgency')?.value;
    
    return totalCost > 10000 || hasHighUrgency || overallUrgency === 'critical';
  }

  submitRequisition(): void {
    if (this.requestInfoForm.valid && this.selectedMaterials.length > 0) {
      const requestInfo = this.requestInfoForm.value;
      
      const result: MaterialRequisitionResult = {
        requestType: requestInfo.requestType,
        workOrderId: this.data.workOrderId,
        workOrderNumber: requestInfo.workOrderNumber,
        requestedBy: requestInfo.requestedBy,
        requestDate: new Date(),
        requiredBy: requestInfo.requiredBy,
        items: this.selectedMaterials,
        justification: requestInfo.justification,
        totalEstimatedCost: this.getTotalEstimatedCost(),
        urgency: requestInfo.urgency,
        approvalRequired: this.requiresApproval()
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 