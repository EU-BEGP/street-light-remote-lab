// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, EMPTY, Subscription } from 'rxjs';
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
  protected serviceName?: string; // Store the service name for logging
  private disconnectedByUser: boolean = false;

  constructor(protected ngZone: NgZone) { }

  protected setServiceName(name: string): void {
    this.serviceName = name;
  }

  protected log(message: string): void {
    console.log(`[${this.serviceName}] ${message}`);
  }

  public connect(wsUrl: string): void {
    this.disconnect();

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket(wsUrl);

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
        message => this.ngZone.run(() => this.messagesSubject$.next(message)),
        error => this.ngZone.run(() => this.log(`Received error: ${error}`)),
        () => this.ngZone.run(() => { })
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
