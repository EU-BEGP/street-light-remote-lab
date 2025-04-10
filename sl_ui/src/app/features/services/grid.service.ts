// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grid } from '../interfaces/grid';
import config from 'src/app/config.json';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  private httpOptions = <any>{};
  private URL: string = '';

  constructor(private http: HttpClient) {
    this.URL = `${config.api.baseUrl}${config.api.streetLights.grid}`;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getGrid(id: number): Observable<any> {
    return this.http.get<any>(`${this.URL}${id}/`);
  }

  updateGrid(body: any, id: number): Observable<any> {
    return this.http.patch<any>(`${this.URL}${id}/`, body);
  }

  getGridExpansion(id: number): Observable<any> {
    return this.http.get(`${this.URL}${id}/expansion/`);
  }
}
