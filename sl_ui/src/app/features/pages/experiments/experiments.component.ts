import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationDialogComponent } from 'src/app/core/components/confirmation-dialog/confirmation-dialog.component';
import { DialogConfigService } from '../../services/dialog-config.service';
import { Experiment } from '../../interfaces/experiment';
import { ExperimentDialogComponent } from '../../components/experiment-dialog/experiment-dialog.component';
import { ExperimentService } from '../../services/experiment.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Light } from '../../interfaces/light';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-experiments',
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.css']
})
export class ExperimentsComponent implements OnInit {
  isLoading: boolean = false;

  // Selected experiment from table (i.e. selected row)
  selectedExperiment?: Experiment;

  tableTitle: string = 'Experiments';
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: MatTableDataSource<Experiment> = new MatTableDataSource<Experiment>([]);

  baseDialogConfig: MatDialogConfig<any> = this.dialogConfigService.getDialogConfig();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private dialogConfigService: DialogConfigService,
    private experimentService: ExperimentService,
    private router: Router,
    private storageService: StorageService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.getExperiments();
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
        this.getExperiments();
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
        title: 'DELETE EXPERIMENT',
        message: 'Are you sure you want to delete this experiment and its related data?'
      }
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, dialogConfig)
    dialogRef.afterClosed().subscribe((response) => {
      if (response && response.answer) {
        this.deleteExperiment(experiment)
      }
    });

  }

  actionGoToLaboratory(experiment: Experiment): void {
    if (experiment) {
      if (experiment.id) localStorage.setItem('experiment_id', experiment.id.toString());
      if (experiment.light) if (experiment.light.code) this.storageService.setLightCode(experiment.light.code.toString());
      if (experiment.light) if (experiment.light.type) this.storageService.setLightType(experiment.light.type.toString());
      this.router.navigate(['/laboratory']);
    }
  }

  /* ==========================
   Service Interaction Functions
   ========================== */

  getExperiments(): void {
    this.experimentService.getExperiments().subscribe((response: Experiment[]): void => {
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
          this.getExperiments();
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
