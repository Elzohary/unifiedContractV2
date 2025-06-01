import { Component, OnInit, ElementRef, ViewChild, PLATFORM_ID, Inject, Input, OnDestroy, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  public chart: Chart | undefined;
  private isBrowser: boolean;

  @Input() chartData: number[][] = [];
  @Input() chartLabels: string[] = [];
  @Input() chartTitle = 'Chart';
  @Input() chartType: ChartType = 'bar';
  @Input() chartColors: string[] = ['var(--btn-primary)', 'var(--icon-accent)'];
  @Input() datasetLabels: string[] = ['Dataset 1', 'Dataset 2'];
  @Input() aspectRatio = 2.5;
  @Input() theme: 'light' | 'dark' = 'light';

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Initialize any required properties or setup
    if (!this.isBrowser) {
      console.warn('BarChartComponent: Running in non-browser environment, chart will not be rendered');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update chart when inputs change
    if (this.chart &&
        (changes['chartData'] ||
         changes['chartLabels'] ||
         changes['chartTitle'] ||
         changes['chartType'] ||
         changes['chartColors'] ||
         changes['datasetLabels'] ||
         changes['aspectRatio'] ||
         changes['theme'])) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    // Clean up chart instance when component is destroyed
    if (this.chart) {
      this.chart.destroy();
    }
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

    // Use default data if no inputs are provided
    const labels = this.chartLabels.length > 0 ?
      this.chartLabels :
      ['2022-05-10', '2022-05-11', '2022-05-12', '2022-05-13', '2022-05-14'];

    const datasets = [];

    // If chartData is provided, use it to create datasets
    if (this.chartData.length > 0) {
      for (let i = 0; i < this.chartData.length; i++) {
        datasets.push({
          label: i < this.datasetLabels.length ? this.datasetLabels[i] : `Dataset ${i+1}`,
          data: this.chartData[i],
          backgroundColor: i < this.chartColors.length ? this.chartColors[i] : this.getThemeColor(i)
        });
      }
    } else {
      // Default datasets if none provided
      datasets.push(
        {
          label: "Income",
          data: [467, 576, 572, 79, 92],
          backgroundColor: 'var(--btn-primary)'
        },
        {
          label: "Expenses",
          data: [542, 542, 536, 327, 17],
          backgroundColor: 'var(--icon-accent)'
        }
      );
    }

    const config: ChartConfiguration = {
      type: this.chartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        aspectRatio: this.aspectRatio,
        plugins: {
          title: {
            display: !!this.chartTitle,
            text: this.chartTitle,
            color: 'var(--text-primary)',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'var(--text-primary)',
              font: {
                size: 12
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'var(--card-border)'
            },
            ticks: {
              color: 'var(--text-secondary)'
            }
          },
          y: {
            grid: {
              color: 'var(--card-border)'
            },
            ticks: {
              color: 'var(--text-secondary)'
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  /**
   * Updates the chart when input properties change
   */
  updateChart(): void {
    if (!this.chart) {
      return;
    }

    // Update labels
    if (this.chartLabels.length > 0) {
      this.chart.data.labels = this.chartLabels;
    }

    // Update datasets
    if (this.chartData.length > 0) {
      // Clear existing datasets
      this.chart.data.datasets = [];

      // Add new datasets
      for (let i = 0; i < this.chartData.length; i++) {
        this.chart.data.datasets.push({
          label: i < this.datasetLabels.length ? this.datasetLabels[i] : `Dataset ${i+1}`,
          data: this.chartData[i],
          backgroundColor: i < this.chartColors.length ? this.chartColors[i] : this.getThemeColor(i)
        });
      }
    }

    // Update chart type if needed
    if ((this.chart.config as ChartConfiguration).type !== this.chartType) {
      this.chart.destroy();
      this.createChart();
      return;
    }

    // Update aspect ratio
    if (this.chart.options?.aspectRatio !== this.aspectRatio) {
      this.chart.options.aspectRatio = this.aspectRatio;
    }

    // Update title
    if (this.chart.options?.plugins?.title) {
      this.chart.options.plugins.title.text = this.chartTitle;
      this.chart.options.plugins.title.display = !!this.chartTitle;
      this.chart.options.plugins.title.color = 'var(--text-primary)';
    }

    // Update theme colors
    if (this.chart.options?.plugins?.legend?.labels) {
      this.chart.options.plugins.legend.labels.color = 'var(--text-primary)';
    }

    if (this.chart.options?.scales) {
      const xScale = this.chart.options.scales['x'];
      if (xScale?.grid && xScale?.ticks) {
        xScale.grid.color = 'var(--card-border)';
        xScale.ticks.color = 'var(--text-secondary)';
      }

      const yScale = this.chart.options.scales['y'];
      if (yScale?.grid && yScale?.ticks) {
        yScale.grid.color = 'var(--card-border)';
        yScale.ticks.color = 'var(--text-secondary)';
      }
    }

    this.chart.update();
  }

  /**
   * Gets a theme color based on the dataset index
   */
  private getThemeColor(index: number): string {
    const themeColors = [
      'var(--btn-primary)',
      'var(--icon-accent)',
      'var(--icon-success)',
      'var(--icon-warning)',
      'var(--icon-danger)'
    ];
    return themeColors[index % themeColors.length];
  }
}
