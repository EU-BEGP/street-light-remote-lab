// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-grid-selector',
  templateUrl: './grid-selector.component.html',
  styleUrls: ['./grid-selector.component.css']
})
export class GridSelectorComponent {
  @Input() capturedGrids: any[] = [];
  @Input() selectedGridIndex: number = 0;
  @Output() selectedGridIndexChange = new EventEmitter<number>();

  onSelectionChange(index: number): void {
    this.selectedGridIndex = index;
    this.selectedGridIndexChange.emit(index);
  }
}
