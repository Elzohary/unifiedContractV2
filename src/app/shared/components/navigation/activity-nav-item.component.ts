import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-activity-nav-item',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <a
      mat-button
      routerLink="/activity-dashboard"
      routerLinkActive="active-link"
      matTooltip="Activity Dashboard"
      class="activity-button"
    >
      <mat-icon>radar</mat-icon>
      <span>Activity Tracking</span>
    </a>
  `,
  styles: [`
    .activity-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }

    .activity-button mat-icon {
      color: var(--color-primary, #3f51b5);
    }

    .active-link {
      background-color: rgba(63, 81, 181, 0.08);
    }
  `]
})
export class ActivityNavItemComponent { }
