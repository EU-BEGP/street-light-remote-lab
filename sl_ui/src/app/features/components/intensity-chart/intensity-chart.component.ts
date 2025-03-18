import { ChartConfigurationService } from '../../services/chart-configuration.service';
import { ChartSurface } from '../../interfaces/chart-surface';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { Message } from '../../interfaces/message'

@Component({
  selector: 'app-intensity-chart',
  templateUrl: './intensity-chart.component.html',
  styleUrls: ['./intensity-chart.component.css']
})
export class IntensityChartComponent implements OnInit, OnChanges {
  @Input() gridDimension: number = 0;
  @Input() savedGrids: Grid[] | null = null;
  @Input() selectedGridIndex: number = 0;
  @Input() currentMessage: Message | null = null;

  chart = {
    surfaces: [] as ChartSurface[],
  };
  chartLayout: any;
  firstSurfaceUpdated: boolean = false;

  constructor(
    private chartConfigurationService: ChartConfigurationService,
  ) { }

  //Lifecycle hooks
  ngOnInit(): void {
    this.chartLayout = this.chartConfigurationService.getChartDefaultLayout();
    this.generateBaseSurface();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['savedGrids'] && this.savedGrids) {
      this.savedGrids?.forEach(grid => {
        const messages = grid.grid_messages;
        if (messages) {
          messages.forEach(message => {
            this.updateSurfaceByMessage(message);
          });
        }
      });
    }

    if (changes['currentMessage'] && this.currentMessage) {
      this.updateSurfaceByMessage(this.currentMessage);
    }
  }

  // Helper function to generate the initial chart Z array
  private generateInitialZValues(gridDimension: number): number[][] {
    return Array.from({ length: gridDimension }, () =>
      Array.from({ length: gridDimension }, () => 0)
    );
  }

  // Generate base surface and append it into the surfaces array of the chart
  private generateBaseSurface(): void {
    var baseSurface = {
      x: Array.from({ length: this.gridDimension }, (_, i) => i),
      y: Array.from({ length: this.gridDimension }, (_, i) => i),
      z: this.generateInitialZValues(this.gridDimension),
      type: 'surface',
      opacity: 0.8,
      showscale: false,
    }

    // Create a new matrices array with the new matrix added
    this.chart.surfaces = [
      ...this.chart.surfaces,
      baseSurface,
    ];

    // Update the selectedGridIndex to point to the new surface
    this.selectedGridIndex = this.chart.surfaces.length - 1;
  }

  // Update surface based on the received message
  private updateSurfaceByMessage(message: Message): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      // First message received
      if (message.x_pos === 0 && message.y_pos === 0) {
        // Check if the first surface has already been updated:
        // - If yes, generate a new base surface.
        // - If no, mark the first surface as updated.
        this.firstSurfaceUpdated ? this.generateBaseSurface() : (this.firstSurfaceUpdated = true);
      }

      // Update only the latest surface
      const lastSurfaceIndex = this.chart.surfaces.length - 1;

      // Create a new ChartSurface object with the updated z values
      const updatedSurfaceZValues = this.chart.surfaces[lastSurfaceIndex].z.map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
      // Create a new ChartSurface object with the updated z values
      const updatedSurface: ChartSurface = {
        ...this.chart.surfaces[lastSurfaceIndex],
        z: updatedSurfaceZValues,
      };

      // Update the surfaces array immutably
      this.chart.surfaces = [
        ...this.chart.surfaces.slice(0, lastSurfaceIndex),
        updatedSurface, // Add the updated surface
        ...this.chart.surfaces.slice(lastSurfaceIndex + 1),
      ];
    }
  }
}
