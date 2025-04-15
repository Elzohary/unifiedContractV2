import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss'
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = 0;
  @Input() icon: string = 'trending_up';
  @Input() cardColor: 'primary' | 'success' | 'warning' | 'error' = 'primary';
  @Input() trend: number = 0;
  @Input() trendLabel: string = 'vs last period';
  @Input() valuePrefix: string = '';
  @Input() valueSuffix: string = '';
}
