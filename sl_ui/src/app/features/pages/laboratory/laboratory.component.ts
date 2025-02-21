import { CameraWebsocketService } from '../../services/websockets/camera-websocket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExperimentService } from '../../services/experiment.service';
import { Grid } from '../../interfaces/grid';
import { GridService } from '../../services/grid.service';
import { Light } from '../../interfaces/light';
import { Message } from '../../interfaces/message';
import { MqttService } from '../../services/mqtt.service';
import { RobotWebsocketService } from '../../services/websockets/robot-websocket.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-laboratory',
  templateUrl: './laboratory.component.html',
  styleUrls: ['./laboratory.component.css']
})
export class LaboratoryComponent implements OnInit, OnDestroy {
  lightInformation: Light | null = null; // Received output from LightInformation component

  // General variables
  private gridIds: number[] = [];
  gridDimension: number = 8;
  experimentId?: number | null;

  // Component status variables
  hasUnsavedChanges: boolean = false;
  isWsLoading: boolean = false;

  // Websockets subscriptions
  private cameraSubscription: Subscription | null = null;
  private robotSubscription: Subscription | null = null;

  // Robot cell variables
  frame: string = '';
  pwmValue: number = 0;
  timeIntervalValue: number = 15;

  // Grid cell variables
  grid: number[][] = this.generateInitialGrid();

  // Chart cell variables
  private firstSurfaceUpdated: boolean = false;
  chartsSaved: boolean = false;
  maxNumbercharts: number = 3;

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
    private experimentService: ExperimentService,
    private gridService: GridService,
    private mqttService: MqttService, private robotWebsocketService: RobotWebsocketService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.experimentId = Number(localStorage.getItem('experiment_id'));

    if (!isNaN(this.experimentId) && this.experimentId > 0) {
      this.experimentService.getExperimentGrids(this.experimentId).subscribe((grids: Grid[]): void => {
        if (grids !== undefined && grids.length !== 0) {
          this.chartsSaved = true;
          grids.forEach(grid => {
            const messages = grid.grid_messages;
            if (messages) {
              messages.forEach(message => {
                this.refreshGrid(message);
                this.refreshGraph(message);
              });
            }
          });
        }
      })
      // this.connectCameraWebsocket();
    }
    else {
      this.toastr.error('No experiment ID provided')
      setTimeout((): void => {
        this.router.navigate(['/experiments']);
      }, 50) //TODO: Get rid of timeout
    }
  }

  ngOnDestroy(): void {
    if (this.robotSubscription) this.robotSubscription.unsubscribe();
    this.robotWebsocketService.disconnect();


    if (this.cameraSubscription) this.cameraSubscription.unsubscribe();
    this.cameraWebsocketService.disconnect();

    localStorage.removeItem('experimentId');

    this.sendLightCommand(true);
  }


  private connectCameraWebsocket(): void {
    this.cameraWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.cameraSubscription) {
      this.cameraSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.cameraSubscription = this.cameraWebsocketService.messages$.subscribe((camera_msg) => {
      if (camera_msg) {
        this.frame = `data:image/jpeg;base64,${camera_msg.frame}`;
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
    this.robotSubscription = this.robotWebsocketService.messages$.subscribe((robot_msg) => {
      if (robot_msg) {
        this.isWsLoading = false;
        this.hasUnsavedChanges = true;
        this.refreshGrid(robot_msg);
        this.refreshGraph(robot_msg);

        if (robot_msg.is_last) {
          this.gridIds.push(robot_msg.grid_id);
          this.robotWebsocketService.disconnect();
        }
      }
    });
  }

  // Robot functions
  sendRobotCommand(): void {
    if (this.graph.data.length >= this.maxNumbercharts) {
      this.toastr.warning('Maximum number of charts (3) reached. Cannot add more.')
      return;
    }

    var data = {
      'light_code': this.lightInformation?.code
    }

    this.mqttService.publishRobotCommand(data).subscribe((response) => {
      if (response.status !== null && response.status === 200) {
        this.toastr.success(response.body.success);
        this.isWsLoading = true;
        this.connectRobotWebSocket();
      }
    });
  }

  sendLightCommand(turnOff: boolean): void {
    var data = {
      'light_code': this.lightInformation?.code,
      'pwm': this.pwmValue,
      'time_interval': this.timeIntervalValue,
    }
    if (turnOff) data['pwm'] = 0;

    this.mqttService.publishLightCommand(data).subscribe((response) => {
      if (response.status !== null && response.status === 200) {
        if (!turnOff) this.toastr.success(response.body.success);
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

    const max = 400;
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
    forkJoin(
      this.gridIds.map(gridId =>
        this.gridService.updateGrid(
          { 'experiment': this.experimentId },
          gridId
        )
      )
    ).subscribe({
      next: () => {
        this.toastr.success('All grids and charts saved successfully')
        this.chartsSaved = true;
        this.hasUnsavedChanges = false;
      },
      error: (e) => {
        this.toastr.error('There was an error saving one or more grids.');
      },
    });
  }

  // Events management

  // LightInformation event
  onLightInformation(lightInformation: Light): void {
    this.lightInformation = lightInformation;
  }
}
