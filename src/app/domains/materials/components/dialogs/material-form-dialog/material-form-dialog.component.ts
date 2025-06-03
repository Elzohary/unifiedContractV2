import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { BaseMaterial, ClientType, MaterialType, SecMaterial } from '../../../models/material.model';

export interface MaterialDialogData {
  material?: BaseMaterial | SecMaterial;
  isEdit: boolean;
}

@Component({
  selector: 'app-material-form-dialog',
  templateUrl: './material-form-dialog.component.html',
  styleUrls: ['./material-form-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    MatDividerModule
  ]
})
export class MaterialFormDialogComponent implements OnInit {
  materialForm: FormGroup;
  secSpecificForm: FormGroup;

  // For the step-by-step workflow
  selectedMaterialType?: MaterialType;
  shouldShowBasicFields = false;

  // Expose enum values to template
  materialTypes = MaterialType;
  clientTypes = ClientType;

  // Flag to indicate if we're showing SEC specific fields
  isSecMaterial = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MaterialFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialDialogData
  ) {
    // Initialize the forms
    this.materialForm = this.fb.group({
      id: [''],
      code: ['', Validators.required],
      description: ['', Validators.required],
      unit: ['', Validators.required],
      materialType: [MaterialType.RECEIVABLE, Validators.required],
      clientType: [null], // No longer required by default
    });

    this.secSpecificForm = this.fb.group({
      groupCode: ['', Validators.required],
      groupCodeDescription: ['', Validators.required],
      SEQ: [null, Validators.required],
      materialMasterCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // If we're editing, populate the form and set the material type
    if (this.data.isEdit && this.data.material) {
      this.selectedMaterialType = this.data.material.materialType;
      this.materialForm.patchValue(this.data.material);

      // Set client type validator based on material type
      this.updateClientTypeValidator();

      // Show the basic fields
      this.shouldShowBasicFields = true;

      // Check if it's a SEC material
      if (this.data.material.clientType === ClientType.SEC) {
        this.isSecMaterial = true;
        const secMaterial = this.data.material as SecMaterial;
        this.secSpecificForm.patchValue({
          groupCode: secMaterial.groupCode,
          groupCodeDescription: secMaterial.groupCodeDescription,
          SEQ: secMaterial.SEQ,
          materialMasterCode: secMaterial.materialMasterCode
        });
      }
    }

    // Subscribe to client type changes to show/hide SEC specific fields
    this.materialForm.get('clientType')?.valueChanges.subscribe(value => {
      this.isSecMaterial = value === ClientType.SEC;

      if (this.isSecMaterial) {
        // Make SEC specific fields required
        this.secSpecificForm.enable();
      } else {
        // Disable SEC specific fields if not SEC
        this.secSpecificForm.disable();
      }

      // Show basic fields when client is selected (for receivable)
      // or immediately for purchasable (handled in onMaterialTypeChange)
      if (this.selectedMaterialType === MaterialType.RECEIVABLE) {
        this.shouldShowBasicFields = !!value;
      }
    });
  }

  /**
   * When material type changes, update the form values and visibility
   */
  onMaterialTypeChange(): void {
    if (!this.selectedMaterialType) return;

    // Update the form with the selected material type
    this.materialForm.patchValue({
      materialType: this.selectedMaterialType,
      // Reset client type when changing material type
      clientType: null
    });

    // Update clientType validator based on material type
    this.updateClientTypeValidator();

    // For purchasable materials, show the basic fields immediately
    // For receivable, wait for client selection
    if (this.selectedMaterialType === MaterialType.PURCHASABLE) {
      this.shouldShowBasicFields = true;
      this.isSecMaterial = false;
      this.secSpecificForm.disable();
    } else {
      this.shouldShowBasicFields = false;
    }
  }

  /**
   * Update the clientType validator based on the material type
   */
  private updateClientTypeValidator(): void {
    const clientTypeControl = this.materialForm.get('clientType');

    if (this.selectedMaterialType === MaterialType.RECEIVABLE) {
      // Client type is required for receivable materials
      clientTypeControl?.setValidators([Validators.required]);
    } else {
      // Client type is not required for purchasable materials
      clientTypeControl?.clearValidators();
      // For purchasable materials, set client type to OTHER
      clientTypeControl?.setValue(ClientType.OTHER);
    }

    clientTypeControl?.updateValueAndValidity();
  }

  /**
   * Save the material
   */
  onSave(): void {
    if (this.materialForm.invalid || (this.isSecMaterial && this.secSpecificForm.invalid)) {
      return;
    }

    const materialData = this.materialForm.value;

    // Add SEC specific data if needed
    if (this.isSecMaterial) {
      Object.assign(materialData, this.secSpecificForm.value);
    }

    this.dialogRef.close(materialData);
  }

  /**
   * Cancel and close the dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
