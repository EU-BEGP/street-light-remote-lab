// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, Input, OnInit } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { ChartSurface } from '../../interfaces/chart-surface';
import { ChartConfigurationService } from '../../services/chart-configuration.service';

@Component({
  selector: 'app-static-intensity-chart',
  templateUrl: './static-intensity-chart.component.html',
  styleUrls: ['./static-intensity-chart.component.css']
})
export class StaticIntensityChartComponent implements OnInit {
  @Input() gridDimension: number = 0;
  @Input() grid: Grid | null = null;

  chartSurface: ChartSurface = this.createEmptySurface();
  chartLayout: any;

  constructor(
    private chartConfigurationService: ChartConfigurationService
  ) { }

  ngOnInit(): void {
    this.chartLayout = this.chartConfigurationService.getChartDefaultLayout();
    this.initializeChart();
  }

  ngOnChanges(): void {
    this.initializeChart();
    this.updateChart();
  }

  private initializeChart(): void {
    this.chartSurface = this.createEmptySurface();
  }

  private createEmptySurface(): ChartSurface {
    return {
      x: Array.from({ length: this.gridDimension }, (_, i) => i),
      y: Array.from({ length: this.gridDimension }, (_, i) => i),
      z: Array.from({ length: this.gridDimension }, () =>
        Array(this.gridDimension).fill(0)),
      type: 'surface',
      opacity: 0.8,
      showscale: false
    };
  }

  private updateChart(): void {
    if (!this.grid?.grid_messages || !this.gridDimension) return;

    const updatedZ = [...this.chartSurface.z];

    this.grid.grid_messages.forEach(message => {
      if (this.isValidPosition(message.x_pos, message.y_pos)) {
        updatedZ[message.y_pos][message.x_pos] =
          message.splined_intensity ?? message.intensity;
      }
    });

    this.chartSurface = {
      ...this.chartSurface,
      z: updatedZ
    };
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridDimension && y >= 0 && y < this.gridDimension;
  }
}
