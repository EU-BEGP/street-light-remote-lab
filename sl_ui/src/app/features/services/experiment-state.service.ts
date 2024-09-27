import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExperimentStateService {
  private experimentId: number | null = null;

  setExperimentId(id: number): void {
    this.experimentId = id;
  }

  getExperimentId(): number | null {
    return this.experimentId;
  }

  clearExperimentId(): void {
    this.experimentId = null;
  }
}
