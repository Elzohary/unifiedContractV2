import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WorkOrderIssue } from '../../../../../models/work-order.model';

export interface ResolveIssueDialogData {
  issue: WorkOrderIssue;
}

@Component({
  selector: 'app-resolve-issue-dialog',
  templateUrl: './resolve-issue-dialog.component.html',
  styleUrls: ['./resolve-issue-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ResolveIssueDialogComponent {
  resolveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ResolveIssueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResolveIssueDialogData
  ) {
    this.resolveForm = this.fb.group({
      resolutionNotes: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  onSubmit(): void {
    if (this.resolveForm.valid) {
      this.dialogRef.close(this.resolveForm.value.resolutionNotes);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(): string {
    const field = this.resolveForm.get('resolutionNotes');
    if (field?.hasError('required')) {
      return 'Resolution notes are required';
    }
    if (field?.hasError('maxlength')) {
      return 'Resolution notes must be less than 1000 characters';
    }
    return '';
  }
} 