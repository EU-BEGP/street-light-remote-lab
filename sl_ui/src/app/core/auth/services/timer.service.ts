import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private countdownValue = new BehaviorSubject<number>(0);
  countdown$ = this.countdownValue.asObservable();

  setCountdownTime(seconds: number): void {
    this.countdownValue.next(seconds);
  }

  getCountdownTime(): number {
    return this.countdownValue.getValue();
  }
}
