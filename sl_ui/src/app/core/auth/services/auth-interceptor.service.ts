import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private router: Router, private cookieService: CookieService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: string | null = localStorage.getItem('token');
    const csrfToken = this.cookieService.get('csrftoken');

    let header = <any>{};
    let request = req;

    if (token) header.authorization = `token ${token}`;

    if (csrfToken) header['X-CSRFToken'] = csrfToken;

    request = req.clone({
      setHeaders: header,
    });

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (
          err.status === 401 ||
          (err.status === 0 && this.router.url != '/access')
        ) {
          localStorage.removeItem('token');
        }

        return throwError(err);
      })
    );
  }
}
