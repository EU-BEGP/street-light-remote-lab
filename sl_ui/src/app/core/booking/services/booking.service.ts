import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../interfaces/booking';
import config from 'src/app/config.json';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private httpOptions: any = <any>{};
  URL: string = `${config.booking.accessUrl}`;

  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getBookingInfo(accessKey: string, password: string | null): Observable<Booking[]> {
    const accessParam = config.booking.urlParams.accessKey;
    const passwordParam = config.booking.urlParams.password;
    const url = `${this.URL}?${accessParam}=${accessKey}${password ? `&${passwordParam}=${password}` : ''}`;

    return this.http.get<Booking[]>(url);
  }
}
