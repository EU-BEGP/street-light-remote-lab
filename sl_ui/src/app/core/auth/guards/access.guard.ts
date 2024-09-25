import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Booking } from '../../booking/interfaces/booking';
import { BookingService } from '../../booking/services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { BookingHandlerService } from '../../booking/services/booking-handler.service';
import config from '../../../config.json'

@Injectable({
  providedIn: 'root',
})
export class AccessGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private bookingHandler: BookingHandlerService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Capture booking query parameters
    const accessKeyParam: string = config.booking.urlParams.accessKey;
    const passwordParam: string = config.booking.urlParams.password;

    const accessKey = route.queryParams[accessKeyParam];
    const password = route.queryParams[passwordParam];

    if (accessKey) {
      localStorage.setItem('access_key', accessKey);
      if (password) {
        localStorage.setItem('password', password);
      }

      this.bookingService.getBookingInfo(accessKey, password).subscribe(
        (response: Booking[]): void => {
          this.bookingHandler.handleBookingResponse(response);
        },
        (error: any): void => {
          this.bookingHandler.handleErrorResponse(error);
        }
      );
    }

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/remote-lab'])
      return false;
    }

    return true;
  }
}


