import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { Equipment, AssignmentStatus } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-assignment',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="assignment-container">
      <div class="header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <mat-card *ngIf="equipment && !isLoading && !error" class="assignment-card">
        <mat-card-header>
          <mat-card-title>Assign Equipment</mat-card-title>
          <mat-card-subtitle>{{ equipment.name }} - {{ equipment.type }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="assignmentForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Work Order ID</mat-label>
                <input matInput formControlName="workOrderId" required>
                <mat-error *ngIf="assignmentForm.get('workOrderId')?.hasError('required')">
                  Work Order ID is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Assigned To</mat-label>
                <input matInput formControlName="assignedTo" required>
                <mat-error *ngIf="assignmentForm.get('assignedTo')?.hasError('required')">
                  Assigned To is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startDatePicker" formControlName="startDate" required>
                <mat-datepicker-toggle matSuffix [for]="startDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #startDatePicker></mat-datepicker>
                <mat-error *ngIf="assignmentForm.get('startDate')?.hasError('required')">
                  Start Date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endDatePicker" formControlName="endDate" required>
                <mat-datepicker-toggle matSuffix [for]="endDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #endDatePicker></mat-datepicker>
                <mat-error *ngIf="assignmentForm.get('endDate')?.hasError('required')">
                  End Date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Hours</mat-label>
                <input matInput type="number" formControlName="hours" required>
                <mat-error *ngIf="assignmentForm.get('hours')?.hasError('required')">
                  Hours is required
                </mat-error>
                <mat-error *ngIf="assignmentForm.get('hours')?.hasError('min')">
                  Hours must be greater than 0
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rate (per hour)</mat-label>
                <input matInput type="number" formControlName="rate" required>
                <mat-error *ngIf="assignmentForm.get('rate')?.hasError('required')">
                  Rate is required
                </mat-error>
                <mat-error *ngIf="assignmentForm.get('rate')?.hasError('min')">
                  Rate must be greater than 0
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!assignmentForm.valid">
                Assign Equipment
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .assignment-container {
      padding: 20px;
    }

    .header {
      margin-bottom: 20px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }

    .error-message {
      color: red;
      margin: 16px 0;
    }

    .assignment-card {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class EquipmentAssignmentComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private stateService = inject(StateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  equipment: Equipment | null = null;
  assignmentForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor() {
    this.assignmentForm = this.fb.group({
      workOrderId: ['', Validators.required],
      assignedTo: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      hours: [0, [Validators.required, Validators.min(0)]],
      rate: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEquipment(id);
    }
  }

  private loadEquipment(id: string) {
    this.isLoading = true;
    this.equipmentService.getEquipmentById(id).subscribe({
      next: (equipment) => {
        this.equipment = equipment;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.assignmentForm.valid && this.equipment) {
      const formValue = this.assignmentForm.value;
      
      this.equipmentService.assignToWorkOrder(this.equipment.id, formValue.workOrderId).subscribe({
        next: () => {
          this.router.navigate(['/equipment', this.equipment?.id]);
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  goBack() {
    if (this.equipment) {
      this.router.navigate(['/equipment', this.equipment.id]);
    } else {
      this.router.navigate(['/equipment']);
    }
  }
} 