// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { BookingService } from 'src/app/core/services/booking.service';
import { Component, OnInit } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-light-monitoring-activity',
  templateUrl: './light-monitoring-activity.component.html',
  styleUrls: ['./light-monitoring-activity.component.css']
})
export class LightMonitoringActivityComponent implements OnInit {
  lamps = [1, 2, 3];

  // Booking variables
  accessKey: string | null = null;
  password: string | null = null;

  // Counter configuration
  countdownConfig: CountdownConfig = {
    leftTime: 0,
    format: 'HH:mm:ss',
    demand: true
  };
  countdownActive: boolean = false;

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.accessKey = this.storageService.getAccessKey();
    this.password = this.storageService.getPassword();

    if (this.accessKey) {
      this.bookingService.getBookingInfo(this.accessKey, this.password).subscribe(response => {
        if (response && response.length > 0) {
          const remainingSeconds = this.getRemainingSeconds(response[0].end_date);
          // Initialize countdown
          this.countdownConfig = {
            ...this.countdownConfig,
            leftTime: remainingSeconds,
            demand: false,
            notify: [300, 60]
          };
          this.countdownActive = true;
        }
      });
    }
  }

  // Countdown logic
  handleCountdownEvent(event: any): void {
    if (!this.countdownActive) return;

    if (event.action === 'notify') {
      this.toastr.warning(`Only ${event.left} seconds remaining!`);
    }

    if (event.action === 'done') {
      this.storageService.clearAccessData();
      this.toastr.warning(
        'Your booking time has expired',
        'Time Up',
        { timeOut: 5000, closeButton: true }
      );
      this.router.navigate(['/']);
    }
  }

  private getRemainingSeconds(endDate: string): number {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.max(Math.floor((end - now) / 1000), 0);
  }

}
