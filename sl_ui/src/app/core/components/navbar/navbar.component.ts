import { Component, OnInit, OnDestroy } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';
import { Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { TokenService } from '../../services/token.service';
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
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.subscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = this.router.url;
      });

    this.tokenService.token$.subscribe(token => {
      this.showMenu = !!token;
    });
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
    this.tokenService.clearToken();
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
