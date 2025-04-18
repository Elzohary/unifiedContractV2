import { Component, ViewEncapsulation } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { projectMenuItems } from '../../models/menu-items';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-side-menu-content',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatChipsModule,
    DragDropModule,
    RouterLinkActive,
    RouterModule,
    MatButtonModule 
  ],
  templateUrl: './side-menu-content.component.html',
  styleUrl: './side-menu-content.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: 1,
        overflow: 'visible'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class SideMenuContentComponent {
  projectMenu = projectMenuItems;
  collapsedSections: Record<string, boolean> = {};

  toggleSection(sectionLabel: string): void {
    this.collapsedSections[sectionLabel] = !this.collapsedSections[sectionLabel];
  }

  isSectionCollapsed(sectionLabel: string): boolean {
    return this.collapsedSections[sectionLabel] === true;
  }
}
