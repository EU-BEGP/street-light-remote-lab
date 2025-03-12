import { ChartConfigurationService } from '../../services/chart-configuration.service';
import { ChartSurface } from '../../interfaces/chart-surface';
import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { Message } from '../../interfaces/message'
import { RobotWebsocketService } from '../../services/websockets/robot-websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-intensity-chart',
  templateUrl: './intensity-chart.component.html',
  styleUrls: ['./intensity-chart.component.css']
})
export class IntensityChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() gridDimension: number = 0;
  @Input() savedGrids: Grid[] | null = null;
  @Input() selectedGridIndex: number = 0;
  private robotSubscription: Subscription | null = null;

  chart = {
    surfaces: [] as ChartSurface[],
  };
  chartLayout: any;
  firstSurfaceUpdated: boolean = false;

  constructor(
    private robotWebsocketService: RobotWebsocketService,
    private chartConfigurationService: ChartConfigurationService,
  ) { }

  //Lifecycle hooks
  ngOnInit(): void {
    this.chartLayout = this.chartConfigurationService.getChartDefaultLayout();
    // Generate the first surface of the chart
    this.generateBaseSurface();
    this.connectRobotWebsocket();
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
  }

  ngOnDestroy(): void {
    if (this.robotSubscription) this.robotSubscription.unsubscribe();
    this.robotWebsocketService.disconnect();
  }

  // Robot websocket connection
  private connectRobotWebsocket(): void {
    this.robotWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.robotSubscription) {
      this.robotSubscription.unsubscribe();
    }

    // Subscribe to websocket messages
    this.robotSubscription = this.robotWebsocketService.messages$.subscribe((robot_msg: Message): void => {
      if (robot_msg) {
        // Update chart message by message
        this.updateSurfaceByMessage(robot_msg)
      }
    });
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
    this.chart.surfaces.push(baseSurface);
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
      this.chart.surfaces[lastSurfaceIndex].z = this.chart.surfaces[lastSurfaceIndex].z.map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
    }
  }
}
