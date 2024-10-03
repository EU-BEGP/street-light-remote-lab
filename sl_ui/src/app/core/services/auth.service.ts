import config from 'src/app/config.json';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User } from '../interfaces/user';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpOptions = <any>{};

  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  signUp(user: User): Observable<any> {
    const URL = `${config.api.baseUrl}${config.api.users.signup}`;
    return this.http
      .post(URL, user, this.httpOptions)
      .pipe(catchError(this.handleError<User>('signUp')));
  }

  login(user: User): Observable<any> {
    const URL = `${config.api.baseUrl}${config.api.users.login}`;
    return this.http
      .post(URL, user, this.httpOptions)
      .pipe(catchError(this.handleError<User>('login')));
  }

  activateAccount(params: any): Observable<any> {
    var URL = `${config.api.baseUrl}${config.api.users.accountActivation}`;
    return this.http.patch(URL, params);
  }

  requestVerificationCode(id: number): Observable<any> {
    var URL = `${config.api.baseUrl}${config.api.users.codeRequest}`;
    return this.http.patch(URL, { id: id });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      if (error && error.error)
        this.toastr.error(this.getServerErrorMessage(error), 'Error');

      return of(result as T);
    };
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    let errorMsg = 'A server error has ocurred please try later.';

    if (error.error['non_field_errors'])
      errorMsg = `${error.error['non_field_errors']}. Please check that your email and password are correct.`;
    else if (error.error['email']) errorMsg = error.error['email'];

    return errorMsg;
  }
}
