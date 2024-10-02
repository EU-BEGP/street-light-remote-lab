import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) { }

  canActivate(): boolean {
    const token = this.tokenService.token;

    if (!token) {
      // If the user is not logged in, redirect to the AccessComponent
      this.router.navigate(['']);
      return false; // Prevent access to the protected route
    }

    return true; // Allow access to the route
  }
}
