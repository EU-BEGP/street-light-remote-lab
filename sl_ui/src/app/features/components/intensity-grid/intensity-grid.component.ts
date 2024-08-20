import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-intensity-grid',
  templateUrl: './intensity-grid.component.html',
  styleUrls: ['./intensity-grid.component.css']
})
export class IntensityGridComponent implements OnInit {
  @Input() gridDimension = 10;
  grid: number[][] = Array(this.gridDimension).fill(null).map(() => Array(this.gridDimension).fill(0));

  constructor() { }

  ngOnInit(): void {
  }

  updateGrid(message: any): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      this.grid[message.x_pos][message.y_pos] = message.intensity;
    }
  }
}
