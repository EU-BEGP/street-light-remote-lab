// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { BookingService } from 'src/app/core/services/booking.service';
import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseBookingGuard implements CanActivate {
  constructor(
    protected bookingService: BookingService,
    protected router: Router,
    protected storageService: StorageService,
    protected toastr: ToastrService,
  ) { }

  abstract getRequiredEquipmentId(): number;

  canActivate(): Observable<boolean> {
    const accessKey = this.storageService.getAccessKey();
    const password = this.storageService.getPassword();

    if (!accessKey || !password) {
      this.toastr.warning(
        'You need to have valid booking credentials to access this page',
        'Booking Required',
        {
          timeOut: 5000,
          closeButton: true,
        }
      );
      this.router.navigate(['/']);
      return of(false);
    }

    return this.bookingService.getBookingInfo(accessKey, password).pipe(
      map((response: any[]) => {
        if (!response || response.length === 0) {
          this.toastr.warning(
            'No active booking found for your credentials',
            'No Booking Available',
            {
              timeOut: 5000,
              closeButton: true,
            }
          );
          this.router.navigate(['/']);
          return false;
        }

        const booking = response[0];
        if (booking.equipment.id !== this.getRequiredEquipmentId()) {
          this.toastr.warning(
            'Your booking is not valid for this equipment',
            'Invalid Equipment',
            {
              timeOut: 5000,
              closeButton: true,
            }
          );
          this.router.navigate(['/']);
          return false;
        }

        return true;
      }),
      catchError(() => {
        this.toastr.warning(
          'We encountered an error verifying your booking',
          'Verification Error',
          {
            timeOut: 5000,
            closeButton: true,
          }
        );
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
