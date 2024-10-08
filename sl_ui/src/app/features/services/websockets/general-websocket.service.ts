import { Injectable } from '@angular/core';
import { Observable, Subject, EMPTY, Subscription } from 'rxjs';
import { TokenService } from 'src/app/core/services/token.service';
import { catchError } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export const RECONNECT_INTERVAL = 2000;

@Injectable({
  providedIn: 'root'
})
export class GeneralWebsocketService {
  private messageSubscription: Subscription | null = null;
  private messagesSubject$: Subject<any> = new Subject<any>();
  public messages$: Observable<any> = this.messagesSubject$.asObservable();
  private socket$: WebSocketSubject<any> | null = null;
  private disconnectedByUser: boolean = false;
  protected serviceName?: string; // Store the service name for logging

  constructor(private tokenService: TokenService) { }

  protected setServiceName(name: string): void {
    this.serviceName = name;
  }

  protected log(message: string): void {
    console.log(`[${this.serviceName}] ${message}`);
  }

  public connect(wsUrl: string): void {
    this.disconnect();

    const token = this.tokenService.token;

    if (!token) return;

    const tokenizedWsUrl = `${wsUrl}?token=${token}`;

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket(tokenizedWsUrl);

      this.messageSubscription = this.socket$.pipe(
        catchError(error => {
          if (error instanceof Event) {
            const ws = error.target as WebSocket; // Type assertion
            this.log(`Error! Type: ${error.type}, Target: ${ws}, ReadyState: ${ws.readyState}`);
          } else {
            this.log(`Error!: ${JSON.stringify(error)}`);
          }
          return EMPTY;
        })
      ).subscribe(
        message => this.messagesSubject$.next(message),
        error => this.log(`Received error: ${error}`),
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

  protected reconnect(wsUrl: string): void {
    this.log('Attempting to reconnect...');
    setTimeout((): void => this.connect(wsUrl), RECONNECT_INTERVAL);
  }

  private getNewWebSocket(wsUrl: string): WebSocketSubject<any> {
    return webSocket({
      url: wsUrl,
      openObserver: {
        next: (): void => this.log('WebSocket connection established'),
      },
      closeObserver: {
        next: (): void => {
          this.log('WebSocket connection closed');
          if (!this.disconnectedByUser) {
            this.reconnect(wsUrl);
          }
        },
      },
    });
  }
}
