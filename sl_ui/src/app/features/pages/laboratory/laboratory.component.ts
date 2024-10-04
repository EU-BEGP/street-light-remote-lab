import { Component, OnInit } from '@angular/core';
import { Message } from '../../interfaces/message';
import { LightService } from '../../services/light.service';
import { ToastrService } from 'ngx-toastr';
import { WebsocketService } from '../../services/message-websocket.service';

@Component({
  selector: 'app-laboratory',
  templateUrl: './laboratory.component.html',
  styleUrls: ['./laboratory.component.css']
})
export class LaboratoryComponent implements OnInit {
  gridId: number = 0;
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
    private lightService: LightService,
    private toastr: ToastrService,
    private websocketService: WebsocketService,
  ) { }

  ngOnInit(): void {
  }

  // WEBSOCKET functions
  private connectToWebSocket(): void {
    this.websocketService.connect();

    // Connect to websocekts and receive messages
    this.websocketService.messages$.subscribe((message) => {
      if (message) {
        this.isWsLoading = false
        this.hasUnsavedChanges = true;
        if (message.is_last) this.gridId = message.grid_id;

        this.refreshGrid(message);
        this.refreshGraph(message);
      }
    });
  }

  // ROBOT functions
  startAction(): void {
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
    if (message.x_pos == 0 && message.y_pos == 0) {
      this.restoreGraph();
    }
    this.updateGraphByMessage(message);
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
      // CREATE a new `z` array with updated values
      this.graph.data[0].z = this.graph.data[0].z.map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
    }
  }

}
