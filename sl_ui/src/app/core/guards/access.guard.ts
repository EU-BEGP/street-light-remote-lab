import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/features/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AccessGuard implements CanActivate {
  constructor(
    private router: Router,
    private storageService: StorageService,
  ) { }

  canActivate(): boolean {
    if (this.storageService.getToken()) {
      // If the user is logged in, redirect to the Laboratory
      this.router.navigate(['/experiments']);
      return false; // Prevent access to the AccessComponent
    } else {
      // If the user is not logged in, allow access to the AccessComponent
      return true;
    }
  }
}


