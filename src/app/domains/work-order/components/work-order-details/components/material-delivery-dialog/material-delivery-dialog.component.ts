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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { materialAssignment } from '../../../../models/work-order.model';
import { DocumentService } from '../../../../../../shared/services/document.service';
import { ManpowerAssignment } from '../../../../models/work-order.model';

export interface MaterialDeliveryDialogData {
  material: materialAssignment;
  workOrderId: string;
  manpowerList?: ManpowerAssignment[];
  warehouseList?: Array<{ id: string; name: string; location: string }>;
}

@Component({
  selector: 'app-material-delivery-dialog',
  templateUrl: './material-delivery-dialog.component.html',
  styleUrls: ['./material-delivery-dialog.component.scss'],
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
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ]
})
export class MaterialDeliveryDialogComponent implements OnInit {
  form: FormGroup;
  invoiceFile: File | null = null;
  deliveryPhotos: File[] = [];
  uploadProgress = 0;
  isUploading = false;
  
  // Mock data - should come from services
  mockManpower: ManpowerAssignment[] = [
    { id: 'mp1', badgeNumber: 'B12345', name: 'Ahmed Ali', role: 'Foreman', hoursAssigned: 8, startDate: new Date().toISOString(), workOrderNumber: '' },
    { id: 'mp2', badgeNumber: 'B12346', name: 'Mohammed Hassan', role: 'Technician', hoursAssigned: 8, startDate: new Date().toISOString(), workOrderNumber: '' }
  ];
  
  mockWarehouses = [
    { id: 'wh1', name: 'Main Warehouse', location: 'Dammam' },
    { id: 'wh2', name: 'Site Warehouse', location: 'Ras Tanura' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialDeliveryDialogComponent>,
    private documentService: DocumentService,
    @Inject(MAT_DIALOG_DATA) public data: MaterialDeliveryDialogData
  ) {
    this.form = this.createForm();
  }
  
  ngOnInit(): void {
    // Set today's date as default
    this.form.patchValue({
      deliveryDate: new Date()
    });
  }
  
  private createForm(): FormGroup {
    return this.fb.group({
      // Delivery details
      deliveryDate: [new Date(), Validators.required],
      receivedBy: ['', Validators.required],
      storageLocation: ['warehouse', Validators.required],
      warehouseId: [''],
      binLocation: [''],
      deliveryNote: [''],
      
      // Invoice details
      invoiceNumber: [''],
      invoiceAmount: [this.data.material.purchasableMaterial?.totalCost || 0],
      
      // For site direct delivery
      siteReceivedBy: ['']
    });
  }
  
  onStorageLocationChange(location: string): void {
    if (location === 'warehouse') {
      this.form.get('warehouseId')?.setValidators(Validators.required);
      this.form.get('siteReceivedBy')?.clearValidators();
    } else {
      this.form.get('warehouseId')?.clearValidators();
      this.form.get('siteReceivedBy')?.setValidators(Validators.required);
    }
    
    this.form.get('warehouseId')?.updateValueAndValidity();
    this.form.get('siteReceivedBy')?.updateValueAndValidity();
  }
  
  onInvoiceSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validation = this.documentService.validateFile(file, ['pdf', 'image/*'], 10);
      
      if (validation.valid) {
        this.invoiceFile = file;
      } else {
        alert(validation.error);
        input.value = '';
      }
    }
  }
  
  onPhotosSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      
      for (const file of files) {
        const validation = this.documentService.validateFile(file, ['image/*'], 5);
        if (validation.valid) {
          this.deliveryPhotos.push(file);
        } else {
          alert(`${file.name}: ${validation.error}`);
        }
      }
    }
  }
  
  removePhoto(index: number): void {
    this.deliveryPhotos.splice(index, 1);
  }
  
  getReceiverName(badgeNumber: string): string {
    const person = this.mockManpower.find(m => m.badgeNumber === badgeNumber);
    return person ? person.name : '';
  }
  
  getWarehouseName(warehouseId: string): string {
    const warehouse = this.mockWarehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : '';
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    
    this.isUploading = true;
    const formValue = this.form.value;
    
    try {
      // Upload invoice if provided
      let invoiceDoc = null;
      if (this.invoiceFile) {
        this.uploadProgress = 20;
        invoiceDoc = await this.documentService.uploadFile(
          this.invoiceFile,
          'invoice',
          this.data.material.id,
          {
            workOrderId: this.data.workOrderId,
            invoiceNumber: formValue.invoiceNumber,
            invoiceAmount: formValue.invoiceAmount
          }
        ).toPromise();
      }
      
      // Upload delivery photos
      let photosDocs: any[] = [];
      if (this.deliveryPhotos.length > 0) {
        this.uploadProgress = 50;
        const uploadResult = await this.documentService.uploadMultipleFiles(
          this.deliveryPhotos,
          'photo',
          this.data.material.id,
          {
            workOrderId: this.data.workOrderId,
            photoType: 'delivery'
          }
        ).toPromise();
        photosDocs = uploadResult || [];
      }
      
      this.uploadProgress = 80;
      
      // Prepare delivery data
      const deliveryData = {
        delivery: {
          receivedDate: formValue.deliveryDate,
          receivedBy: formValue.receivedBy,
          receivedByName: this.getReceiverName(formValue.receivedBy),
          storageLocation: formValue.storageLocation,
          warehouseDetails: formValue.storageLocation === 'warehouse' ? {
            warehouseId: formValue.warehouseId,
            warehouseName: this.getWarehouseName(formValue.warehouseId),
            binLocation: formValue.binLocation
          } : undefined,
          deliveryNote: formValue.deliveryNote,
          deliveryPhotos: photosDocs.map(doc => ({
            id: doc.id,
            fileUrl: doc.fileUrl,
            uploadedDate: doc.uploadedDate
          }))
        },
        invoice: invoiceDoc ? {
          id: invoiceDoc.id,
          fileName: invoiceDoc.fileName,
          fileUrl: invoiceDoc.fileUrl,
          uploadedDate: invoiceDoc.uploadedDate,
          uploadedBy: invoiceDoc.uploadedBy,
          documentType: invoiceDoc.fileType.startsWith('image') ? 'image' : 'pdf'
        } : undefined,
        status: 'delivered'
      };
      
      this.uploadProgress = 100;
      
      // Return the result
      this.dialogRef.close(deliveryData);
      
    } catch (error) {
      console.error('Error processing delivery:', error);
      alert('Failed to process delivery. Please try again.');
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }
} 