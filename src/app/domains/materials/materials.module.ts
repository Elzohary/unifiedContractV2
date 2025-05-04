import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { MaterialsManagementComponent } from './components/materials-management/materials-management.component';

const routes: Routes = [
  {
    path: '',
    component: MaterialsManagementComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MaterialsManagementComponent
  ],
  providers: []
})
export class MaterialsModule { }
