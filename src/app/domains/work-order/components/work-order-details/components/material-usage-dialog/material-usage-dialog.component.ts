import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { materialAssignment, UsageRecord } from '../../../../models/work-order.model';
import { DocumentService } from '../../../../../../shared/services/document.service';
import { ManpowerAssignment } from '../../../../models/work-order.model';

export interface MaterialUsageDialogData {
  material: materialAssignment;
  workOrderId: string;
  action: 'issue-to-site' | 'update-usage';
  manpowerList?: ManpowerAssignment[];
}

@Component({
  selector: 'app-material-usage-dialog',
  templateUrl: './material-usage-dialog.component.html',
  styleUrls: ['./material-usage-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ]
})
export class MaterialUsageDialogComponent implements OnInit {
  form: FormGroup;
  usagePhotos: File[] = [];
  uploadProgress = 0;
  isUploading = false;
  
  // Mock data - should come from services
  mockManpower: ManpowerAssignment[] = [
    { id: 'mp1', badgeNumber: 'B12345', name: 'Ahmed Ali', role: 'Foreman', hoursAssigned: 8, startDate: new Date().toISOString(), workOrderNumber: '' },
    { id: 'mp2', badgeNumber: 'B12346', name: 'Mohammed Hassan', role: 'Technician', hoursAssigned: 8, startDate: new Date().toISOString(), workOrderNumber: '' },
    { id: 'mp3', badgeNumber: 'B12347', name: 'Khalid Omar', role: 'Worker', hoursAssigned: 8, startDate: new Date().toISOString(), workOrderNumber: '' }
  ];
  
  get dialogTitle(): string {
    if (this.data.material.materialType === 'receivable') {
      return 'Update Receivable Material Usage';
    }
    return this.data.action === 'issue-to-site' ? 'Issue Material to Site' : 'Update Material Usage';
  }
  
  get availableQuantity(): number {
    if (this.data.material.materialType === 'receivable') {
      return this.data.material.receivableMaterial?.receivedQuantity || 
             this.data.material.receivableMaterial?.estimatedQuantity || 0;
    }
    return this.data.material.purchasableMaterial?.quantity || 0;
  }
  
  get usedQuantity(): number {
    if (this.data.material.materialType === 'receivable') {
      // Calculate from usage records if available
      if (this.data.material.receivableMaterial?.usageRecords?.length) {
        const usageRecords = this.data.material.receivableMaterial.usageRecords
          .filter((r: UsageRecord) => r.recordType === 'usage-update' && r.quantityUsed)
          .map((r: UsageRecord) => r.quantityUsed || 0);
        return usageRecords.reduce((sum: number, qty: number) => sum + qty, 0);
      }
      return this.data.material.receivableMaterial?.actualQuantity || 0;
    }
    
    // Calculate from usage records if available, otherwise use legacy field
    if (this.data.material.purchasableMaterial?.siteUsageRecords?.length) {
      const usageRecords = this.data.material.purchasableMaterial.siteUsageRecords
        .filter(r => r.recordType === 'usage-update' && r.quantityUsed)
        .map(r => r.quantityUsed || 0);
      return usageRecords.reduce((sum, qty) => sum + qty, 0);
    }
    return this.data.material.purchasableMaterial?.siteUsage?.actualQuantityUsed || 0;
  }
  
  get remainingQuantity(): number {
    return this.availableQuantity - this.usedQuantity;
  }
  
  get formUsedQuantity(): number {
    return this.form?.get('actualQuantityUsed')?.value || 0;
  }
  
  get formRemainingQuantity(): number {
    return this.availableQuantity - this.formUsedQuantity;
  }
  
  get materialName(): string {
    if (this.data.material.materialType === 'receivable') {
      return this.data.material.receivableMaterial?.name || 'Unknown Material';
    }
    return this.data.material.purchasableMaterial?.name || 'Unknown Material';
  }
  
  get materialUnit(): string {
    if (this.data.material.materialType === 'receivable') {
      return this.data.material.receivableMaterial?.unit || 'units';
    }
    return this.data.material.purchasableMaterial?.unit || 'units';
  }
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MaterialUsageDialogComponent>,
    private documentService: DocumentService,
    @Inject(MAT_DIALOG_DATA) public data: MaterialUsageDialogData
  ) {
    this.form = this.createForm();
  }
  
  ngOnInit(): void {
    this.setupFormBasedOnAction();
  }
  
  private createForm(): FormGroup {
    const existingUsage = this.data.material.purchasableMaterial?.siteUsage;
    
    // For new usage updates, start with empty values except for site issue details
    const isNewUsageUpdate = this.data.action === 'update-usage';
    
    return this.fb.group({
      // For issuing to site
      issuedDate: [existingUsage?.issuedDate || new Date(), Validators.required],
      issuedBy: ['Current User'], // Auto-filled with current user
      releasedBy: ['', Validators.required], // Warehouse keeper who releases the material
      receivedBySite: [existingUsage?.receivedBySite || '', Validators.required],
      
      // For usage update - always start fresh for new records
      actualQuantityUsed: [0, [Validators.required, Validators.min(0)]],
      usagePercentage: [0],
      usageCompletedDate: [new Date()],
      usageNotes: [''],
      
      // Remaining quantity handling
      remainingAction: [''], // 'return' or 'waste'
      wasteReason: [''],
      returnToWarehouse: [false],
      reserveForWorkOrder: [false] // true = reserve for same WO, false = available for all
    });
  }
  
  private setupFormBasedOnAction(): void {
    if (this.data.action === 'issue-to-site') {
      // Clear usage validators
      this.form.get('actualQuantityUsed')?.clearValidators();
      this.form.get('actualQuantityUsed')?.updateValueAndValidity();
      this.form.get('remainingAction')?.clearValidators();
      this.form.get('remainingAction')?.updateValueAndValidity();
    } else {
      // Clear issue validators
      this.form.get('releasedBy')?.clearValidators();
      this.form.get('releasedBy')?.updateValueAndValidity();
      this.form.get('receivedBySite')?.clearValidators();
      this.form.get('receivedBySite')?.updateValueAndValidity();
      
      // Set max validator for quantity
      const maxQuantity = this.availableQuantity;
      this.form.get('actualQuantityUsed')?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(maxQuantity)
      ]);
      
      // Calculate percentage on quantity change
      this.form.get('actualQuantityUsed')?.valueChanges.subscribe(value => {
        const percentage = (value / maxQuantity) * 100;
        this.form.patchValue({ usagePercentage: Math.round(percentage) }, { emitEvent: false });
        
        // Check if there's remaining quantity
        const hasRemaining = value < maxQuantity && value > 0;
        if (hasRemaining) {
          this.form.get('remainingAction')?.setValidators(Validators.required);
        } else {
          this.form.get('remainingAction')?.clearValidators();
          this.form.patchValue({ 
            remainingAction: '', 
            wasteReason: '',
            returnToWarehouse: false,
            reserveForWorkOrder: false 
          });
        }
        this.form.get('remainingAction')?.updateValueAndValidity();
      });
      
      // Handle remaining action changes
      this.form.get('remainingAction')?.valueChanges.subscribe(action => {
        if (action === 'waste') {
          this.form.get('wasteReason')?.setValidators(Validators.required);
          this.form.get('reserveForWorkOrder')?.clearValidators();
          this.form.patchValue({ returnToWarehouse: false, reserveForWorkOrder: false });
        } else if (action === 'return' || action === 'reserve-for-later') {
          this.form.get('wasteReason')?.clearValidators();
          this.form.get('reserveForWorkOrder')?.setValidators(Validators.required);
          this.form.patchValue({ returnToWarehouse: action === 'return', wasteReason: '' });
        } else if (action === 'return-to-client') {
          this.form.get('wasteReason')?.clearValidators();
          this.form.get('reserveForWorkOrder')?.clearValidators();
          this.form.patchValue({ returnToWarehouse: false, reserveForWorkOrder: false, wasteReason: '' });
        } else {
          this.form.get('wasteReason')?.clearValidators();
          this.form.get('reserveForWorkOrder')?.clearValidators();
        }
        this.form.get('wasteReason')?.updateValueAndValidity();
        this.form.get('reserveForWorkOrder')?.updateValueAndValidity();
      });
      
      // If updating existing usage, trigger percentage calculation
      const currentValue = this.form.get('actualQuantityUsed')?.value;
      if (currentValue > 0) {
        const percentage = (currentValue / maxQuantity) * 100;
        this.form.patchValue({ usagePercentage: Math.round(percentage) }, { emitEvent: false });
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
          this.usagePhotos.push(file);
        } else {
          alert(`${file.name}: ${validation.error}`);
        }
      }
    }
  }
  
  removePhoto(index: number): void {
    this.usagePhotos.splice(index, 1);
  }
  
  getPersonName(badgeNumber: string): string {
    const person = this.mockManpower.find(m => m.badgeNumber === badgeNumber);
    return person ? person.name : '';
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    
    this.isUploading = true;
    const formValue = this.form.value;
    
    try {
      // Upload usage photos
      let photosDocs: any[] = [];
      if (this.usagePhotos.length > 0) {
        this.uploadProgress = 50;
        const uploadResult = await this.documentService.uploadMultipleFiles(
          this.usagePhotos,
          'photo',
          this.data.material.id,
          {
            workOrderId: this.data.workOrderId,
            photoType: this.data.action === 'issue-to-site' ? 'site-issue' : 'usage'
          }
        ).toPromise();
        photosDocs = uploadResult || [];
      }
      
      this.uploadProgress = 80;
      
      let result;
      const currentTime = new Date().toISOString();
      
      if (this.data.action === 'issue-to-site') {
        // Create site issue record
        const siteIssueRecord: any = {
          id: `usage_${Date.now()}`,
          recordType: 'site-issue',
          recordDate: formValue.issuedDate || currentTime,
          recordedBy: formValue.issuedBy,
          recordedByName: 'Current User', // TODO: Get from auth
          
          issuedToSite: true,
          issuedDate: formValue.issuedDate,
          issuedBy: formValue.issuedBy,
          releasedBy: formValue.releasedBy, // Warehouse keeper badge number
          releasedByName: this.getPersonName(formValue.releasedBy), // Warehouse keeper name
          receivedBySite: formValue.receivedBySite,
          receivedBySiteName: this.getPersonName(formValue.receivedBySite),
          
          photos: photosDocs.map(doc => ({
            id: doc.id,
            fileUrl: doc.fileUrl,
            description: 'Site receiving photo',
            uploadedDate: doc.uploadedDate,
            uploadedBy: 'Current User'
          }))
        };
        
        result = {
          siteUsageRecords: [
            ...(this.data.material.purchasableMaterial?.siteUsageRecords || []),
            siteIssueRecord
          ],
          // Update legacy field for compatibility
          siteUsage: {
            issuedToSite: true,
            issuedDate: formValue.issuedDate,
            issuedBy: formValue.issuedBy,
            releasedBy: formValue.releasedBy,
            releasedByName: this.getPersonName(formValue.releasedBy),
            receivedBySite: formValue.receivedBySite,
            receivedBySiteName: this.getPersonName(formValue.receivedBySite)
          },
          status: 'in-use'
        };
      } else {
        // Calculate cumulative usage
        const previousUsage = this.usedQuantity;
        const newUsage = formValue.actualQuantityUsed;
        const cumulativeUsage = previousUsage + newUsage;
        const totalQuantity = this.availableQuantity;
        const cumulativePercentage = Math.round((cumulativeUsage / totalQuantity) * 100);
        const remainingQuantity = totalQuantity - cumulativeUsage;
        
        if (this.data.material.materialType === 'receivable') {
          // Handle receivable material usage
          const usageRecord: UsageRecord = {
            id: `usage_${Date.now()}`,
            recordType: 'usage-update',
            recordDate: formValue.usageCompletedDate || currentTime,
            recordedBy: 'Current User', // TODO: Get from auth
            recordedByName: 'Current User',
            
            quantityUsed: newUsage,
            cumulativeQuantityUsed: cumulativeUsage,
            usagePercentage: cumulativePercentage,
            remainingQuantity: remainingQuantity,
            usageNotes: formValue.usageNotes,
            
            photos: photosDocs.map(doc => ({
              id: doc.id,
              fileUrl: doc.fileUrl,
              description: formValue.usageNotes || 'Material usage photo',
              uploadedDate: doc.uploadedDate,
              uploadedBy: 'Current User'
            }))
          };
          
          const records: UsageRecord[] = [usageRecord];
          let finalStatus = cumulativePercentage >= 100 ? 'used' : 'received';
          
          // Handle remaining quantity for receivable materials
          if (remainingQuantity > 0 && formValue.remainingAction) {
            if (formValue.remainingAction === 'return-to-client') {
              // Create return to client record
              const returnRecord: UsageRecord = {
                id: `return_${Date.now()}`,
                recordType: 'return-to-client',
                recordDate: currentTime,
                recordedBy: 'Current User',
                recordedByName: 'Current User',
                
                quantityReturned: remainingQuantity,
                returnReason: formValue.wasteReason || 'Extra material not needed',
                
                photos: []
              };
              records.push(returnRecord);
              finalStatus = 'used'; // Material cycle is complete
              
            } else if (formValue.remainingAction === 'reserve-for-later') {
              // Create reservation record
              const reserveRecord: UsageRecord = {
                id: `reserve_${Date.now()}`,
                recordType: 'reserve-for-later',
                recordDate: currentTime,
                recordedBy: 'Current User',
                recordedByName: 'Current User',
                
                remainingQuantity: remainingQuantity,
                reservedForWorkOrder: formValue.reserveForWorkOrder,
                reservationNotes: formValue.reserveForWorkOrder 
                  ? `Reserved for work order ${this.data.workOrderId}`
                  : 'Available for any work order',
                
                photos: []
              };
              records.push(reserveRecord);
              // Status remains 'received' as material is still available
            }
          }
          
          result = {
            receivableMaterial: {
              ...this.data.material.receivableMaterial!,
              usageRecords: [
                ...(this.data.material.receivableMaterial?.usageRecords || []),
                ...records
              ],
              actualQuantity: cumulativeUsage,
              remainingQuantity: remainingQuantity,
              status: finalStatus
            }
          };
          
        } else {
          // Handle purchasable material usage (existing code)
          // Create usage update record
          const usageRecord: any = {
            id: `usage_${Date.now()}`,
            recordType: 'usage-update',
            recordDate: formValue.usageCompletedDate || currentTime,
            recordedBy: 'Current User', // TODO: Get from auth
            recordedByName: 'Current User',
            
            quantityUsed: newUsage,
            cumulativeQuantityUsed: cumulativeUsage,
            usagePercentage: cumulativePercentage,
            remainingQuantity: remainingQuantity,
            usageNotes: formValue.usageNotes,
            
            photos: photosDocs.map(doc => ({
              id: doc.id,
              fileUrl: doc.fileUrl,
              description: formValue.usageNotes || 'Material usage photo',
              uploadedDate: doc.uploadedDate,
              uploadedBy: 'Current User'
            }))
          };
          
          const records = [usageRecord];
          let finalStatus = cumulativePercentage >= 100 ? 'used' : 'in-use';
          
          // Handle remaining quantity if applicable
          if (remainingQuantity > 0 && formValue.remainingAction) {
            if (formValue.remainingAction === 'waste') {
              // Create waste record
              const wasteRecord: any = {
                id: `waste_${Date.now()}`,
                recordType: 'waste',
                recordDate: currentTime,
                recordedBy: 'Current User',
                recordedByName: 'Current User',
                
                quantityWasted: remainingQuantity,
                wasteReason: formValue.wasteReason,
                
                photos: [] // Could add waste photos if needed
              };
              records.push(wasteRecord);
              finalStatus = 'used'; // Material is fully consumed
              
            } else if (formValue.remainingAction === 'return') {
              // Create return record
              const returnRecord: any = {
                id: `return_${Date.now()}`,
                recordType: 'return',
                recordDate: currentTime,
                recordedBy: 'Current User',
                recordedByName: 'Current User',
                
                quantityReturned: remainingQuantity,
                reservedForWorkOrder: formValue.reserveForWorkOrder,
                usageNotes: formValue.reserveForWorkOrder 
                  ? `Returned to warehouse - Reserved for work order ${this.data.workOrderId}`
                  : 'Returned to warehouse - Available for any work order',
                
                photos: []
              };
              records.push(returnRecord);
              // Status depends on whether it's reserved or not
              finalStatus = formValue.reserveForWorkOrder ? 'in-use' : 'delivered';
            }
          }
          
          result = {
            siteUsageRecords: [
              ...(this.data.material.purchasableMaterial?.siteUsageRecords || []),
              ...records
            ],
            // Update legacy field with cumulative values
            siteUsage: {
              ...this.data.material.purchasableMaterial?.siteUsage,
              actualQuantityUsed: cumulativeUsage,
              usagePercentage: cumulativePercentage,
              usageCompletedDate: formValue.usageCompletedDate,
              usageNotes: formValue.usageNotes,
              usagePhotos: photosDocs.map(doc => ({
                id: doc.id,
                fileUrl: doc.fileUrl,
                description: formValue.usageNotes || 'Material usage photo',
                uploadedDate: doc.uploadedDate,
                uploadedBy: 'Current User'
              }))
            },
            status: finalStatus,
            // Add reservation info if returning to warehouse
            ...(formValue.remainingAction === 'return' && {
              reservedForWorkOrder: formValue.reserveForWorkOrder ? this.data.workOrderId : null
            })
          };
        }
      }
      
      this.uploadProgress = 100;
      
      // Return the result
      this.dialogRef.close(result);
      
    } catch (error) {
      console.error('Error processing material usage:', error);
      alert('Failed to process material usage. Please try again.');
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }
} 