// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Grid } from '../../interfaces/grid'; import { Message } from '../../interfaces/message';
@Component({
  selector: 'app-intensity-matrix',
  templateUrl: './intensity-matrix.component.html',
  styleUrls: ['./intensity-matrix.component.css']
})
export class IntensityMatrixComponent implements OnInit, OnChanges {
  @Input() gridDimension: number = 0;
  @Input() selectedGridIndex: number = 0;
  @Input() currentMessage: Message | null = null;

  matrixContainer = {
    matrices: [] as number[][][], // Array to store all matrices
  };
  firstMatrixUpdated: boolean = false;
  currentMatrixIndex = 0;

  constructor() { }

  //Lifecycle hooks
  ngOnInit(): void {
    this.generateBaseMatrix();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentMessage'] && this.currentMessage) {
      this.updateMatrixByMessage(this.currentMessage);
    }
  }

  // Generate base empty matrix filled with zeros
  private generateBaseMatrix(): void {
    // Create a new matrix filled with zeros
    const baseMatrix = Array(this.gridDimension)
      .fill(0)
      .map(() => Array(this.gridDimension).fill(0));

    // Create a new matrices array with the new matrix added
    this.matrixContainer.matrices = [
      ...this.matrixContainer.matrices,
      baseMatrix,
    ];

    // Update the selectedGridIndex to point to the new matrix
    this.selectedGridIndex = this.matrixContainer.matrices.length - 1;
  }

  // Update matrix based on the received message
  private updateMatrixByMessage(message: any): void {
    if (message && message.x_pos >= 0 && message.x_pos < this.gridDimension && message.y_pos >= 0 && message.y_pos < this.gridDimension) {
      // First message received
      if (message.x_pos === 0 && message.y_pos === 0) {
        // Check if the first matrix has already been updated:
        // - If yes, generate a new base matrix.
        // - If no, mark the first matrix as updated.
        if (this.firstMatrixUpdated) {
          this.generateBaseMatrix();
          this.currentMatrixIndex += 1;
        } else {
          this.firstMatrixUpdated = true;
        }
      }

      // Update only the latest matrix
      const lastMatrixIndex = this.matrixContainer.matrices.length - 1;

      // Create the updated matrix
      const updatedMatrix = this.matrixContainer.matrices[lastMatrixIndex] = this.matrixContainer.matrices[lastMatrixIndex].map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );

      // Update the matrices array immutably
      this.matrixContainer.matrices = [
        ...this.matrixContainer.matrices.slice(0, lastMatrixIndex),
        updatedMatrix,
        ...this.matrixContainer.matrices.slice(lastMatrixIndex + 1)
      ];
    }
  }

  // Generate cell color based on the received intensity level
  getCellColor(value: number): string {
    // Default
    if (value === 0) {
      return 'white';
    }

    const max = 400;
    const ratio = value / max;

    const red = Math.floor(255 * ratio);
    const green = Math.floor(130 * ratio);
    const blue = Math.floor(255 * (1 - ratio));

    return `rgb(${red}, ${green}, ${blue})`;
  }
}
