// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { ChartConfigurationService } from '../../services/chart-configuration.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-efficient-area-chart',
  templateUrl: './efficient-area-chart.component.html',
  styleUrls: ['./efficient-area-chart.component.css']
})
export class EfficientAreaChartComponent implements OnInit {
  chartData = [{
    x: this.generateXValues(30),
    y: this.generateRandomValues(30, 0, 100),
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'var(--main-blue)',
      width: 2
    },
    fillcolor: 'rgba(0, 119, 204, 0.2)'
  }];
  chartLayout: any;

  constructor(
    private chartConfigurationService: ChartConfigurationService,
  ) { }

  ngOnInit(): void {
    this.chartLayout = this.chartConfigurationService.getChartDefaultLayout();
  }

  // Helper function to generate x values
  private generateXValues(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  // Helper function to generate random y values
  private generateRandomValues(count: number, min: number, max: number): number[] {
    return Array.from({ length: count }, () =>
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  }
}
