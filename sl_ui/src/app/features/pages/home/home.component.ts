// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  accessKey: string | null = null;
  password: string | null = null;
  showLoginButton: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.accessKey = params['access_key'];
        this.password = params['pwd'];
        if (this.accessKey) {
          this.storageService.setAccessKey(this.accessKey)
          if (this.password) this.storageService.setPassword(this.password)
        }
      }
    });
  }

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
