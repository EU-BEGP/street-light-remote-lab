// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from '../../../config.json'
import { GeneralWebsocketService } from './general-websocket.service';
import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RobotWebsocketService extends GeneralWebsocketService {
  private readonly ROBOT_WS_URL: string = config.api.websocketUrls.robotInformation;

  constructor(ngZone: NgZone) {
    super(ngZone);
    this.setServiceName('RobotWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.ROBOT_WS_URL;
    super.connect(wsUrl);
  }
}
