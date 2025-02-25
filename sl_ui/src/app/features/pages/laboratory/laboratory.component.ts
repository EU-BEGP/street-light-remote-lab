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
  gridDimension: number = 8;
  savedGrids: Grid[] | null = null;
  private robotSubscription: Subscription | null = null;


  // General variables
  private candidateGridIds: number[] = [];
  experimentId?: number | null;

  // Component status variables
  hasUnsavedChanges: boolean = false;
  isWsLoading: boolean = false;

  // Robot cell variables
  pwmValue: number = 0;
  timeIntervalValue: number = 15;

  // Chart cell variables
  chartsSaved: boolean = false;
  maxNumbercharts: number = 3;

  constructor(
    private experimentService: ExperimentService,
    private mqttService: MqttService,
    private gridService: GridService,
    private robotWebsocketService: RobotWebsocketService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  //Lifecycle hooks
  ngOnInit(): void {
    this.experimentId = Number(localStorage.getItem('experiment_id'));

    if (this.experimentId && this.experimentId > 0) {
      this.experimentService.getExperimentGrids(this.experimentId).subscribe((grids: Grid[]): void => {
        if (grids !== undefined && grids.length !== 0) {
          this.savedGrids = grids;
          this.chartsSaved = true;
        }
      })
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

    localStorage.removeItem('experimentId');
    // this.sendLightCommand(true);
  }

  // Robot websocket connection
  private connectRobotWebsocket(): void {
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
        if (robot_msg.is_last) {
          this.candidateGridIds.push(robot_msg.grid_id);
          this.robotWebsocketService.disconnect();
        }
      }
    });
  }

  //Robot functions
  sendRobotCommand(): void {
    if (this.savedGrids != null && this.savedGrids.length + this.candidateGridIds.length >= this.maxNumbercharts) {
      this.toastr.warning('Maximum number of grids (3) reached. Cannot request for more.')
    }
    else {
      var data = {
        'light_code': this.lightInformation?.code
      }

      this.mqttService.publishRobotCommand(data).subscribe((response) => {
        if (response.status && response.status === 200) {
          this.toastr.success(response.body.success);
          this.isWsLoading = true;
          this.connectRobotWebsocket();
        }
      });
    }
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

  saveCharts(): void {
    forkJoin(
      this.candidateGridIds.map(gridId =>
        this.gridService.updateGrid(
          { 'experiment': this.experimentId },
          gridId
        )
      )
    ).subscribe({
      next: () => {
        this.toastr.success('All grids saved to the experiment')
        this.chartsSaved = true;
        this.hasUnsavedChanges = false;
      },
      error: (e) => {
        this.toastr.error('There was an error saving one or more grids.');
      },
    });
  }

  /* Events management */
  // LightInformation event
  onLightInformation(lightInformation: Light): void {
    this.lightInformation = lightInformation;
  }
}
