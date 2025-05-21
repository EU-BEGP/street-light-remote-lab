// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  showLoginButton: boolean = true;

  constructor(
    private router: Router,
  ) { }

  goToRealTime01(): void {
    this.router.navigateByUrl('/real-time-01');
  }

  goToRealTime02(): void {
    this.router.navigateByUrl('/real-time-02');
  }

  goToUltraConcurrent(): void {
    this.router.navigateByUrl('/ultra-concurrent');
  }
}
