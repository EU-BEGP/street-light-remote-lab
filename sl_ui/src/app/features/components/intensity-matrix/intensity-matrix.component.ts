import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Grid } from '../../interfaces/grid';
import { Message } from '../../interfaces/message';
import { RobotWebsocketService } from '../../services/websockets/robot-websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-intensity-matrix',
  templateUrl: './intensity-matrix.component.html',
  styleUrls: ['./intensity-matrix.component.css']
})
export class IntensityMatrixComponent implements OnInit, OnDestroy, OnChanges {
  @Input() gridDimension: number = 0;
  @Input() savedGrids: Grid[] | null = null;
  @Input() selectedGridIndex: number = 0;
  private robotSubscription: Subscription | null = null;

  matrixContainer = {
    matrices: [] as number[][][], // Array to store all matrices
  };
  firstMatrixUpdated: boolean = false;
  currentMatrixIndex = 0;

  constructor(
    private robotWebsocketService: RobotWebsocketService
  ) { }

  //Lifecycle hooks
  ngOnInit(): void {
    this.generateBaseMatrix();
    this.connectRobotWebsocket();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['savedGrids'] && this.savedGrids) {
      this.savedGrids?.forEach(grid => {
        const messages = grid.grid_messages;
        if (messages) {
          messages.forEach(message => {
            this.updateMatrixByMessage(message);
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.robotSubscription) this.robotSubscription.unsubscribe();
    this.robotWebsocketService.disconnect();
  }

  // Robot websocket connection
  private connectRobotWebsocket(): void {
    this.robotWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.robotSubscription) {
      this.robotSubscription.unsubscribe();
    }

    // Subscribe to websocket messages
    this.robotSubscription = this.robotWebsocketService.messages$.subscribe((robot_msg: Message): void => {
      if (robot_msg) {
        // Update matrix message by message
        this.updateMatrixByMessage(robot_msg)
      }
    });
  }

  // Generate base empty matrix filled with zeros
  private generateBaseMatrix(): void {
    this.matrixContainer.matrices.push(Array(this.gridDimension).fill(0).map(() => Array(this.gridDimension).fill(0)));
  }

  // Update matrix based on the received message
  private updateMatrixByMessage(message: Message): void {
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
      this.matrixContainer.matrices[lastMatrixIndex] = this.matrixContainer.matrices[lastMatrixIndex].map((row: number[], rowIndex: number): number[] =>
        rowIndex === message.y_pos
          ? [...row.slice(0, message.x_pos), message.intensity, ...row.slice(message.x_pos + 1)]
          : row
      );
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
