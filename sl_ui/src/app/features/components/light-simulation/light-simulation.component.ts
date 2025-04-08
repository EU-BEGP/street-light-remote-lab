// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ChartSurface } from '../../interfaces/chart-surface';
import { Grid } from '../../interfaces/grid';
import { ChartConfigurationService } from '../../services/chart-configuration.service';
import { GridService } from '../../services/grid.service';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-light-simulation',
  templateUrl: './light-simulation.component.html',
  styleUrls: ['./light-simulation.component.css']
})
export class LightSimulationComponent implements OnInit, OnChanges {
  @Input() gridDimension: number = 0; // Original grid dimension (e.g., 8x8)
  @Input() savedGrids: Grid[] | null = null;

  separationNumber: any;
  chartSurface: any;
  chartLayout: any;
  chartConfiguration: any;
  expandedGrids: any[] = []; // Initialize expandedGrids as an empty array
  selectedGridIndex: number | null = null; // Track the selected grid index

  constructor(
    private chartConfigurationService: ChartConfigurationService,
    private gridService: GridService,
  ) { }

  ngOnInit(): void {
    this.chartSurface = this.generateBaseSurface();
    this.chartLayout = this.chartConfigurationService.getChartSimulationLayout();
    this.chartConfiguration = this.chartConfigurationService.getChartRestrictiveToolabarConfiguration();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gridDimension']) {
      this.chartSurface = this.generateBaseSurface();
    }

    if (changes['savedGrids'] && this.savedGrids) {
      this.savedGrids.forEach(grid => {
        this.getGridExpansions(grid);
      });
    }
  }

  getGridExpansions(grid: Grid): void {
    if (grid.id) {
      this.gridService.getGridExpansion(grid.id).subscribe((expandedGrid: any): void => {
        this.expandedGrids.push(expandedGrid);
      });
    }
  }

  onGridSelect(event: any): void {
    // Handle grid selection from the dropdown
    this.selectedGridIndex = event.value;
    this.updateSurfaceWithSelectedGrid();
  }

  onSeparationNumberSelect(): void {
    this.updateSurfaceWithSelectedGrid();
  }

  // Update the surface plot with the selected grid
  private updateSurfaceWithSelectedGrid(): void {
    if (this.selectedGridIndex === null || !this.expandedGrids[this.selectedGridIndex]) {
      return;
    }

    const selectedExpandedGridValues = this.expandedGrids[this.selectedGridIndex];
    // Repeat the selected grid's z values three times across the X-axis
    const repeatedZ = this.repeatGridZValues(selectedExpandedGridValues, 3, this.separationNumber);

    // Update the surface object
    this.chartSurface = {
      x: Array.from({ length: repeatedZ[0].length }, (_, i) => i),
      y: Array.from({ length: repeatedZ.length }, (_, i) => i),
      z: repeatedZ,
      type: 'surface',
      showscale: false,
      opacity: 0.9,
    };
  }

  // Helper function to repeat the grid's z values across the X-axis
  // TODO: Improve function to handle merged values when the repeated matrixes collide
  private repeatGridZValues(zValues: number[][], repeatCount: number, separationDistance: number = 1): number[][] {
    const repeatedZ: number[][] = [];

    for (let y = 0; y < zValues.length; y++) {
      const row: number[] = [];
      for (let i = 0; i < repeatCount; i++) {
        row.push(...zValues[y]); // Add the current row of zValues
        if (i < repeatCount - 1) {
          for (let ii = 0; ii < separationDistance; ii++) {
            row.push(NaN); // Use `null` to create a gap
          }
        }
      }
      repeatedZ.push(row);
    }

    return repeatedZ;
  }

  // Helper function to generate the initial chart Z array
  private generateInitialZValues(gridDimension: number): number[][] {
    return Array.from({ length: gridDimension }, () =>
      Array.from({ length: gridDimension }, () => 0)
    );
  }

  // Generate base surface and append it into the surfaces array of the chart
  private generateBaseSurface(): any {
    return {
      x: Array.from({ length: this.gridDimension }, (_, i) => i),
      y: Array.from({ length: this.gridDimension }, (_, i) => i),
      z: this.generateInitialZValues(this.gridDimension),
      type: 'surface',
      opacity: 0.8,
      showscale: false,
    };
  }

  private generateZValuesBasedOnGridMessages(gridMessages: Message[]): number[][] {
    var zValues = this.generateInitialZValues(this.gridDimension);
    gridMessages.forEach(message => {
      zValues[message.x_pos][message.y_pos] = message.intensity;
    });
    return zValues;
  }
}
