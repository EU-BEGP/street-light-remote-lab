// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // User Related
  private readonly USER_ID: string = 'userId';

  getUserId(): number | null {
    return Number(localStorage.getItem(this.USER_ID));
  }

  setUserId(id: number): void {
    localStorage.setItem(this.USER_ID, id.toString());
  }

  clearUserData(): void {
    localStorage.removeItem(this.USER_ID);
  }

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

  // Booking Access Related
  private readonly ACCESS_KEY: string = 'accessKey';
  private readonly PASSWORD: string = 'pwd';

  getAccessKey(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  setAccessKey(key: string): void {
    localStorage.setItem(this.ACCESS_KEY, key);
  }

  getPassword(): string | null {
    return localStorage.getItem(this.PASSWORD);
  }

  setPassword(pwd: string): void {
    localStorage.setItem(this.PASSWORD, pwd);
  }

  clearAccessData(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.PASSWORD);
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
