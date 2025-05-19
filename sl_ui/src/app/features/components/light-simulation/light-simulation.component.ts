// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { ChartConfigurationService } from '../../services/chart-configuration.service';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { GridService } from '../../services/grid.service';

@Component({
  selector: 'app-light-simulation',
  templateUrl: './light-simulation.component.html',
  styleUrls: ['./light-simulation.component.css']
})
export class LightSimulationComponent implements OnInit, OnChanges {
  // Input properties for grid dimensions and grid data
  @Input() gridDimension: number = 0;
  @Input() grid: Grid | null = null;

  separationNumber: number = 0;
  // Chart properties for Plotly visualization
  chartData: any[] = [];
  chartLayout: any;
  chartConfiguration: any;

  constructor(
    private chartConfigurationService: ChartConfigurationService,
    private gridService: GridService,
  ) { }

  // Initialize chart when component loads
  ngOnInit(): void {
    this.initializeChart();
  }

  // Handle input changes, particularly grid updates
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grid'] && this.grid) {
      if (this.grid?.id) {
        this.updateChart(this.grid.id);
      }
    }
  }

  // Set up initial chart configuration and empty surface
  private initializeChart(): void {
    this.chartLayout = this.chartConfigurationService.getChartSimulationLayout();
    this.chartConfiguration = this.chartConfigurationService.getChartRestrictiveToolbarConfiguration();
    this.chartData = [this.createBaseSurface()];
  }

  // Generate a matrix filled with zeros for initial chart state
  private generateInitialZValues(size: number): number[][] {
    return Array.from({ length: size }, () => Array(size).fill(0));
  }

  // Create base surface data structure for the 3D chart
  private createBaseSurface(): any {
    return {
      x: Array.from({ length: this.gridDimension }, (_, i) => i),
      y: Array.from({ length: this.gridDimension }, (_, i) => i),
      z: this.generateInitialZValues(this.gridDimension),
      type: 'surface',
      opacity: 0.8,
      showscale: false,
    };
  }

  // Handle separation number selection from UI
  onSeparationNumberSelect(): void {
    if (this.grid?.id) {
      this.updateChart(this.grid.id, this.separationNumber);
    }
  }

  // Update chart data with simulation results from service
  private updateChart(gridId: number, separationOffset: number = 0): void {
    this.gridService.getGridDistributionSimulation(gridId, separationOffset).subscribe(simulationGrid => {
      const processedSimulationGrid = this.processMatrixNegativeValues(simulationGrid)
      this.chartData = [{
        ...this.createBaseSurface(),
        z: processedSimulationGrid,
        x: Array.from({ length: processedSimulationGrid[0].length }, (_, i) => i),
        y: Array.from({ length: processedSimulationGrid.length }, (_, i) => i)
      }];
    });
  }

  // Convert -1 values to NaN for proper chart rendering
  private processMatrixNegativeValues = (matrix: number[][]) => {
    return matrix.map(row =>
      row.map(val => val === -1 ? NaN : val)
    );
  };
}
