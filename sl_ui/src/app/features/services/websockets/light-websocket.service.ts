import config from "../../../config.json"
import { Injectable } from '@angular/core';
import { GeneralWebsocketService } from './general-websocket.service';
import { TokenService } from 'src/app/core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class LightWebsocketService extends GeneralWebsocketService {
  private readonly LIGHT_WS_URL: string = config.api.websocketUrls.lightInformation;

  constructor(tokenService: TokenService) {
    super(tokenService);
    this.setServiceName('LightWebSocketService');
  }

  public override connect(): void {
    const wsUrl = this.LIGHT_WS_URL;
    super.connect(wsUrl);
  }
}
