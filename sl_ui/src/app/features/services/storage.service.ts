import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly LIGHT_CODE_KEY = 'light_code';
  private readonly LIGHT_TYPE_KEY = 'light_type';

  getLightCode(): string | null {
    return localStorage.getItem(this.LIGHT_CODE_KEY);
  }

  setLightCode(code: string): void {
    localStorage.setItem(this.LIGHT_CODE_KEY, code);
  }

  getLightType(): string | null {
    return localStorage.getItem(this.LIGHT_TYPE_KEY);
  }

  setLightType(type: string): void {
    localStorage.setItem(this.LIGHT_TYPE_KEY, type);
  }

  clearLightData(): void {
    localStorage.removeItem(this.LIGHT_CODE_KEY);
    localStorage.removeItem(this.LIGHT_TYPE_KEY);
  }
}
