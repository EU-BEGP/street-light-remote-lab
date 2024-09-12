import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-intensity-grid',
  templateUrl: './intensity-grid.component.html',
  styleUrls: ['./intensity-grid.component.css']
})
export class IntensityGridComponent implements OnInit {
  @Input() gridDimension = 10;
  grid: number[][] = this.generateInitialGrid();

  constructor() { }

  ngOnInit(): void {
  }

  setGrid(messages: Message[]): void {
    messages.forEach((message: Message): void => {
      this.updateGridByMessage(message);
    });
  }

  refreshGrid(message: Message): void {
    if (message.x_pos == 0 && message.y_pos == 0) {
      this.grid = this.generateInitialGrid();
    }
    this.updateGridByMessage(message);
  }

  private generateInitialGrid(): number[][] {
    return Array(this.gridDimension).fill(0).map(() => Array(this.gridDimension).fill(0));
  }

  private updateGridByMessage(message: Message): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      // CREATE a new grid  array with updated values
      this.grid = this.grid.map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
    }
  }
}
