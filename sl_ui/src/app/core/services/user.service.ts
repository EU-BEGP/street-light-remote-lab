// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../interfaces/user';
import config from 'src/app/config.json';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private httpOptions: any = <any>{};

  constructor(private httpClient: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getUserData(): Observable<User> {
    const URL: string = `${config.api.baseUrl}${config.api.users.me}`;
    return this.httpClient.get<User>(URL);
  }

  updateUserData(user: User): Observable<any> {
    const URL: string = `${config.api.baseUrl}${config.api.users.me}`;
    return this.httpClient.patch(URL, user, this.httpOptions);
  }
}
