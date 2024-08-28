import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

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
      type: "surface",
    }]
  };

  constructor() { }

  ngOnInit(): void {
  }

  updateGraph(message: any): void {
    if (message.x_pos == 0 && message.y_pos == 0) {
      this.graph.data[0].z = this.generateInitialZValues(this.gridDimension)
    }

    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      this.graph.data[0].z[message.y_pos][message.x_pos] = message.intensity;
    }
  }

  private generateInitialZValues(gridSize: number): number[][] {
    return Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => Math.floor(Math.random() * 21))
    );
  }
}
