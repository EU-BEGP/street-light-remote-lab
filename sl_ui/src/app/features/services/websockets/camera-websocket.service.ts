import config from '../../../config.json'
import { GeneralWebsocketService } from './general-websocket.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraWebsocketService extends GeneralWebsocketService {
  private readonly CAMERA_WS_URL: string = config.api.websocketUrls.camera;

  constructor() {
    super();
    this.setServiceName('CameraWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.CAMERA_WS_URL;
    super.connect(wsUrl);
  }
}
