import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-ng-card',
  imports: [
    MatCardModule,
    ExpansionPanelComponent,
    MatButtonModule
  ],
  templateUrl: './ng-card.component.html',
  styleUrl: './ng-card.component.scss'
})
export class NgCardComponent {

}
