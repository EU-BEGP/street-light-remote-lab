import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgxLoader } from 'ngx-http-loader';
import { TimerService } from './core/auth/services/timer.service';
import { CountdownConfig } from 'ngx-countdown';
import { Router } from '@angular/router';
import { BookingHandlerService } from './core/booking/services/booking-handler.service';
import { BookingService } from './core/booking/services/booking.service';
import { Booking } from './core/booking/interfaces/booking';
import { ToastrService } from 'ngx-toastr';
import config from './config.json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  public loader: any = NgxLoader;

  hasAccessToLab: boolean = false;
  countdownConfig: CountdownConfig = {
    leftTime: 0,
    format: 'HH:mm:ss',
    demand: true,
  };

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private timerService: TimerService,
    private bookingService: BookingService,
    private bookingHandler: BookingHandlerService,
  ) { }

  ngOnInit(): void {
    // Subscribe to the countdown observable from the TimerService
    this.timerService.countdown$.subscribe((time) => {
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

  ngAfterViewInit(): void {
    const accessKey: string | null = localStorage.getItem('access_key');
    const password: string | null = localStorage.getItem('password');

    // Confirm validation of reservation
    if (accessKey) {
      this.bookingService.getBookingInfo(accessKey, password).subscribe(
        (response: Booking[]): void => {
          this.bookingHandler.handleBookingResponse(response);
        },
        (error: any): void => {
          this.bookingHandler.handleErrorResponse(error);
        }
      );
    }
  }

  onCountdownFinish(event: any): void {
    if (event.action == "done") {
      localStorage.removeItem('access_key');
      localStorage.removeItem('password');
      this.hasAccessToLab = false;
      this.router.navigate(['/lobby']);
    }
  }
}
