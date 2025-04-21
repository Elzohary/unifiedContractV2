import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';

// Standalone components
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { ActivityMonitorComponent } from './components/activity-monitor/activity-monitor.component';
import { ActivityMonitorModule } from './components/activity-monitor/activity-monitor.module';
import { ActivityNavItemComponent } from './components/navigation/activity-nav-item.component';

// Import shared components, directives, and pipes here
// import { PageHeaderComponent } from './components/page-header/page-header.component';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatBadgeModule,
  MatExpansionModule
];

const standaloneComponents = [
  UnderConstructionComponent,
  StatsCardComponent,
  ActivityMonitorComponent,
  ActivityNavItemComponent
];

@NgModule({
  declarations: [
    // Shared components, directives, and pipes (non-standalone)
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...materialModules,
    ...standaloneComponents,
    ActivityMonitorModule
  ],
  exports: [
    // Re-export modules needed by most components
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Re-export material modules
    ...materialModules,
    // Re-export standalone components
    ...standaloneComponents,
    ActivityMonitorModule
  ]
})
export class SharedModule { }
