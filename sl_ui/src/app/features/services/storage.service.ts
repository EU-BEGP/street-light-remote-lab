import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Auth Token Related
  private readonly TOKEN: string = 'token';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN);
  }

  // Experiment Related
  private readonly EXPERIMENT_ID: string = 'experimentId';

  getExperimentId(): number | null {
    return Number(localStorage.getItem(this.EXPERIMENT_ID));
  }

  setExperimentId(id: number): void {
    localStorage.setItem(this.EXPERIMENT_ID, id.toString());
  }

  clearExperimentData(): void {
    localStorage.removeItem(this.EXPERIMENT_ID);
  }

  // Light Related
  private readonly LIGHT_CODE_KEY: string = 'lightCode';
  private readonly LIGHT_TYPE_KEY: string = 'lightType';

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
