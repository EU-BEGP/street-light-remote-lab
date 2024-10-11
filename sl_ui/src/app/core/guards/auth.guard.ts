import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private tokenService: TokenService,
  ) { }

  canActivate(): boolean {
    const token = this.tokenService.token;

    if (!token) {
      // If the user is not logged in, redirect to the AccessComponent
      this.router.navigate(['']);
      this.toastr.error('You must be logged in to view this page.', 'Access Denied');
      return false; // Prevent access to the protected route
    }

    return true; // Allow access to the route
  }
}
