import { Component, OnInit } from '@angular/core';
import { CountdownConfig } from 'ngx-countdown';
import { Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Input() hasAccessToLab: boolean = false;
  @Input() countdownConfig: CountdownConfig = {
    leftTime: 0,
    format: 'HH:mm:ss',
    demand: true,
  };
  @Output() countdownFinish: EventEmitter<void> = new EventEmitter<void>();

  showMenu: boolean = false;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.showMenu = !!token;
  }

  onCountdownFinish(event: any): void {
    this.countdownFinish.emit(event);
  }

  goToRemoteLaboratory(): void {
    this.router.navigate(['/remote-lab']);
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
    localStorage.removeItem('token');
    this.goToLogin();
    this.showMenu = false;
  }
}
