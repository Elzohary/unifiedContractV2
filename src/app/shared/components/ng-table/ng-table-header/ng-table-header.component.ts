import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgTableSearchComponent } from '../ng-table-search/ng-table-search.component';

@Component({
  selector: 'app-ng-table-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    NgTableSearchComponent
  ],
  template: `
    <div class="ng-table-header">
      <h2 *ngIf="title" class="ng-table-title">{{ title }}</h2>

      <div class="ng-table-actions">
        <!-- Search component (optional) -->
        <app-ng-table-search
          *ngIf="showSearch"
          (filterChange)="onFilterChange($event)">
        </app-ng-table-search>

        <!-- Custom header content (transcluded) -->
        <ng-content></ng-content>

        <!-- Add Button (optional) -->
        <button
          *ngIf="showAddButton"
          mat-raised-button
          color="primary"
          class="add-button"
          (click)="onAddClick()">
          <mat-icon>add</mat-icon>
          {{ addButtonText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ng-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .ng-table-title {
      margin: 0;
      font-size: 1.5rem;
    }

    .ng-table-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .add-button {
      white-space: nowrap;
    }
  `]
})
export class NgTableHeaderComponent {
  @Input() title: string = '';
  @Input() showSearch: boolean = true;
  @Input() showAddButton: boolean = false;
  @Input() addButtonText: string = 'Add';

  @Output() addClick = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();

  onAddClick() {
    this.addClick.emit();
  }

  onFilterChange(filterValue: string) {
    this.filterChange.emit(filterValue);
  }
}
