import { CameraWebsocketService } from '../../services/websockets/camera-websocket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LightWebsocketService } from '../../services/websockets/light-websocket.service';
import { Message } from '../../interfaces/message';
import { MqttService } from '../../services/mqtt.service';
import { RobotWebsocketService } from '../../services/websockets/robot-websocket.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-laboratory',
  templateUrl: './laboratory.component.html',
  styleUrls: ['./laboratory.component.css']
})
export class LaboratoryComponent implements OnInit, OnDestroy {
  // Component status variables
  hasUnsavedChanges: boolean = false;
  isWsLoading: boolean = false;

  // Websockets subscriptions
  private cameraSubscription: Subscription | null = null;
  private robotSubscription: Subscription | null = null;
  private lightSubscription: Subscription | null = null;

  private gridIds: number[] = [];
  gridDimension: number = 10;

  // Robot cell variables
  frame: string = "";
  sliderValue: number = 0;
  batteryInformation = {
    voltage: 0,
    current: 0,
    power: 0
  }

  // Grid cell variables
  grid: number[][] = this.generateInitialGrid();

  // Chart cell variables
  private firstSurfaceUpdated: boolean = false;
  chartsSaved: boolean = false;

  chartInitialLayout = {
    autosize: true,
    height: 300,
    width: 300,
    showlegend: false,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    }, // No margins
    scene: {
      camera: {
        eye: {
          x: 1.5,
          y: 1.5,
          z: 1.5
        }
      }, // Camera position for better view
    },
  }

  graph = {
    data: [{
      x: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      y: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      z: this.generateInitialZValues(this.gridDimension),
      type: 'surface',
      opacity: 0.6,
      showscale: false,
    }],
  };

  // Simulation variables
  selectedChart: number = 0;
  selectedDistance: number = 5;

  chartSimulationLayout = {
    ...this.chartInitialLayout,
    hovermode: false, // Disable hover interactions
    dragmode: false, // Disable dragging
    // Additional options to make it more static
    xaxis: {
      fixedrange: true, // Disable zooming on x-axis
    },
    yaxis: {
      fixedrange: true, // Disable zooming on y-axis
    },
  }

  chartSimulationConfig = {
    displayModeBar: true,
    modeBarButtonsToRemove: [
      // 2D buttons
      'zoom2d',
      'pan2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'resetScale2d',
      // 3D buttons
      'zoom3d',
      'pan3d',
      'orbitRotation',
      'tableRotation',
      'handleDrag3d',
      'resetCameraDefault3d',
      'resetCameraLastSave3d',
      'hoverClosest3d',
      // Cartesian buttons
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      // Geo buttons
      'zoomInGeo',
      'zoomOutGeo',
      'resetGeo',
      'hoverClosestGeo',
      // Other buttons
      'hoverClosestGl2d',
      'hoverClosestPie',
      'toggleHover',
      'resetViews',
      'sendDataToCloud',
      'toggleSpikelines',
      'resetViewMapbox',
    ],
  };

  constructor(
    private cameraWebsocketService: CameraWebsocketService,
    private lightWebsocketService: LightWebsocketService,
    private mqttService: MqttService,
    private robotWebsocketService: RobotWebsocketService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.connectLightWebsocket();
    this.connectCameraWebsocket();
  }

  ngOnDestroy(): void {
    if (this.robotSubscription) this.robotSubscription.unsubscribe();
    this.robotWebsocketService.disconnect();

    if (this.lightSubscription) this.lightSubscription.unsubscribe();
    this.lightWebsocketService.disconnect();

    if (this.cameraSubscription) this.cameraSubscription.unsubscribe();
    this.cameraWebsocketService.disconnect();
  }

  // WebSocket functions
  private connectLightWebsocket(): void {
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

  private connectCameraWebsocket(): void {
    this.cameraWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.cameraSubscription) {
      this.cameraSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.cameraSubscription = this.cameraWebsocketService.messages$.subscribe((message) => {
      if (message) {
        this.frame = `data:image/jpeg;base64,${message.frame}`;
      }
    });
  }

  private connectRobotWebSocket(): void {
    this.robotWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.robotSubscription) {
      this.robotSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.robotSubscription = this.robotWebsocketService.messages$.subscribe((message) => {
      if (message) {
        this.isWsLoading = false;
        this.hasUnsavedChanges = true;
        this.refreshGrid(message);
        this.refreshGraph(message);

        if (message.is_last) {
          this.gridIds.push(message.grid_id);
          this.robotWebsocketService.disconnect();
        }
      }
    });
  }

  // Robot functions
  sendRobotCommand(): void {
    if (this.graph.data.length >= 3) {
      this.toastr.warning("Maximum number of charts (3) reached. Cannot add more.")
      return;
    }

    this.mqttService.publishRobotCommand().subscribe((response) => {
      if (response.success) {
        this.toastr.success(response.success);
        this.isWsLoading = true;
        this.connectRobotWebSocket();
      }
    });
  }

  sendLightCommand(): void {
    var message = {
      'pwm': this.sliderValue
    }

    this.mqttService.publishLightCommand(message).subscribe((response) => {
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
    const colorscales = ['Blackbody', 'Viridis']
    const newZ = this.generateInitialZValues(this.gridDimension);
    const newSurface = {
      x: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      y: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      z: newZ,
      type: 'surface',
      opacity: 0.6,
      showscale: false,
      colorscale: colorscales[this.graph.data.length - 1],
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

  getZArrayStatus(): boolean {
    let zeroFlag = false;
    if (this.graph.data && this.graph.data.length > 0) {
      const zArray = this.graph.data[0].z;
      zArray.forEach(array => {
        if (array.includes(0)) zeroFlag = true;
      });
    }

    return zeroFlag;
  }

  saveCharts(): void {
    this.chartsSaved = true;
  }
}
