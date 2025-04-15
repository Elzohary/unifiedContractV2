import { Component, OnInit, ElementRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  public chart: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Only initialize chart in browser environment
  }

  ngAfterViewInit() {
    // Wait for the view to be initialized before creating the chart
    if (this.isBrowser) {
      this.createChart();
    }
  }

  createChart() {
    if (!this.isBrowser || !this.chartCanvas) {
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    this.chart = new Chart(ctx, {
      type: 'bar', // this denotes the type of chart
      data: {
        // values on X-Axis
        labels: ['2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13', '2022-05-14'],
        datasets: [
          {
            label: "Income",
            data: ['467', '576', '572', '79', '92'],
            backgroundColor: '#0f3531'
          },
          {
            label: "Expenses",
            data: ['542', '542', '536', '327', '17'],
            backgroundColor: '#cf6329'
          }
        ]
      },
      options: {
        aspectRatio: 2.5
      }
    });
  }
}
