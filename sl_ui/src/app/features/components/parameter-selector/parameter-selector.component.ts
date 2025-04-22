// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { GridService } from '../../services/grid.service';

@Component({
  selector: 'app-parameter-selector',
  templateUrl: './parameter-selector.component.html',
  styleUrls: ['./parameter-selector.component.css']
})
export class ParameterSelectorComponent implements OnInit {
  @Output() gridLoaded = new EventEmitter<any>();

  parameters: any;
  selectedPWM: number | null = null;
  selectedHeight: number | null = null;
  isInitialLoad = true;

  constructor(private gridService: GridService) { }

  ngOnInit() {
    this.loadParameters();
  }

  loadParameters() {
    this.isInitialLoad = true;
    this.gridService.getUCGridsParameters().subscribe({
      next: (params) => {
        this.parameters = params;
        this.isInitialLoad = false;
      },
      error: (err) => {
        console.error('Failed to load parameters', err);
        this.isInitialLoad = false;
      }
    });
  }

  onParameterSelected() {
    if (this.selectedPWM && this.selectedHeight) {
      this.gridService.searchUCGridByParameters(this.selectedHeight, this.selectedPWM)
        .subscribe({
          next: (gridResponse) => {
            // Emit the first grid (assuming API returns array)
            if (gridResponse.length > 0) {
              this.gridLoaded.emit(gridResponse[0]);
            }
          },
          error: (err) => {
            console.error('Failed to load grid', err);
          }
        });
    }
  }
}
