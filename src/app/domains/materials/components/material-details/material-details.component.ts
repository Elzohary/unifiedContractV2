import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseMaterial, SecMaterial, ClientType } from '../../models/material.model';

@Component({
  selector: 'app-material-details',
  templateUrl: './material-details.component.html',
  styleUrls: ['./material-details.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class MaterialDetailsComponent implements OnInit {
  @Input() material!: BaseMaterial;

  // Client type enum for template
  clientTypes = ClientType;

  // Make Object available to the template
  protected readonly Object = Object;

  // Flag to check if material is SEC type
  isSecMaterial = false;

  ngOnInit(): void {
    // Check if material is SEC material
    this.isSecMaterial = this.material.clientType === ClientType.SEC;
  }

  // Helper function to cast to SEC material
  getSecMaterial(): SecMaterial {
    return this.material as SecMaterial;
  }
}
