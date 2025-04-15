import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

const routes: Routes = [
  {
    path: 'equipment',
    children: [
      { 
        path: '', 
        loadComponent: () => import('./components/equipment-dashboard/equipment-dashboard.component')
          .then(m => m.EquipmentDashboardComponent)
      },
      { 
        path: 'list', 
        loadComponent: () => import('./components/equipment-list/equipment-list.component')
          .then(m => m.EquipmentListComponent)
      },
      { 
        path: 'maintenance', 
        loadComponent: () => import('./components/equipment-maintenance/equipment-maintenance.component')
          .then(m => m.EquipmentMaintenanceComponent)
      },
      { 
        path: 'assignments', 
        loadComponent: () => import('./components/equipment-assignment/equipment-assignment.component')
          .then(m => m.EquipmentAssignmentComponent)
      },
      { 
        path: ':id', 
        loadComponent: () => import('./components/equipment-details/equipment-details.component')
          .then(m => m.EquipmentDetailsComponent)
      },
      { 
        path: ':id/maintenance', 
        loadComponent: () => import('./components/equipment-maintenance/equipment-maintenance.component')
          .then(m => m.EquipmentMaintenanceComponent)
      },
      { 
        path: ':id/assign', 
        loadComponent: () => import('./components/equipment-assignment/equipment-assignment.component')
          .then(m => m.EquipmentAssignmentComponent)
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule
  ],
  exports: [RouterModule]
})
export class ResourcesModule { } 