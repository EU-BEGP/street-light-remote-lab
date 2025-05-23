// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from '../../../config.json'
import { GeneralWebsocketService } from './general-websocket.service';
import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraRobotWebsocketService extends GeneralWebsocketService {
  private readonly CAMERA_WS_URL: string = config.api.websocketUrls.cameraRobot;

  constructor(ngZone: NgZone) {
    super(ngZone);
    this.setServiceName('CameraWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.CAMERA_WS_URL;
    super.connect(wsUrl);
  }
}
