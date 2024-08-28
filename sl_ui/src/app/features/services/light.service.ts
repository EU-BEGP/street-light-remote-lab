import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import config from 'src/app/config.json';
import { Robot } from '../interfaces/robot';

@Injectable({
  providedIn: 'root'
})
export class LightService {
  private httpOptions = <any>{};

  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getRobot(): Observable<Robot> {
    const URL = `${config.api.baseUrl}${config.api.streetLights.robot}`;
    console.log(URL);
    return this.http.get<Robot>(URL);

  }

  requestGrid(): Observable<any> {
    const URL = `${config.api.baseUrl}${config.api.streetLights.requestGrid}`;
    return this.http.get<any>(URL)
  }

  setLightProperties(data: any): Observable<any> {
    const URL = `${config.api.baseUrl}${config.api.streetLights.lightProperties}`;
    return this.http.post(URL, data, this.httpOptions);
  }
}
