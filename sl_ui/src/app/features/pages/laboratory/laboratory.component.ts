import { Component, OnInit, OnDestroy } from '@angular/core';
import { GridWebsocketService } from '../../services/grid-websocket.service';
import { LightService } from '../../services/light.service';
import { LightWebsocketService } from '../../services/light-websocket.service';
import { Message } from '../../interfaces/message';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-laboratory',
  templateUrl: './laboratory.component.html',
  styleUrls: ['./laboratory.component.css']
})
export class LaboratoryComponent implements OnInit, OnDestroy {
  private gridSubscription: Subscription | null = null;
  private lightSubscription: Subscription | null = null;

  firstSurfaceUpdated: boolean = false;

  batteryInformation = {
    voltage: 0,
    current: 0,
    power: 0
  }

  gridIds: number[] = [];
  hasUnsavedChanges: boolean = false;
  isWsLoading: boolean = false;

  sliderValue: number = 50;
  gridDimension: number = 10;

  graph = {
    data: [{
      x: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      y: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      z: this.generateInitialZValues(this.gridDimension),
      type: 'surface',
    }]
  };

  grid: number[][] = this.generateInitialGrid();

  constructor(
    private gridWebsocketService: GridWebsocketService,
    private lightService: LightService,
    private lightWebsocketService: LightWebsocketService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.lightWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.lightSubscription) {
      this.lightSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.lightSubscription = this.lightWebsocketService.messages$.subscribe((message) => {
      if (message) {
        this.batteryInformation.voltage = message.voltage
        this.batteryInformation.current = message.current
        this.batteryInformation.power = message.power
      }
    });
  }

  ngOnDestroy(): void {
    if (this.gridSubscription) {
      this.gridSubscription.unsubscribe();
    }
    this.gridWebsocketService.disconnect();
  }

  // WebSocket functions
  private connectToWebSocket(): void {
    this.gridWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.gridSubscription) {
      this.gridSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.gridSubscription = this.gridWebsocketService.messages$.subscribe((message) => {
      if (message) {
        this.isWsLoading = false;
        this.hasUnsavedChanges = true;
        this.refreshGrid(message);
        this.refreshGraph(message);

        if (message.is_last) {
          this.gridIds.push(message.grid_id);
          this.gridWebsocketService.disconnect();
        }
      }
    });
  }

  // Robot functions
  startAction(): void {
    if (this.graph.data.length >= 3) {
      this.toastr.warning("Maximum number of charts (3) reached. Cannot add more.")
      return;
    }

    this.lightService.requestGrid().subscribe((response) => {
      if (response.success) {
        this.toastr.success(response.success);
        this.isWsLoading = true;
        this.connectToWebSocket();
      }
    });
  }

  setLightProperties(): void {
    var message = {
      'pwm': this.sliderValue
    }

    this.lightService.setLightProperties(message).subscribe((response) => {
      if (response.status !== null && response.status === 200) {
        this.toastr.success(response.body.success);
      }
    });
  }

  // GRID functions
  setGrid(messages: Message[]): void {
    messages.forEach((message: Message): void => {
      this.updateGridByMessage(message);
    });
  }

  refreshGrid(message: Message): void {
    if (message.x_pos == 0 && message.y_pos == 0) {
      this.grid = this.generateInitialGrid();
    }
    this.updateGridByMessage(message);
  }

  private generateInitialGrid(): number[][] {
    return Array(this.gridDimension).fill(0).map(() => Array(this.gridDimension).fill(0));
  }

  private updateGridByMessage(message: Message): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      // CREATE a new grid  array with updated values
      this.grid = this.grid.map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
    }
  }

  getCellColor(value: number): string {
    if (value === 0) {
      return 'white';
    }

    const max = 20;
    const ratio = value / max;

    const red = Math.floor(255 * ratio * 0.8);
    const green = Math.floor(130 * ratio);
    const blue = Math.floor(255 * (1 - ratio) * 0.7);

    return `rgb(${red}, ${green}, ${blue})`;
  }


  // CHART functions
  setGraph(messages: Message[]): void {
    messages.forEach((message: Message): void => {
      this.updateGraphByMessage(message);
    })
  }

  refreshGraph(message: Message): void {
    if (!this.firstSurfaceUpdated && message.x_pos === 0 && message.y_pos === 0) {
      this.firstSurfaceUpdated = true;
      this.updateGraphByMessage(message);
    } else if (message.x_pos === 0 && message.y_pos === 0) {
      this.addNewSurface();
    } else {
      this.updateGraphByMessage(message);
    }
  }

  private addNewSurface(): void {
    const newZ = this.generateInitialZValues(this.gridDimension);
    const newSurface = {
      x: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      y: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      z: newZ,
      type: 'surface'
    };

    // Append the new surface to the graph data
    this.graph.data.push(newSurface);
  }

  private generateInitialZValues(gridSize: number): number[][] {
    return Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => 0)
    );
  }

  private restoreGraph(): void {
    const newZ = this.generateInitialZValues(this.gridDimension);
    this.graph.data = [{
      ...this.graph.data[0],
      z: newZ
    }];
  }

  private updateGraphByMessage(message: Message): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      // Update the last surface in the graph data
      const lastSurfaceIndex = this.graph.data.length - 1;

      this.graph.data[lastSurfaceIndex].z = this.graph.data[lastSurfaceIndex].z.map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
    }
  }
}
