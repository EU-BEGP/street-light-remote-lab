import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Robot } from '../interfaces/robot';
import { Experiment } from '../interfaces/experiment';
import config from 'src/app/config.json';

@Injectable({
  providedIn: 'root'
})
export class LightService {
  private httpOptions = <any>{};

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  requestGrid(): Observable<any> {
    const URL = `${config.api.baseUrl}${config.api.streetLights.mqtt.requestGrid}`;
    return this.http.get<any>(URL)
  }

  setLightProperties(data: any): Observable<any> {
    const URL = `${config.api.baseUrl}${config.api.streetLights.mqtt.lightProperties}`;
    return this.http.post(URL, data, this.httpOptions);
  }
}
