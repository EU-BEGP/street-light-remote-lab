import config from '../../../config.json'
import { GeneralWebsocketService } from './general-websocket.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RobotWebsocketService extends GeneralWebsocketService {
  private readonly ROBOT_WS_URL: string = config.api.websocketUrls.robotInformation;

  constructor() {
    super();
    this.setServiceName('RobotWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.ROBOT_WS_URL;
    super.connect(wsUrl);
  }
}
