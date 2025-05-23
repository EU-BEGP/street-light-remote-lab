// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { CameraRobotWebsocketService } from '../../services/websockets/camera-robot-websocket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-camera-robot',
  templateUrl: './camera-robot.component.html',
  styleUrls: ['./camera-robot.component.css']
})
export class CameraRobotComponent implements OnInit, OnDestroy {
  private cameraSubscription: Subscription | null = null;
  frame: string = './assets/robot_01.jpeg';

  constructor(
    private cameraRobotWebsocketService: CameraRobotWebsocketService,
  ) { }

  ngOnInit(): void {
    this.connectCameraWebsocket();
  }

  ngOnDestroy(): void {
    if (this.cameraSubscription) this.cameraSubscription.unsubscribe();
    this.cameraRobotWebsocketService.disconnect();
  }

  private connectCameraWebsocket(): void {
    this.cameraRobotWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.cameraSubscription) {
      this.cameraSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.cameraSubscription = this.cameraRobotWebsocketService.messages$.subscribe((camera_msg) => {
      if (camera_msg) {
        this.frame = `data:image/jpeg;base64,${camera_msg.frame}`;
      }
    });
  }
}
