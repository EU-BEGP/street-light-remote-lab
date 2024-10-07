import config from 'src/app/config.json';
import { Injectable } from '@angular/core';
import { Observable, Subject, EMPTY, Subscription } from 'rxjs';
import { TokenService } from 'src/app/core/services/token.service';
import { catchError } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export const RECONNECT_INTERVAL = 2000;
export const WS_URL = config.api.websocketUrls.lightInformation;

@Injectable({
  providedIn: 'root'
})

export class LightWebsocketService {
  private messageSubscription: Subscription | null = null;
  private messagesSubject$: Subject<any> = new Subject<any>();
  public messages$: Observable<any> = this.messagesSubject$.asObservable();
  private socket$: WebSocketSubject<any> | null = null;
  private disconnectedByUser: boolean = false;

  constructor(private tokenService: TokenService) { }

  public connect(): void {
    const token = this.tokenService.token;

    // If the user is not authenticated do not connect
    if (!token) return;

    const wsUrl = `${WS_URL}?token=${token}`;

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket(wsUrl);

      this.messageSubscription = this.socket$.pipe(
        catchError(error => {
          console.log("error", error)
          console.error('[LightWebsocketService] Error:', error);
          return EMPTY;
        })
      ).subscribe(
        message => this.messagesSubject$.next(message),
        error => console.error('[LightWebsocketService] Received error:', error),
        (): void => { }
      );
    }
  }

  public disconnect(): void {
    this.disconnectedByUser = true;
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
  }

  private reconnect(): void {
    console.log('[LightWebsocketService] Attempting to reconnect...');
    setTimeout((): void => {
      this.connect(), RECONNECT_INTERVAL
    });
  }

  private getNewWebSocket(wsUrl: string): WebSocketSubject<any> {
    return webSocket({
      url: wsUrl,
      openObserver: {
        next: (): void => console.log('[LightWebsocketService] WebSocket connection established'),
      },
      closeObserver: {
        next: (): void => {
          console.log('[LightWebsocketService] WebSocket connection closed');
          if (!this.disconnectedByUser) {
            this.reconnect();
          }
        },
      },
    });
  }
}
