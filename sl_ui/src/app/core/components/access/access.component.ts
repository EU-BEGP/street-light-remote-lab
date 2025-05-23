// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.css'],
})
export class AccessComponent {
  title: string = '';

  constructor(
    private dialogRef: MatDialogRef<AccessComponent>
  ) { }

  closeDialog(data?: any): any {
    this.dialogRef.close(data);
  }
}
