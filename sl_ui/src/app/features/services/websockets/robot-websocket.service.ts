import config from '../../../config.json'
import { Injectable } from '@angular/core';
import { GeneralWebsocketService } from './general-websocket.service';
import { TokenService } from 'src/app/core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class RobotWebsocketService extends GeneralWebsocketService {
  private readonly ROBOT_WS_URL: string = config.api.websocketUrls.robotInformation;

  constructor(tokenService: TokenService) {
    super(tokenService);
    this.setServiceName('RobotWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.ROBOT_WS_URL;
    super.connect(wsUrl);
  }
}
