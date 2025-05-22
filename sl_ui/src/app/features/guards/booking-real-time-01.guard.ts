// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from 'src/app/config.json';
import { BaseBookingGuard } from './base-booking.guard';
import { BookingService } from 'src/app/core/services/booking.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class BookingRealTime01Guard extends BaseBookingGuard {
  constructor(
    bookingService: BookingService,
    router: Router,
    storageService: StorageService,
    toastr: ToastrService,
  ) {
    super(bookingService, router, storageService, toastr);
  }

  getRequiredEquipmentId(): number {
    return config.realTimeEquipmentsIds.realTime01;
  }
}
