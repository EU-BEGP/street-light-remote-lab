import config from 'src/app/config.json';
import { Injectable } from '@angular/core';
import { Subject, EMPTY, Subscription } from 'rxjs';
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
  private socket$: WebSocketSubject<any> | null = null;
  public messages$ = this.messagesSubject$.asObservable();
  private messageSubscription: Subscription | null = null;
  private _isConnected = false;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Getter for connection status
  public get isConnected(): boolean {
    return this._isConnected;
  }

  constructor(private tokenService: TokenService) { }

  public connect(): void {
    const token = this.tokenService.token;

    if (!token) {
      console.error('[WebsocketService] Unable to authenticate user.');
      return;
    }

    const wsUrl = `${WS_URL}?token=${token}`;

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket(wsUrl);

      this.messageSubscription = this.socket$.pipe(
        catchError(error => {
          console.error('[WebsocketService] Error:', error);
          return EMPTY;
        })
      ).subscribe(
        message => this.messagesSubject$.next(message),
        error => console.error('[WebsocketService] Received error:', error),
        () => {
          console.log('[WebsocketService] WebSocket connection closed');
          this._isConnected = false;
          if (this.shouldReconnect) {
            this.reconnect();
          }
        }
      );

      this._isConnected = true;
      this.reconnectAttempts = 0;
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
      this._isConnected = false;
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
  }

  private getNewWebSocket(wsUrl: string): WebSocketSubject<any> {
    return webSocket({
      url: wsUrl,
      openObserver: {
        next: () => console.log('[WebsocketService] WebSocket connection established'),
      },
      closeObserver: {
        next: () => {
          console.log('[WebsocketService] WebSocket connection closed');
          this.socket$ = null;
          if (this.shouldReconnect) {
            this.reconnect();
          }
        },
      },
    });
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebsocketService] Attempting to reconnect... (${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), RECONNECT_INTERVAL);
    } else {
      console.error('[WebsocketService] Max reconnect attempts reached, giving up.');
    }
  }
}
