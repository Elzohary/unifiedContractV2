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
import { MatTableModule } from '@angular/material/table';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { Equipment, MaintenanceRecord } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-maintenance',
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
    MatProgressSpinnerModule,
    MatTableModule
  ],
  template: `
    <div class="equipment-maintenance-container">
      <div class="header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="error-container" *ngIf="error">
        <p class="error-message">{{ error }}</p>
      </div>

      <div *ngIf="equipment && !isLoading && !error">
        <mat-card class="maintenance-card">
          <mat-card-header>
            <mat-card-title>Maintenance Records</mat-card-title>
            <mat-card-subtitle>{{ equipment.name }} - {{ equipment.type }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <table mat-table [dataSource]="equipment.maintenanceHistory" class="maintenance-table">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let record">{{ record.date | date }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let record">{{ record.type }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let record">{{ record.description }}</td>
              </ng-container>

              <ng-container matColumnDef="cost">
                <th mat-header-cell *matHeaderCellDef>Cost</th>
                <td mat-cell *matCellDef="let record">{{ record.cost | currency }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card class="add-maintenance-card">
          <mat-card-header>
            <mat-card-title>Add Maintenance Record</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="maintenanceForm" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Maintenance Type</mat-label>
                  <mat-select formControlName="type" required>
                    <mat-option value="Routine">Routine</mat-option>
                    <mat-option value="Repair">Repair</mat-option>
                    <mat-option value="Inspection">Inspection</mat-option>
                    <mat-option value="Upgrade">Upgrade</mat-option>
                  </mat-select>
                  <mat-error *ngIf="maintenanceForm.get('type')?.hasError('required')">
                    Maintenance Type is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput [matDatepicker]="datePicker" formControlName="date" required>
                  <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                  <mat-datepicker #datePicker></mat-datepicker>
                  <mat-error *ngIf="maintenanceForm.get('date')?.hasError('required')">
                    Date is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" required></textarea>
                  <mat-error *ngIf="maintenanceForm.get('description')?.hasError('required')">
                    Description is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Cost</mat-label>
                  <input matInput type="number" formControlName="cost" required>
                  <mat-error *ngIf="maintenanceForm.get('cost')?.hasError('required')">
                    Cost is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="!maintenanceForm.valid">
                  Add Record
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .equipment-maintenance-container {
      padding: 20px;
    }

    .header {
      margin-bottom: 20px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .error-container {
      padding: 20px;
      text-align: center;
    }

    .error-message {
      color: #f44336;
    }

    .maintenance-card, .add-maintenance-card {
      margin-bottom: 20px;
    }

    .maintenance-table {
      width: 100%;
      margin: 20px 0;
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
      margin-top: 20px;
    }
  `]
})
export class EquipmentMaintenanceComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private stateService = inject(StateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  equipment: Equipment | null = null;
  maintenanceForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  displayedColumns: string[] = ['date', 'type', 'description', 'cost'];

  constructor() {
    this.maintenanceForm = this.fb.group({
      type: ['', Validators.required],
      date: [new Date(), Validators.required],
      description: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]]
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

  onSubmit() {
    if (this.maintenanceForm.valid && this.equipment) {
      const maintenanceRecord: MaintenanceRecord = {
        id: crypto.randomUUID(),
        type: this.maintenanceForm.value.type!,
        date: this.maintenanceForm.value.date!,
        description: this.maintenanceForm.value.description!,
        cost: this.maintenanceForm.value.cost!,
        performedBy: 'System User', // This should be replaced with actual user
        nextMaintenanceDate: new Date(), // This should be calculated based on maintenance type
        nextMaintenanceType: this.maintenanceForm.value.type
      };

      this.equipmentService.addMaintenanceRecord(this.equipment.id, maintenanceRecord).subscribe({
        next: (updatedEquipment) => {
          if (updatedEquipment) {
            this.router.navigate(['/equipment', this.equipment?.id]);
          }
        },
        error: (err: Error) => {
          this.error = err.message;
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