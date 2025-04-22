// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from 'src/app/config.json';
import { Component, OnInit } from '@angular/core';
import { Grid } from '../../interfaces/grid';

@Component({
  selector: 'app-data-analysis-activity',
  templateUrl: './data-analysis-activity.component.html',
  styleUrls: ['./data-analysis-activity.component.css']
})
export class DataAnalysisActivityComponent implements OnInit {
  gridDimension: number = config.gridDimension;
  currentGrid: Grid | null = null;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  handleGridLoaded(grid: any) {
    this.currentGrid = grid;
  }
}
