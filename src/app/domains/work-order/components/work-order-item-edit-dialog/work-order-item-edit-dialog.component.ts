import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Iitem } from '../../models/work-order-item.model';

export interface WorkOrderItemDialogData {
  item: Iitem;
  dialogMode: 'create' | 'edit';
  title?: string;
}

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
  lineTypes = ['Description', 'Breakdown'];
  dialogMode: 'create' | 'edit';
  dialogTitle: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkOrderItemEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkOrderItemDialogData
  ) {
    this.dialogMode = data.dialogMode;
    this.dialogTitle = data.title || (this.dialogMode === 'create' ? 'Create Work Order Item' : 'Edit Work Order Item');
    
    // Initialize form with values from the data or with empty values for create mode
    this.editForm = this.fb.group({
      id: [data.item.id || null],
      itemNumber: [data.item.itemNumber || '', Validators.required],
      lineType: [data.item.lineType || 'Construction', Validators.required],
      shortDescription: [data.item.shortDescription || '', Validators.required],
      longDescription: [data.item.longDescription || '', Validators.required],
      UOM: [data.item.UOM || '', Validators.required],
      currency: [data.item.currency || '', Validators.required],
      paymentType: [data.item.paymentType || '', Validators.required],
      managementArea: [data.item.managementArea || '', Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      
      // For create mode, return the form data without ID if it wasn't provided
      if (this.dialogMode === 'create' && !formValue.id) {
        const { id, ...dataWithoutId } = formValue;
        this.dialogRef.close(dataWithoutId);
      } else {
        this.dialogRef.close(formValue);
      }
    }
  }
}
