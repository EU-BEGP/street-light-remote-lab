import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';

import { UserService } from 'src/app/core/auth/services/user.service';
import { ExperimentService } from '../../services/experiment.service';
import { Experiment } from '../../interfaces/experiment';
import { ExperimentDialogComponent } from '../experiment-dialog/experiment-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/core/layout/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-experiments',
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.css']
})
export class ExperimentsComponent implements OnInit {
  isLoading: boolean = false;
  userId!: number;

  // Selected experiment from table (i.e. selected row)
  selectedExperiment?: Experiment;

  tableTitle: string = "Experiments";
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: MatTableDataSource<Experiment> = new MatTableDataSource<Experiment>([]);

  private readonly baseDialogConfig: MatDialogConfig = {
    disableClose: false,
    autoFocus: false,
    backdropClass: 'dialog-backdrop',
    panelClass: 'dialog-responsive',
    enterAnimationDuration: '500ms',
    exitAnimationDuration: '500ms'
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private experimentService: ExperimentService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.userService.getUserData().subscribe((user) => {
      this.userId = user.id!;
      this.getExperiments(this.userId);
    });
  }

  /* ==========================
   HTML Interaction Functions
   ========================== */

  OpenExperimentDialog(): void {
    const dialogConfig: MatDialogConfig = {
      ...this.baseDialogConfig,
      data: this.selectedExperiment
    };

    const dialogRef = this.dialog.open(ExperimentDialogComponent, dialogConfig)
    dialogRef.afterClosed().subscribe((response) => {
      if (response) {
        this.getExperiments(this.userId);
      }
      this.selectedExperiment = undefined;
    });
  }

  actionUpdateExperiment(experiment: Experiment): void {
    this.selectedExperiment = experiment
    this.OpenExperimentDialog();
  }

  actionDeleteExperiment(experiment: Experiment): void {
    const dialogConfig: MatDialogConfig = {
      ...this.baseDialogConfig,
      data: {
        message: "Are you sure you want to delete this experiment and its related data?"
      }
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig)
    dialogRef.afterClosed().subscribe((response) => {
      if (response && response.answer) {
        this.deleteExperiment(experiment)
      }
    });

  }

  actionGoToLaboratory(experimentId: number): void {
    this.router.navigate(['/remote-lab'], {
      queryParams: {
        experiment: experimentId,
      },
    });
  }

  /* ==========================
   Service Interaction Functions
   ========================== */

  getExperiments(owner: number): void {
    this.experimentService.getExperiments(owner).subscribe((response: Experiment[]): void => {
      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Set the initial sort configuration
      this.sort.active = 'id';
      this.sort.direction = 'asc';
      this.sort.sortChange.emit({ active: 'id', direction: 'asc' });
    });
  }

  deleteExperiment(experiment: Experiment): void {
    if (experiment.id !== undefined) {
      this.experimentService.deleteExperiment(experiment.id).subscribe({
        next: (_) => {
          this.toastr.success('The experiment has been deleted successfully.');
          this.getExperiments(this.userId);
        },
        error: (e) => {
          this.toastr.error(
            'There was an error deleting the experiment'
          );
        },
      });
    }
  }
}
