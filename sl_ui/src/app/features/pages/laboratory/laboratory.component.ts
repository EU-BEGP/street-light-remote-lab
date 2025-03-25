// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExperimentService } from '../../services/experiment.service';
import { Grid } from '../../interfaces/grid';
import { GridService } from '../../services/grid.service';
import { Message } from '../../interfaces/message';
import { MqttService } from '../../services/mqtt.service';
import { RobotWebsocketService } from '../../services/websockets/robot-websocket.service';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-laboratory',
  templateUrl: './laboratory.component.html',
  styleUrls: ['./laboratory.component.css']
})
export class LaboratoryComponent implements OnInit, OnDestroy {
  gridDimension: number = 8; // Input for chart and matrix components
  savedGrids: Grid[] = []; // Input for chart and matrix components
  private candidateGridIds: number[] = []; // List of grid Ids that are candidates to be saved
  private experimentId?: number | null;
  private lightCode?: string | null;;
  private robotSubscription: Subscription | null = null;
  private savedGridsFlag: boolean = false;
  private maxNumberGrids: number = 3;
  hasUnsavedChanges: boolean = false;
  loadingWs: boolean = false;
  numberOfGrids: number = 0;
  selectedGridIndex: number = 0;
  currentMessage: Message | null = null;

  constructor(
    private experimentService: ExperimentService,
    private gridService: GridService,
    private mqttService: MqttService,
    private robotWebsocketService: RobotWebsocketService,
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService,
  ) {
    this.experimentId = this.storageService.getExperimentId();
    this.lightCode = this.storageService.getLightCode();
  }

  //Lifecycle hooks
  ngOnInit(): void {
    if (this.experimentId && this.experimentId > 0) {
      this.experimentService.getExperimentGrids(this.experimentId).subscribe((grids: Grid[]): void => {
        if (grids !== undefined && grids.length !== 0) {
          this.numberOfGrids = grids.length;
          this.selectedGridIndex = this.numberOfGrids - 1;
          this.savedGrids = grids;
          this.savedGridsFlag = true;
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
    this.storageService.clearExperimentData();
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
          this.candidateGridIds.push(robot_msg.grid_id);
          this.robotWebsocketService.disconnect();
          this.numberOfGrids += 1;
          this.selectedGridIndex = this.numberOfGrids - 1;
        }
      }
    });
  }

  //Robot functions
  sendRobotCommand(): void {
    if (this.savedGrids != null && this.savedGrids.length + this.candidateGridIds.length >= this.maxNumberGrids) {
      this.toastr.warning('Maximum number of grids reached');
    }
    else {
      var data = {
        'light_code': this.lightCode
      }

      this.mqttService.publishRobotCommand(data).subscribe((response) => {
        if (response.status && response.status === 200) {
          this.toastr.success(response.body.success);
          this.loadingWs = true;
          this.connectRobotWebsocket();
        }
      });
    }
  }

  saveGrids(): void {
    forkJoin(
      this.candidateGridIds.map(gridId =>
        this.gridService.updateGrid(
          { 'experiment': this.experimentId },
          gridId
        )
      )
    ).subscribe({
      next: (savedGrids: Grid[]) => {
        // Add all saved grids to your array
        this.savedGrids = [...this.savedGrids, ...savedGrids];

        this.toastr.success('All grids saved to the experiment');
        this.savedGridsFlag = true;
        this.hasUnsavedChanges = false;
      },
      error: (e) => {
        this.toastr.error('There was an error saving one or more grids.', e);
      },
    });
  }
}
