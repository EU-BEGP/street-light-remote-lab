import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-intensity-chart',
  templateUrl: './intensity-chart.component.html',
  styleUrls: ['./intensity-chart.component.css']
})
export class IntensityChartComponent implements OnInit {
  @Input() gridDimension = 10;
  graph = {
    data: [{
      x: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      y: Array.from({ length: this.gridDimension }, (_, i) => i + 1),
      z: this.generateInitialZValues(this.gridDimension),
      type: 'surface',
    }]
  };

  constructor() { }

  ngOnInit(): void {
  }

  setGraph(messages: Message[]): void {
    messages.forEach((message: Message): void => {
      this.updateGraphByMessage(message);
    })
  }

  refreshGraph(message: Message): void {
    if (message.x_pos == 0 && message.y_pos == 0) {
      this.restoreGraph();
    }
    this.updateGraphByMessage(message);
  }

  private generateInitialZValues(gridSize: number): number[][] {
    return Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => 0)
    );
  }

  private restoreGraph(): void {
    const newZ = this.generateInitialZValues(this.gridDimension);
    this.graph.data = [{
      ...this.graph.data[0],
      z: newZ
    }];
  }

  private updateGraphByMessage(message: Message): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      // CREATE a new `z` array with updated values
      this.graph.data[0].z = this.graph.data[0].z.map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
    }
  }
}
