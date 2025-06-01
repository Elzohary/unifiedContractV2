import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Models and Services
import { MaterialCategory, CategoryCustomField } from '../../models/material.model';
import { MaterialInventoryViewModel } from '../../viewModels/material-inventory.viewmodel';

interface CategoryNode extends MaterialCategory {
  children?: CategoryNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-material-category-manager',
  templateUrl: './material-category-manager.component.html',
  styleUrls: ['./material-category-manager.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTreeModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatCheckboxModule
  ],
  providers: [MaterialInventoryViewModel]
})
export class MaterialCategoryManagerComponent implements OnInit {
  // Tree control
  treeControl = new NestedTreeControl<CategoryNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CategoryNode>();

  // Form for category editing
  categoryForm: FormGroup;
  customFieldForm: FormGroup;

  // State
  isEditing = false;
  editingCategory: CategoryNode | null = null;
  selectedCategory: CategoryNode | null = null;
  categories: MaterialCategory[] = [];
  categoryTree: CategoryNode[] = [];

  // Field types for custom fields
  fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'select', label: 'Dropdown' }
  ];

  constructor(
    private fb: FormBuilder,
    private viewModel: MaterialInventoryViewModel,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.createCategoryForm();
    this.customFieldForm = this.createCustomFieldForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private createCategoryForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      parentId: [null],
      isActive: [true],
      sortOrder: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private createCustomFieldForm(): FormGroup {
    return this.fb.group({
      fieldName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/)]],
      fieldType: ['text', Validators.required],
      required: [false],
      defaultValue: [''],
      options: [''], // Comma-separated for select type
      minValue: [null],
      maxValue: [null],
      pattern: ['']
    });
  }

  loadCategories(): void {
    this.viewModel.categories$.subscribe(categories => {
      this.categories = categories;
      this.categoryTree = this.buildCategoryTree(categories);
      this.dataSource.data = this.categoryTree;
    });
  }

  private buildCategoryTree(categories: MaterialCategory[]): CategoryNode[] {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // First pass: create all nodes
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach(cat => {
      const node = categoryMap.get(cat.id);
      if (node) {
        if (cat.parentId && categoryMap.has(cat.parentId)) {
          const parent = categoryMap.get(cat.parentId);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        } else {
          rootCategories.push(node);
        }
      }
    });

    // Sort children by sortOrder
    const sortChildren = (nodes: CategoryNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootCategories);
    return rootCategories;
  }

  hasChild = (_: number, node: CategoryNode) => !!node.children && node.children.length > 0;

  selectCategory(category: CategoryNode): void {
    this.selectedCategory = category;
  }

  addCategory(parent?: CategoryNode): void {
    this.isEditing = true;
    this.editingCategory = null;
    this.categoryForm.reset({
      parentId: parent?.id || null,
      isActive: true,
      sortOrder: 0
    });
  }

  editCategory(category: CategoryNode, event: Event): void {
    event.stopPropagation();
    this.isEditing = true;
    this.editingCategory = category;
    this.selectedCategory = category;

    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;

      if (this.editingCategory) {
        // Update existing category
        const updatedCategory: MaterialCategory = {
          ...this.editingCategory,
          ...formData,
          updatedAt: new Date()
        };

        // Update in local array (in real app, call API)
        const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
          this.categoryTree = this.buildCategoryTree(this.categories);
          this.dataSource.data = this.categoryTree;
          this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
        }
      } else {
        // Create new category
        const parentCategory = formData.parentId ?
          this.categories.find(c => c.id === formData.parentId) : null;

        const newCategory: MaterialCategory = {
          id: `cat-${Date.now()}`,
          ...formData,
          level: parentCategory ? parentCategory.level + 1 : 0,
          path: parentCategory ? [...parentCategory.path, parentCategory.id] : [],
          customFields: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.categories.push(newCategory);
        this.categoryTree = this.buildCategoryTree(this.categories);
        this.dataSource.data = this.categoryTree;
        this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
      }

      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingCategory = null;
    this.categoryForm.reset();
    this.customFieldForm.reset();
  }

  deleteCategory(category: CategoryNode, event: Event): void {
    event.stopPropagation();

    if (category.children && category.children.length > 0) {
      this.snackBar.open('Cannot delete category with subcategories', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      this.categories = this.categories.filter(c => c.id !== category.id);
      this.categoryTree = this.buildCategoryTree(this.categories);
      this.dataSource.data = this.categoryTree;
      this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });

      if (this.selectedCategory?.id === category.id) {
        this.selectedCategory = null;
      }
    }
  }

  toggleCategoryStatus(category: CategoryNode, event: Event): void {
    event.stopPropagation();
    category.isActive = !category.isActive;

    // Update in the main array
    const index = this.categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      this.categories[index].isActive = category.isActive;
    }

    this.snackBar.open(
      `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      'Close',
      { duration: 3000 }
    );
  }

  addCustomField(): void {
    if (this.customFieldForm.valid && this.selectedCategory) {
      const fieldData = this.customFieldForm.value;

      const newField: CategoryCustomField = {
        fieldName: fieldData.fieldName,
        fieldType: fieldData.fieldType,
        required: fieldData.required,
        defaultValue: fieldData.defaultValue || undefined,
        options: fieldData.fieldType === 'select' && fieldData.options ?
          fieldData.options.split(',').map((opt: string) => opt.trim()) : undefined,
        validation: {
          min: fieldData.minValue || undefined,
          max: fieldData.maxValue || undefined,
          pattern: fieldData.pattern || undefined
        }
      };

      // Add to selected category
      if (!this.selectedCategory.customFields) {
        this.selectedCategory.customFields = [];
      }
      this.selectedCategory.customFields.push(newField);

      // Update in main array
      const index = this.categories.findIndex(c => c.id === this.selectedCategory!.id);
      if (index !== -1) {
        this.categories[index].customFields = this.selectedCategory.customFields;
      }

      this.customFieldForm.reset({ fieldType: 'text', required: false });
      this.snackBar.open('Custom field added successfully', 'Close', { duration: 3000 });
    }
  }

  removeCustomField(category: CategoryNode, fieldIndex: number, event: Event): void {
    event.stopPropagation();

    if (category.customFields && category.customFields.length > fieldIndex) {
      category.customFields.splice(fieldIndex, 1);

      // Update in main array
      const index = this.categories.findIndex(c => c.id === category.id);
      if (index !== -1) {
        this.categories[index].customFields = category.customFields;
      }

      this.snackBar.open('Custom field removed successfully', 'Close', { duration: 3000 });
    }
  }

  drop(event: CdkDragDrop<CategoryNode[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // Update sort order
      event.container.data.forEach((cat, index) => {
        cat.sortOrder = index;
        const mainIndex = this.categories.findIndex(c => c.id === cat.id);
        if (mainIndex !== -1) {
          this.categories[mainIndex].sortOrder = index;
        }
      });

      this.snackBar.open('Category order updated', 'Close', { duration: 2000 });
    }
  }

  getCategoryIcon(category: CategoryNode): string {
    const iconMap: Record<string, string> = {
      'Electrical': 'electrical_services',
      'Mechanical': 'build',
      'Construction': 'construction',
      'Safety': 'health_and_safety',
      'Tools': 'handyman'
    };

    return iconMap[category.name] || 'folder';
  }

  getFieldTypeIcon(fieldType: string): string {
    const iconMap: Record<string, string> = {
      'text': 'text_fields',
      'number': 'pin',
      'date': 'event',
      'boolean': 'toggle_on',
      'select': 'list'
    };

    return iconMap[fieldType] || 'help';
  }

  onFieldTypeChange(): void {
    const fieldType = this.customFieldForm.get('fieldType')?.value;

    // Reset validation fields based on type
    if (fieldType !== 'number') {
      this.customFieldForm.patchValue({ minValue: null, maxValue: null });
    }

    if (fieldType !== 'text') {
      this.customFieldForm.patchValue({ pattern: '' });
    }

    if (fieldType !== 'select') {
      this.customFieldForm.patchValue({ options: '' });
    }
  }

  bulkAssignMaterials(category: CategoryNode): void {
    // TODO: Open dialog for bulk material assignment
    this.snackBar.open(`Bulk assignment for ${category.name} coming soon`, 'Close', { duration: 3000 });
  }

  exportCategories(): void {
    const exportData = {
      categories: this.categories,
      exportDate: new Date().toISOString(),
      totalCategories: this.categories.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `material-categories-${new Date().getTime()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Categories exported successfully', 'Close', { duration: 3000 });
  }
}
