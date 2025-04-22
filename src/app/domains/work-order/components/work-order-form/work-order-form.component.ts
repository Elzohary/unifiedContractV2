import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderItemService } from '../../services/work-order-item.service';
import { MaterialService } from '../../services/material.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  Iitem
} from '../../models/work-order.model';

@Component({
  selector: 'app-work-order-form',
  templateUrl: './work-order-form.component.html',
  styleUrls: ['./work-order-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatRadioModule
  ],
  providers: [
    WorkOrderService,
    WorkOrderItemService,
    MaterialService,
    NotificationService
  ]
})
export class WorkOrderFormComponent implements OnDestroy {
  form!: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  // Available items for dropdown
  availableItems: Iitem[] = [];

  // Priority options
  readonly priorityOptions: WorkOrderPriority[] = [
    'low',
    'medium',
    'high',
    'critical'
  ];

  // Category options
  readonly categoryOptions: string[] = [
    'Repair',
    'Installation',
    'Inspection',
    'Maintenance',
    'Emergency',
    'Upgrade',
    'Other'
  ];

  statusOptions = ['draft', 'pending', 'in_progress', 'completed', 'cancelled'];

  constructor(
    private fb: FormBuilder,
    private workOrderService: WorkOrderService,
    private workOrderItemService: WorkOrderItemService,
    private materialService: MaterialService,
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForm();
    this.loadAvailableItems();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      // Work Order Details
      details: this.fb.group({
        workOrderNumber: ['', Validators.required],
        internalOrderNumber: [{ value: '', disabled: true }],
        title: [''],
        description: [''],
        client: ['', Validators.required],
        location: ['', Validators.required],
        status: ['pending', Validators.required],
        priority: ['medium', Validators.required],
        category: ['', Validators.required],
        completionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        receivedDate: [new Date(), Validators.required],
        startDate: [new Date(), Validators.required],
        dueDate: ['', Validators.required],
        targetEndDate: ['', Validators.required],
        createdDate: [{ value: new Date(), disabled: true }],
        createdBy: [{ value: 'current-user', disabled: true }],
        lastUpdated: [new Date()]
      }),

      // Work Order Items
      items: this.fb.array([]),

      // Materials
      materials: this.fb.array([]),

      // Additional Sections
      additionalSections: this.fb.group({
        issues: this.fb.array([]),
        attachments: this.fb.array([]),
        tasks: this.fb.array([]),
        remarks: this.fb.array([]),
        actions: this.fb.array([]),
        photos: this.fb.array([]),
        forms: this.fb.array([])
      })
    });
  }

  // Form Arrays Getters
  get items() {
    return this.form.get('items') as FormArray;
  }

  get materials() {
    return this.form.get('materials') as FormArray;
  }

  get issues() {
    return this.form.get('additionalSections.issues') as FormArray;
  }

  get attachments() {
    return this.form.get('additionalSections.attachments') as FormArray;
  }

  get tasks() {
    return this.form.get('additionalSections.tasks') as FormArray;
  }

  get remarks() {
    return this.form.get('additionalSections.remarks') as FormArray;
  }

  get actions() {
    return this.form.get('additionalSections.actions') as FormArray;
  }

  get photos() {
    return this.form.get('additionalSections.photos') as FormArray;
  }

  get forms() {
    return this.form.get('additionalSections.forms') as FormArray;
  }

  // Add Methods
  addItem(): void {
    const itemGroup = this.fb.group({
      itemId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.items.push(itemGroup);
  }

  addMaterial(): void {
    const materialGroup = this.fb.group({
      type: ['', Validators.required], // 'Receivable' or 'Purchasable'
      name: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      unitCost: [0],
      status: ['pending'],
      supplier: [''],
      orderDate: [null],
      deliveryDate: [null]
    });
    this.materials.push(materialGroup);
  }

  addIssue(): void {
    const issueGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['medium', Validators.required]
    });
    this.issues.push(issueGroup);
  }

  addAttachment(): void {
    const attachmentGroup = this.fb.group({
      fileName: ['', Validators.required],
      fileType: [''],
      url: ['', Validators.required]
    });
    this.attachments.push(attachmentGroup);
  }

  addTask(): void {
    const taskGroup = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: [null],
      priority: ['medium']
    });
    this.tasks.push(taskGroup);
  }

  addRemark(): void {
    const remarkGroup = this.fb.group({
      content: ['', Validators.required],
      type: ['general']
    });
    this.remarks.push(remarkGroup);
  }

  addAction(): void {
    const actionGroup = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: [null]
    });
    this.actions.push(actionGroup);
  }

  addPhoto(): void {
    const photoGroup = this.fb.group({
      url: ['', Validators.required],
      caption: [''],
      type: ['before']
    });
    this.photos.push(photoGroup);
  }

  addForm(): void {
    const formGroup = this.fb.group({
      title: ['', Validators.required],
      type: ['checklist'],
      url: ['', Validators.required]
    });
    this.forms.push(formGroup);
  }

  // Remove Methods
  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  removeMaterial(index: number): void {
    this.materials.removeAt(index);
  }

  removeIssue(index: number): void {
    this.issues.removeAt(index);
  }

  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
  }

  removeTask(index: number): void {
    this.tasks.removeAt(index);
  }

  removeRemark(index: number): void {
    this.remarks.removeAt(index);
  }

  removeAction(index: number): void {
    this.actions.removeAt(index);
  }

  removePhoto(index: number): void {
    this.photos.removeAt(index);
  }

  removeForm(index: number): void {
    this.forms.removeAt(index);
  }

  // Load available items for dropdown
  private loadAvailableItems(): void {
    this.workOrderItemService.getItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items: Iitem[]) => {
          this.availableItems = items;
        },
        error: (error: Error) => {
          console.error('Error loading items:', error);
          this.snackBar.open('Error loading available items', 'Close', { duration: 3000 });
        }
      });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValue = this.form.value;

      // Generate internal order number
      const internalOrderNumber = `INT-${Date.now()}`;

      const newWorkOrder: Partial<WorkOrder> = {
        details: {
          workOrderNumber: formValue.details.workOrderNumber,
          internalOrderNumber: internalOrderNumber,
          title: formValue.details.title || '',
          description: formValue.details.description || '',
          priority: formValue.details.priority,
          category: formValue.details.category,
          startDate: formValue.details.startDate,
          dueDate: formValue.details.dueDate,
          targetEndDate: formValue.details.dueDate,
          location: formValue.details.location,
          client: formValue.details.client,
          status: 'pending' as WorkOrderStatus,
          createdDate: new Date().toISOString(),
          createdBy: 'current-user',
          completionPercentage: 0,
          receivedDate: new Date().toISOString()
        },
        items: formValue.items || [],
        remarks: formValue.additionalSections.remarks || [],
        issues: formValue.additionalSections.issues || [],
        materials: formValue.materials || [],
        permits: [],
        tasks: formValue.additionalSections.tasks || [],
        manpower: [],
        actions: formValue.additionalSections.actions || [],
        photos: formValue.additionalSections.photos || [],
        forms: formValue.additionalSections.forms || [],
        expenses: [],
        invoices: [],
        expenseBreakdown: {
          materials: 0,
          labor: 0,
          other: 0
        }
      };

      this.workOrderService.createWorkOrder(newWorkOrder)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (workOrder: WorkOrder) => {
            // If there are items in the work order, create them in the item service
            if (newWorkOrder.items && newWorkOrder.items.length > 0) {
              this.workOrderItemService.createItemsFromWorkOrder(
                newWorkOrder.items,
                workOrder.id
              ).subscribe(createdItems => {
                console.log(`Created ${createdItems.length} items for work order ${workOrder.id}`);
              });
            }

            this.snackBar.open('Work order created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/work-orders/details', workOrder.id]);
          },
          error: (error: Error) => {
            console.error('Error creating work order:', error);
            this.snackBar.open('Error creating work order', 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
    } else {
      this.markFormGroupTouched(this.form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(controlPath: string, errorName: string): boolean {
    const control = this.form.get(controlPath);
    return control ? control.hasError(errorName) && control.touched : false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
