import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableAction } from '../ng-table.component';

@Component({
  selector: 'app-ng-table-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <!-- For single action, show button directly -->
    <ng-container *ngIf="actions && actions.length === 1">
      <button
        mat-icon-button
        [color]="actions[0].color || 'primary'"
        [matTooltip]="actions[0].tooltip || actions[0].label"
        (click)="onActionClick(actions[0], rowData)"
        *ngIf="isActionVisible(actions[0], rowData)">
        <mat-icon>{{ actions[0].icon }}</mat-icon>
      </button>
    </ng-container>

    <!-- For multiple actions, use menu -->
    <ng-container *ngIf="actions && actions.length > 1">
      <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button
          mat-menu-item
          *ngFor="let action of actions"
          (click)="onActionClick(action, rowData)"
          [disabled]="!isActionVisible(action, rowData)">
          <mat-icon [color]="action.color">{{ action.icon }}</mat-icon>
          <span>{{ action.label }}</span>
        </button>
      </mat-menu>
    </ng-container>
  `,
  styles: []
})
export class NgTableActionsComponent {
  @Input() actions: TableAction[] = [];
  @Input() rowData: any;

  @Output() actionClick = new EventEmitter<{action: TableAction, item: any}>();

  onActionClick(action: TableAction, item: any): void {
    this.actionClick.emit({ action, item });
  }

  isActionVisible(action: TableAction, item: any): boolean {
    return action.isVisible ? action.isVisible(item) : true;
  }
}
