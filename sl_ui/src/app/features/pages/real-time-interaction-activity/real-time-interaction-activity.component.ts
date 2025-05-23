// MIT License - See LICENSE file in the root directory
// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from 'src/app/config.json';
import { BookingService } from 'src/app/core/services/booking.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';
import { Grid } from '../../interfaces/grid';
import { GridService } from '../../services/grid.service';
import { Message } from '../../interfaces/message';
import { MqttService } from '../../services/mqtt.service';
import { RobotWebsocketService } from '../../services/websockets/robot-websocket.service';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-real-time-interaction-activity',
  templateUrl: './real-time-interaction-activity.component.html',
  styleUrls: ['./real-time-interaction-activity.component.css']
})
export class RealTimeInteractionActivityComponent implements OnInit, OnDestroy {
  gridDimension: number = config.gridDimension;
  lightCode: string = config.controlledEnvLightCode;
  capturedGrids: Grid[] = [];
  selectedGridIndex: number = 0;
  currentMessage: Message | null = null;
  hasUnsavedChanges: boolean = false;
  loadingWs: boolean = false;
  maxNumberGrids: number = 3;
  robotSubscription: Subscription | null = null;

  // Booking variables
  accessKey: string | null = null;
  password: string | null = null;

  // Counter configuration
  countdownConfig: CountdownConfig = {
    leftTime: 0,
    format: 'HH:mm:ss',
    demand: true
  };
  countdownActive: boolean = false;

  constructor(
    private bookingService: BookingService,
    private gridService: GridService,
    private mqttService: MqttService,
    private robotWebsocketService: RobotWebsocketService,
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.accessKey = this.storageService.getAccessKey();
    this.password = this.storageService.getPassword();

    if (this.accessKey) {
      this.bookingService.getBookingInfo(this.accessKey, this.password).subscribe(response => {
        if (response && response.length > 0) {
          const remainingSeconds = this.getRemainingSeconds(response[0].end_date);
          // Initialize countdown
          this.countdownConfig = {
            ...this.countdownConfig,
            leftTime: remainingSeconds,
            demand: false,
            notify: [300, 60]
          };
          this.countdownActive = true;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.robotSubscription) this.robotSubscription.unsubscribe();
    this.robotWebsocketService.disconnect();
  }

  // Countdown logic
  handleCountdownEvent(event: any): void {
    if (!this.countdownActive) return;

    if (event.action === 'notify') {
      this.toastr.warning(`Only ${event.left} seconds remaining!`);
    }

    if (event.action === 'done') {
      this.storageService.clearAccessData();
      this.toastr.warning(
        'Your booking time has expired',
        'Time Up',
        { timeOut: 5000, closeButton: true }
      );
      this.router.navigate(['/']);
    }
  }

  private getRemainingSeconds(endDate: string): number {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.max(Math.floor((end - now) / 1000), 0);
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
            this.capturedGrids = [...this.capturedGrids, grid];
            this.selectedGridIndex = this.capturedGrids.length - 1;
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
