import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ng-table-search',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <input
        matInput
        (keyup)="onSearch($event)"
        [placeholder]="placeholder"
        #searchInput>
      <mat-icon matPrefix>search</mat-icon>
      <button
        *ngIf="searchInput.value"
        matSuffix
        mat-icon-button
        aria-label="Clear"
        (click)="clearSearch(searchInput)">
        <mat-icon>close</mat-icon>
      </button>
    </mat-form-field>
  `,
  styles: [`
    .search-field {
      width: 250px;
    }
  `]
})
export class NgTableSearchComponent {
  @Input() placeholder = 'Search';
  @Output() filterChange = new EventEmitter<string>();

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterChange.emit(value.trim().toLowerCase());
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.filterChange.emit('');
  }
}
