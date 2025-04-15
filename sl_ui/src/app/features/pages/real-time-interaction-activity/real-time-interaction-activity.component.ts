// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { GridService } from '../../services/grid.service';
import { Message } from '../../interfaces/message';
import { MqttService } from '../../services/mqtt.service';
import { RobotWebsocketService } from '../../services/websockets/robot-websocket.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import config from 'src/app/config.json';

@Component({
  selector: 'app-real-time-interaction-activity',
  templateUrl: './real-time-interaction-activity.component.html',
  styleUrls: ['./real-time-interaction-activity.component.css']
})
export class RealTimeInteractionActivityComponent implements OnInit, OnDestroy {
  capturedGrids: Grid[] = [];
  selectedGridIndex: number = 0;
  currentMessage: Message | null = null;
  gridDimension: number = config.gridDimension;
  hasUnsavedChanges: boolean = false;
  lightCode: string = config.controlledEnvLightCode;
  loadingWs: boolean = false;
  maxNumberGrids: number = 3;
  robotSubscription: Subscription | null = null;

  constructor(
    private gridService: GridService,
    private mqttService: MqttService,
    private robotWebsocketService: RobotWebsocketService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { }

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

    // Subscribe to WebSocket messages
    this.robotSubscription = this.robotWebsocketService.messages$.subscribe((robot_msg) => {
      if (robot_msg) {
        this.currentMessage = robot_msg;
        this.loadingWs = false;
        this.hasUnsavedChanges = true;
        if (robot_msg.is_last) {
          this.gridService.getGrid(robot_msg.grid_id).subscribe((grid: Grid): void => {
            this.capturedGrids.push(grid);
            this.selectedGridIndex = this.capturedGrids.length - 1
          });
          this.robotWebsocketService.disconnect();
        }
      }
    });
  }

  //Robot functions
  sendRobotCommand(): void {
    if (this.capturedGrids != null && this.capturedGrids.length >= this.maxNumberGrids) {
      this.toastr.warning('Maximum number of grids reached');
    }
    else {
      const data = {
        'light_code': this.lightCode
      };

      this.mqttService.publishRobotCommand(data).subscribe((response) => {
        if (response.status && response.status === 200) {
          this.toastr.success(response.body.success);
          this.loadingWs = true;
          this.connectRobotWebsocket();
        }
      });
    }
  }
}
