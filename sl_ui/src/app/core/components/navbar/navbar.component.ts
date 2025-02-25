import { Component, OnInit, OnDestroy } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';
import { Input, Output, EventEmitter } from '@angular/core';
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
  @Input() hasAccessToLab: boolean = false;
  @Input() countdownConfig: CountdownConfig = {
    leftTime: 0,
    format: 'HH:mm:ss',
    demand: true,
  };
  @Output() countdownFinish: EventEmitter<void> = new EventEmitter<void>();

  showMenu: boolean = false;
  currentRoute: string = '';
  private subscription?: Subscription;

  constructor(
    private router: Router,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    this.subscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = this.router.url;
      });

    this.showMenu = !(this.storageService.getToken());
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onCountdownFinish(event: any): void {
    this.countdownFinish.emit(event);
  }

  goToExperiments(): void {
    this.router.navigate(['/experiments']);
  }

  goToMyProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToLogin(): void {
    this.router.navigate(['']);
  }

  logout(): void {
    this.storageService.clearToken();
    this.showMenu = false;
    this.goToLogin();
  }

  showNavbarItem(routeName: string): boolean {
    if (this.currentRoute == routeName) {
      return false;
    }
    return true;
  }
}
