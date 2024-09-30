import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TimerService } from './timer.service';
import { Booking } from '../interfaces/booking';

@Injectable({
  providedIn: 'root'
})
export class BookingHandlerService {

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private timerService: TimerService
  ) { }

  handleBookingResponse(response: Booking[]): void {
    if (response && response.length > 0) {
      const remainingSeconds = this.getRemainingSeconds(response[0].end_date);
      this.timerService.setCountdownTime(remainingSeconds);
    } else {
      this.timerService.setCountdownTime(0);
      localStorage.removeItem('access_key');
      localStorage.removeItem('password');

      this.toastr.error("You can't access right now, your booking is invalid.");
      this.router.navigate(['/lobby']);
    }
  }

  handleErrorResponse(error: any): void {
    this.toastr.error("You can't access right now, please try again later.");
    this.router.navigate(['/lobby']);
  }

  private getRemainingSeconds(endDate: string): number {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.max(Math.floor((end - now) / 1000), 0);
  }
}
