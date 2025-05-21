// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/features/services/storage.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService
  ) { }

  canActivate(): boolean {
    if (!this.storageService.getToken()) {
      this.toastr.error(
        'You need to be logged in to continue',
        'Authentication Required',
        {
          timeOut: 5000,
          closeButton: true,
        }
      );
      this.router.navigate(['/']); // Redirect to access page
      return false;
    }
    return true;
  }
}
