// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { CanDeactivate } from '@angular/router';
import { ConfirmationDialogComponent } from 'src/app/core/components/confirmation-dialog/confirmation-dialog.component';
import { DialogConfigService } from '../services/dialog-config.service';
import { Injectable } from '@angular/core';
import { LaboratoryComponent } from '../pages/laboratory/laboratory.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { TimerService } from 'src/app/core/services/timer.service';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateLabGuard implements CanDeactivate<LaboratoryComponent>{

  constructor(
    private dialog: MatDialog,
    private dialogConfigService: DialogConfigService,
    private timerService: TimerService,
  ) { }

  canDeactivate(component: LaboratoryComponent): Observable<boolean> | Promise<boolean> | boolean {
    return this.timerService.countdown$.pipe(
      take(1), // Take only the latest value
      switchMap((time: number) => {
        // If there is no time, allow navigation
        if (time <= 30) {
          return of(true);
        }

        // If there are unsaved changes and time is available, show confirmation dialog
        if (component.hasUnsavedChanges) {
          const dialogConfig = this.dialogConfigService.getDialogConfig();
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            ...dialogConfig,
            data: {
              title: 'Confirm Navigation',
              message: 'You have unsaved changes. Do you really want to leave without saving?'
            }
          });

          // Return the dialog result as an observable
          return dialogRef.afterClosed().pipe(
            map(result => result && result.answer ? true : false)
          );
        }

        // If there are no unsaved changes and time is available, allow navigation
        return of(true);
      })
    );
  }
}
