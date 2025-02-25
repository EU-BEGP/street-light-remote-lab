import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/features/services/storage.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService,
  ) { }

  canActivate(): boolean {
    if (!this.storageService.getToken()) {
      // If the user is not logged in, redirect to the AccessComponent
      this.router.navigate(['']);
      this.toastr.error('You must be logged in to view this page.', 'Access Denied');
      return false; // Prevent access to the protected route
    }

    return true; // Allow access to the route
  }
}
