// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { CameraLightsWebsocketService } from '../../services/websockets/camera-lights-websocket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CameraMovementService } from '../../services/camera-movement.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-camera-lights',
  templateUrl: './camera-lights.component.html',
  styleUrls: ['./camera-lights.component.css']
})
export class CameraLightsComponent implements OnInit, OnDestroy {
  private cameraSubscription: Subscription | null = null;
  frame: string = './assets/street_lights.jpg';
  private cameraNumber: number = 1;

  constructor(
    private cameraLightsWebsocketService: CameraLightsWebsocketService,
    private cameraMovementService: CameraMovementService
  ) { }

  ngOnInit(): void {
    this.connectCameraWebsocket();
  }

  ngOnDestroy(): void {
    if (this.cameraSubscription) this.cameraSubscription.unsubscribe();
    this.cameraLightsWebsocketService.disconnect();
  }

  private connectCameraWebsocket(): void {
    this.cameraLightsWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.cameraSubscription) {
      this.cameraSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.cameraSubscription = this.cameraLightsWebsocketService.messages$.subscribe((camera_msg) => {
      if (camera_msg) {
        this.frame = `data:image/jpeg;base64,${camera_msg.frame}`;
      }
    });
  }

  moveCamera(direction: string): void {
    this.cameraMovementService.moveCamera(direction, this.cameraNumber).subscribe();
  }

  stopCamera(): void {
    this.cameraMovementService.stopCamera(this.cameraNumber).subscribe();
  }
}
