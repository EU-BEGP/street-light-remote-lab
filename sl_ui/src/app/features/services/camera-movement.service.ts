// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from 'src/app/config.json'
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraMovementService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  private URL: string = '';
  private httpNoInterceptors: HttpClient;

  constructor(private http: HttpClient, private httpBackend: HttpBackend) {
    this.URL = `${config.api.baseUrl}`;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    this.httpNoInterceptors = new HttpClient(httpBackend);
  }

  moveCamera(direction: string, camera_number: number): Observable<any> {
    const body = { direction, camera_number };
    return this.httpNoInterceptors.post(`${this.URL}${config.api.streetLights.cameraMovement.move}`, body, this.httpOptions);
  }

  stopCamera(camera_number: number): Observable<any> {
    const body = { camera_number };
    return this.httpNoInterceptors.post(`${this.URL}${config.api.streetLights.cameraMovement.stop}`, body, this.httpOptions);
  }
}
