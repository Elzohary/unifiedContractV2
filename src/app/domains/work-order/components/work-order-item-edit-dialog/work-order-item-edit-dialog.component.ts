import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Iitem } from '../../models/work-order-item.model';

@Component({
  selector: 'app-work-order-item-edit-dialog',
  templateUrl: './work-order-item-edit-dialog.component.html',
  styleUrls: ['./work-order-item-edit-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ]
})
export class WorkOrderItemEditDialogComponent {
  editForm: FormGroup;
  lineTypes = ['Construction', 'Maintenance'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkOrderItemEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Iitem
  ) {
    this.editForm = this.fb.group({
      id: [data.id],
      itemNumber: [data.itemNumber, Validators.required],
      lineType: [data.lineType, Validators.required],
      shortDescription: [data.shortDescription, Validators.required],
      longDescription: [data.longDescription, Validators.required],
      UOM: [data.UOM, Validators.required],
      currency: [data.currency, Validators.required],
      paymentType: [data.paymentType, Validators.required],
      managementArea: [data.managementArea, Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }
}
