// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from '../../../config.json'
import { GeneralWebsocketService } from './general-websocket.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LightWebsocketService extends GeneralWebsocketService {
  private readonly LIGHT_WS_URL: string = config.api.websocketUrls.lightInformation;

  constructor() {
    super();
    this.setServiceName('LightWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.LIGHT_WS_URL;
    super.connect(wsUrl);
  }
}
