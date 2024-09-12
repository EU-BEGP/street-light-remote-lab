import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RemoteLabComponent } from '../../pages/remote-lab/remote-lab.component';
import { MatDialog, } from '@angular/material/dialog';
import { DialogConfigService } from '../dialog-config.service';
import { ConfirmationDialogComponent } from 'src/app/core/layout/components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateLabGuard implements CanDeactivate<RemoteLabComponent>{
  constructor(
    private dialog: MatDialog,
    private dialogConfigService: DialogConfigService
  ) { }

  canDeactivate(
    component: RemoteLabComponent
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (component.hasUnsavedChanges) {
      const dialogConfig = this.dialogConfigService.getDialogConfig();
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        ...dialogConfig,
        data: {
          title: 'Confirm Navigation',
          message: 'You have unsaved changes. Do you really want to leave without saving?'
        }
      });

      // Handle the dialog response
      return dialogRef.afterClosed().toPromise().then(result => {
        // Check if the result contains the 'answer' property and if it's true
        if (result && result.answer) {
          return true;  // Allow navigation
        } else {
          return false; // Prevent navigation
        }
      });
    }
    // No unsaved changes, allow navigation
    return true;
  }
}
