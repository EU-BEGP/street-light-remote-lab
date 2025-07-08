// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { AccessComponent } from '../access/access.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileComponent } from '../profile/profile.component';
import { Router, NavigationEnd } from '@angular/router';
import { StorageService } from 'src/app/features/services/storage.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  showNormalMenu: boolean = false;
  currentRoute: string = '';
  private routerSubscription?: Subscription;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = this.router.url;
      });

    this.showNormalMenu = !!(this.storageService.getToken());
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) this.routerSubscription.unsubscribe();
  }

  showNavbarItem(routeName: string): boolean {
    if (this.currentRoute == routeName) return false;
    return true;
  }

  openProfileDialog(): void {
    this.dialog.open(ProfileComponent, {
      width: '600px',
      maxHeight: '90vh',
      autoFocus: true,
      disableClose: false
    });
  }

  openAccessDialog(): void {
    const dialogRef = this.dialog.open(AccessComponent, {
      width: '600px',
      maxHeight: '90vh',
      autoFocus: true,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.login === "success") {
          this.showNormalMenu = true;
        }
      }
    });
  }

  logout(): void {
    this.storageService.clearToken();
    this.showNormalMenu = false;
    this.router.navigate(['/']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
