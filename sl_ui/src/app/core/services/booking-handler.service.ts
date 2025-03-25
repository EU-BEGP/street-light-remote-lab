// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Booking } from '../interfaces/booking';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/features/services/storage.service';
import { TimerService } from './timer.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class BookingHandlerService {

  constructor(
    private router: Router,
    private storageService: StorageService,
    private timerService: TimerService,
    private toastr: ToastrService,
  ) { }

  handleBookingResponse(response: Booking[]): void {
    if (response && response.length > 0) {
      const remainingSeconds = this.getRemainingSeconds(response[0].end_date);
      this.timerService.setCountdownTime(remainingSeconds);
    } else {
      this.timerService.setCountdownTime(0);
      this.storageService.clearAccessData();

      this.toastr.error('You can not access right now, your booking is invalid.');
      this.router.navigate(['/lobby']);
    }
  }

  handleErrorResponse(error: any): void {
    this.toastr.error('You can not access right now, please try again later.');
    this.router.navigate(['/lobby']);
  }

  private getRemainingSeconds(endDate: string): number {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.max(Math.floor((end - now) / 1000), 0);
  }
}
