import config from 'src/app/config.json';
import { Injectable } from '@angular/core';
import { Subject, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { TokenService } from 'src/app/core/services/token.service';

export const WS_URL = config.api.wsUrl;
export const RECONNECT_INTERVAL = 2000;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private messagesSubject$ = new Subject<any>();
  private socket$: any;
  public messages$ = this.messagesSubject$.asObservable();

  constructor(
    private tokenService: TokenService,
  ) { }

  public connect(): void {
    const token = this.tokenService.token;

    if (token) {
      const wsUrl = `${WS_URL}?token=${token}`
      if (!this.socket$ || this.socket$.closed) {
        this.socket$ = this.getNewWebSocket(wsUrl);

        this.socket$.pipe(
          catchError(error => {
            console.error('[MessageWebsocketService] Error:', error);
            return EMPTY;
          })
        ).subscribe(
          (message: any) => this.messagesSubject$.next(message),
          (error: any) => console.error('[MessageWebsocketService] Received error:', error),
          () => console.log('[MessageWebsocketService] WebSocket connection closed')
        );
      }
    }
    else {
      console.error('[MessageWebsocketService] Unable to authenticate user:');
    }
  }

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
  }

  private getNewWebSocket(wsUrl: string): WebSocketSubject<any> {
    return webSocket({
      url: wsUrl,
      openObserver: {
        next: () => console.log('[MessageWebsocketService] WebSocket connection established')
      },
      closeObserver: {
        next: () => {
          console.log('[MessageWebsocketService] WebSocket connection closed');
          this.socket$ = undefined;
          setTimeout(() => this.connect(), RECONNECT_INTERVAL);
        }
      }
    });
  }
}
