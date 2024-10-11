import config from 'src/app/config.json'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Light } from '../interfaces/light';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LightService {
  private httpOptions = <any>{};
  private URL: string = '';

  constructor(private http: HttpClient) {
    this.URL = `${config.api.baseUrl}${config.api.streetLights.light}`;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getLights(): Observable<Light[]> {
    return this.http.get<Light[]>(this.URL);
  }

  getLightById(lightId: number): Observable<Light> {
    return this.http.get<Light>(`${this.URL}${lightId}/`);
  }

  createLight(light: Light): Observable<Light> {
    return this.http.post<Light>(this.URL, light);
  }

  updateLight(light: Light, id: number): Observable<Light> {
    return this.http.patch<Light>(`${this.URL}${id}/`, light);
  }

  getLightGrids(lightId?: number): Observable<Light> {
    return this.http.get<Light>(`${this.URL}${lightId}/grids/`);
  }
}
