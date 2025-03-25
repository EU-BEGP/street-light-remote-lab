// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from './config.json'
import { Booking } from './core/interfaces/booking';
import { BookingHandlerService } from './core/services/booking-handler.service';
import { BookingService } from './core/services/booking.service';
import { Component, OnInit } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';
import { Event, Router, RoutesRecognized } from '@angular/router';
import { NgxLoader } from 'ngx-http-loader';
import { StorageService } from './features/services/storage.service';
import { TimerService } from './core/services/timer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public loader: any = NgxLoader;
  private accessKeyParam: string = config.booking.urlParams.accessKey;
  private passwordParam: string = config.booking.urlParams.password;
  private hasNavigated: boolean = false;

  hasAccessToLab: boolean = false;
  countdownConfig: CountdownConfig = {
    leftTime: 0,
    format: 'HH:mm:ss',
    demand: true,
  };

  constructor(
    private bookingHandler: BookingHandlerService,
    private bookingService: BookingService,
    private router: Router,
    private storageService: StorageService,
    private timerService: TimerService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.router.events.subscribe((event: Event): void => {
      if (event instanceof RoutesRecognized) {
        this.handleRoute(event);
      }
    });
  }

  private handleRoute(event: RoutesRecognized): void {
    const firstChild = event.state.root.firstChild;
    if (firstChild) {
      const params = firstChild.queryParams;
      if (Object.keys(params).length > 0) {
        this.handleQueryParams(params);
      } else {
        this.handleStoredParams();
      }
    }
  }

  private handleQueryParams(params: any): void {
    const accessKey = params[this.accessKeyParam];
    const password = params[this.passwordParam] || null;

    if (accessKey) {
      this.storageService.setAccessKey(accessKey)
      this.storageService.setPassword(password)
      this.validateBooking(accessKey, password);
    } else {
      this.toastr.error('Make a booking to access this laboratory');
      if (!this.hasNavigated) {
        this.hasNavigated = true;
        this.router.navigate(['/lobby']);
      }
    }
  }

  private handleStoredParams(): void {
    const accessKey = this.storageService.getAccessKey();
    const password = this.storageService.getPassword();

    if (accessKey) {
      this.validateBooking(accessKey, password);
    } else {
      this.toastr.error('Make a booking to access this laboratory');
      if (!this.hasNavigated) {
        this.hasNavigated = true;
        this.router.navigate(['/lobby']);
      }
    }
  }

  private validateBooking(accessKey: string, password: string | null): void {
    this.bookingService.getBookingInfo(accessKey, password).subscribe(
      (response: Booking[]): void => {
        this.bookingHandler.handleBookingResponse(response);
        this.subscribeToCountdown();
      },
      (error: any): void => {
        this.bookingHandler.handleErrorResponse(error);
      }
    );
  }

  private subscribeToCountdown(): void {
    this.timerService.countdown$.subscribe((time: number): void => {
      if (time > 0) {
        this.hasAccessToLab = true;
        this.countdownConfig = {
          leftTime: time,
          format: 'HH:mm:ss',
        };
      } else {
        this.countdownConfig = {
          leftTime: 0,
          format: 'HH:mm:ss',
        };
      }
    });
  }

  onCountdownFinish(event: any): void {
    if (event.action == 'done') {
      this.storageService.clearAccessData();
      this.hasAccessToLab = false;
      this.router.navigate(['/lobby']);
    }
  }
}
