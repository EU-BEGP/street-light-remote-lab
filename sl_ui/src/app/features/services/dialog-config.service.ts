// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogConfigService {
  private readonly baseDialogConfig: MatDialogConfig = {
    disableClose: false,
    autoFocus: false,
    backdropClass: 'dialog-backdrop',
    panelClass: 'dialog-responsive',
    enterAnimationDuration: '500ms',
    exitAnimationDuration: '500ms'
  };

  getDialogConfig(): MatDialogConfig {
    return { ...this.baseDialogConfig };
  }
}
