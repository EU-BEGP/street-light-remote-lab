import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/message-websocket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  GRID_DIMENSION: number = 5;
  sliderValue = 50;
  grid: number[][] = Array(this.GRID_DIMENSION).fill(null).map(() => Array(this.GRID_DIMENSION).fill(0));

  constructor(
    private websocketService: WebsocketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.websocketService.connect();
    this.websocketService.messages$.subscribe((message) => {
      this.updateGrid(message);
    });
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  private updateGrid(message: any): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.GRID_DIMENSION && message.y_pos >= 0 && message.y_pos < this.GRID_DIMENSION) {
      this.grid[message.x_pos][message.y_pos] = message.intensity;
    }
  }
}
