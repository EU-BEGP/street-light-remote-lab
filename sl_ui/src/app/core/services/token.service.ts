import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  token$: Observable<string | null> = this.tokenSubject.asObservable();

  get token(): string | null {
    return this.tokenSubject.value;
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  clearToken(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }
}
