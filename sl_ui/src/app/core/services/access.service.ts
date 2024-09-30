import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private accessKey: string | null = null;
  private password: string | null = null;

  setAccess(key: string, pwd: string | null): void {
    this.accessKey = key;
    localStorage.setItem('access_key', key);
    if (pwd) {
      this.password = pwd;
      localStorage.setItem('pwd', pwd);
    }
  }

  getAccess() {
    if (!this.accessKey) {
      this.accessKey = localStorage.getItem('access_key');
      this.password = localStorage.getItem('pwd');
    }

    if (this.accessKey) {
      return { accessKey: this.accessKey, password: this.password };
    }
    else {
      return {};
    }
  }

  clearAccess(): void {
    this.accessKey = null;
    this.password = null;
    localStorage.removeItem('access_key');
    localStorage.removeItem('pwd');
  }
}
