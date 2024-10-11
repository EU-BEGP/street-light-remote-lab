import config from '../../../config.json'
import { Injectable } from '@angular/core';
import { GeneralWebsocketService } from './general-websocket.service';
import { TokenService } from 'src/app/core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class CameraWebsocketService extends GeneralWebsocketService {
  private readonly CAMERA_WS_URL: string = config.api.websocketUrls.camera;

  constructor(tokenService: TokenService) {
    super(tokenService);
    this.setServiceName('CameraWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.CAMERA_WS_URL;
    super.connect(wsUrl);
  }
}
