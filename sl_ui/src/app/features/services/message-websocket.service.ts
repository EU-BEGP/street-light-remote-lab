import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import config from 'src/app/config.json';

export const WS_ENDPOINT = config.api.messagesWS;
export const RECONNECT_INTERVAL = 2000;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: any;
  private messagesSubject$ = new Subject<any>();
  public messages$ = this.messagesSubject$.asObservable();

  constructor() { }

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();

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

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    } else {
      console.error('Socket not initialized or already closed.');
    }
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: WS_ENDPOINT,
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
