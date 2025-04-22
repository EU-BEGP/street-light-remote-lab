// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, Input, OnInit } from '@angular/core';
import { Grid } from '../../interfaces/grid';

@Component({
  selector: 'app-static-intensity-matrix',
  templateUrl: './static-intensity-matrix.component.html',
  styleUrls: ['./static-intensity-matrix.component.css']
})
export class StaticIntensityMatrixComponent implements OnInit {
  @Input() gridDimension: number = 0;
  @Input() grid: Grid | null = null;

  currentMatrix: number[][] = [];

  ngOnInit(): void {
    this.initializeMatrix();
  }

  ngOnChanges(): void {
    this.initializeMatrix();
    if (this.grid?.grid_messages) {
      this.updateMatrix();
    }
  }

  private initializeMatrix(): void {
    // Always create a base matrix (filled with zeros)
    this.currentMatrix = Array.from({ length: this.gridDimension }, () =>
      Array(this.gridDimension).fill(0)
    );
  }

  private updateMatrix(): void {
    if (!this.grid?.grid_messages || !this.gridDimension) return;

    // Fill with actual data while preserving the matrix structure
    this.grid.grid_messages.forEach(message => {
      if (this.isValidPosition(message.x_pos, message.y_pos)) {
        this.currentMatrix[message.y_pos][message.x_pos] = message.intensity;
      }
    });
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridDimension && y >= 0 && y < this.gridDimension;
  }

  getCellColor(value: number): string {
    if (value === 0) return 'white';

    const max = 400;
    const ratio = value / max;
    const red = Math.floor(255 * ratio);
    const green = Math.floor(130 * ratio);
    const blue = Math.floor(255 * (1 - ratio));

    return `rgb(${red}, ${green}, ${blue})`;
  }
}
