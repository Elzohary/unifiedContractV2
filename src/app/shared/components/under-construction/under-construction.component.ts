import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-under-construction',
  imports: [
    CommonModule, 
    MatButtonModule,
    MatIconModule
  ],
  standalone: true,
  templateUrl: './under-construction.component.html',
  styleUrl: './under-construction.component.scss'
})
export class UnderConstructionComponent implements OnInit {
  @Input() title = 'Feature Under Construction';
  @Input() message = 'This feature is currently being developed and will be available soon. Thank you for your patience.';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Read data from route if available
    this.route.data.subscribe(data => {
      if (data['title']) {
        this.title = data['title'];
      }
      if (data['message']) {
        this.message = data['message'];
      }
    });
  }
}
