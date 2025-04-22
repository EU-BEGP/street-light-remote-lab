// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { ChartConfigurationService } from '../../services/chart-configuration.service';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { GridService } from '../../services/grid.service';

@Component({
  selector: 'app-light-simulation',
  templateUrl: './light-simulation.component.html',
  styleUrls: ['./light-simulation.component.css']
})
export class LightSimulationComponent implements OnInit, OnChanges {
  @Input() gridDimension: number = 0;
  @Input() grid: Grid | null = null;
  @Input() grids: Grid[] | null = null;

  separationNumber: number = 0;
  chartData: any[] = [];
  chartLayout: any;
  chartConfiguration: any;
  expandedGrids: any[] = [];
  showGridSelector: boolean = false;
  selectedGridIndex: number = 0;

  constructor(
    private chartConfigurationService: ChartConfigurationService,
    private gridService: GridService,
  ) { }

  ngOnInit(): void {
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grid'] && this.grid) {
      this.handleSingleGridInput();
    }

    if (changes['grids'] && this.grids) {
      this.handleMultipleGridsInput();
    }
  }

  private initializeChart(): void {
    this.chartLayout = this.chartConfigurationService.getChartSimulationLayout();
    this.chartConfiguration = this.chartConfigurationService.getChartRestrictiveToolbarConfiguration();
    this.chartData = [this.createBaseSurface()];
  }

  private createBaseSurface(): any {
    return {
      x: Array.from({ length: this.gridDimension }, (_, i) => i),
      y: Array.from({ length: this.gridDimension }, (_, i) => i),
      z: this.generateInitialZValues(this.gridDimension),
      type: 'surface',
      opacity: 0.8,
      showscale: false,
    };
  }

  private generateInitialZValues(size: number): number[][] {
    return Array.from({ length: size }, () => Array(size).fill(0));
  }

  private handleSingleGridInput(): void {
    this.showGridSelector = false;
    if (this.grid?.id) {
      this.gridService.getGridExpansion(this.grid.id).subscribe(expandedGrid => {
        this.expandedGrids = [expandedGrid];
        this.updateChart(expandedGrid);
      });
    }
  }

  private handleMultipleGridsInput(): void {
    this.showGridSelector = true;
    if (this.grids?.length && this.grids[0].id) {
      this.gridService.getGridExpansion(this.grids[0].id).subscribe(expandedGrid => {
        this.expandedGrids = [expandedGrid];
        this.updateChart(expandedGrid);
      });
    }
  }

  onGridSelect(event: any): void {
    this.selectedGridIndex = event.value;
    if (this.expandedGrids[this.selectedGridIndex]) {
      this.updateChart(this.expandedGrids[this.selectedGridIndex]);
    }
  }

  onSeparationNumberSelect(): void {
    if (this.expandedGrids[this.selectedGridIndex]) {
      this.updateChart(this.expandedGrids[this.selectedGridIndex]);
    }
  }

  private updateChart(zValues: number[][]): void {
    const repeatedZ = this.repeatGridZValues(zValues, 3, this.separationNumber);

    this.chartData = [{
      ...this.createBaseSurface(),
      z: repeatedZ,
      x: Array.from({ length: repeatedZ[0].length }, (_, i) => i),
      y: Array.from({ length: repeatedZ.length }, (_, i) => i)
    }];
  }

  private repeatGridZValues(zValues: number[][], repeatCount: number, separationDistance: number): number[][] {
    const repeatedZ: number[][] = [];
    const gap = Array(separationDistance).fill(NaN);

    for (const row of zValues) {
      const newRow: number[] = [];
      for (let i = 0; i < repeatCount; i++) {
        newRow.push(...row);
        if (i < repeatCount - 1) {
          newRow.push(...gap);
        }
      }
      repeatedZ.push(newRow);
    }

    return repeatedZ;
  }
}
