// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { ChartConfigurationService } from '../../services/chart-configuration.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { MatDialog } from '@angular/material/dialog';
import { LightIntensityDistributionDialogComponent } from '../light-intensity-distribution-dialog/light-intensity-distribution-dialog.component';

// Main component for visualizing intensity data through different chart types
@Component({
  selector: 'app-light-intensity-distribution',
  templateUrl: './light-intensity-distribution.component.html',
  styleUrls: ['./light-intensity-distribution.component.css']
})
export class LightIntensityDistributionComponent implements OnInit, OnChanges {
  @Input() capturedGrids: Grid[] = [];
  @Input() selectedGridIndex: number | null = null;
  @Input() gridDimension: number = 8;

  activeTab: string = 'histogram';
  chartData: any[] = [];
  chartLayout: any;

  constructor(
    private chartConfigurationService: ChartConfigurationService,
    private dialog: MatDialog
  ) { }

  // Initialize chart with default layout
  ngOnInit(): void {
    this.chartLayout = this.chartConfigurationService.getChartDefaultLayout();
    this.updateChart();
  }

  // Update chart when input data changes
  ngOnChanges(): void {
    this.updateChart();
  }

  // Handle dialog
  openChartInfoDialog(): void {
    this.dialog.open(LightIntensityDistributionDialogComponent, {
      width: '90%',
      maxWidth: '600px',
    });
  }

  // Switch between different chart views
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.updateChart();
  }

  // Main chart update handler
  private updateChart(): void {
    if (!this.isValidGridData()) {
      this.chartData = [];
      return;
    }

    const gridMessages = this.capturedGrids[this.selectedGridIndex!].grid_messages!;

    // Route to appropriate chart generator based on active tab
    switch (this.activeTab) {
      case 'histogram':
        this.updateHistogramChart(gridMessages);
        break;
      case 'polar':
        this.updatePolarChart(gridMessages);
        break;
      case 'threshold':
        this.updateThresholdChart(gridMessages);
        break;
    }
  }

  // Validate if grid data exists and is accessible
  private isValidGridData(): boolean {
    return !!(
      this.capturedGrids.length &&
      this.selectedGridIndex !== null &&
      this.capturedGrids[this.selectedGridIndex]?.grid_messages?.length
    );
  }

  // Generate histogram chart of intensity distribution
  private updateHistogramChart(gridMessages: any[]): void {
    const intensities = gridMessages.map(msg => msg.intensity);

    this.chartData = [{
      x: intensities,
      type: 'histogram',
      marker: {
        color: intensities,
        colorscale: 'RdBu',
        cmin: 20,
        cmax: 400
      },
      xbins: { start: 20, end: 400, size: 10 },
      opacity: 1
    }];

    this.chartLayout = {
      title: 'Intensity Distribution',
      xaxis: { title: 'Intensity Value', range: [0, 400] },
      yaxis: { title: 'Count of Grid Cells' },
      bargap: 0.1
    };
  }

  // Generate polar plot of intensity distribution
  private updatePolarChart(gridMessages: any[]): void {
    const center = (this.gridDimension - 1) / 2;
    const polarData = gridMessages.map(msg => {
      const dx = msg.x_pos - center;
      const dy = msg.y_pos - center;
      return {
        r: msg.intensity,
        theta: Math.atan2(dy, dx) * (180 / Math.PI),
        intensity: msg.intensity
      };
    });

    this.chartData = [{
      r: polarData.map(d => d.r),
      theta: polarData.map(d => d.theta),
      type: 'scatterpolar',
      mode: 'markers',
      marker: {
        color: polarData.map(d => d.intensity),
        colorscale: 'RdBu_r',
        cmin: 20,
        cmax: 400,
        size: 8,
      },
      hoverinfo: 'r+theta',
      hovertemplate: 'Intensity: %{r}<br>Angle: %{theta}°'
    }];

    this.chartLayout = {
      title: 'Polar Intensity Distribution',
      polar: {
        radialaxis: { title: 'Intensity', range: [0, 400] },
        angularaxis: { rotation: 90, direction: 'clockwise' }
      }
    };
  }

  // Generate threshold analysis curve
  private updateThresholdChart(gridMessages: any[]): void {
    const thresholds = Array.from({ length: 20 }, (_, i) => 20 + i * 20);
    const areaPct = thresholds.map(t => {
      const efficientPixels = gridMessages.filter(msg => msg.intensity >= t).length;
      return (efficientPixels / gridMessages.length) * 100;
    });

    this.chartData = [{
      x: thresholds,
      y: areaPct,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f78103' },
      marker: { size: 8 },
      name: 'Efficient Area %'
    }];

    this.chartLayout = {
      title: 'Threshold vs. Efficient Area',
      xaxis: { title: 'Intensity Threshold', range: [0, 400] },
      yaxis: { title: '% of Total Area', range: [0, 100] },
      hovermode: 'closest'
    };
  }
}
