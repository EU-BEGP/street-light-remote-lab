import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Experiment } from '../../interfaces/experiment';
import { ExperimentService } from '../../services/experiment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-experiment-dialog',
  templateUrl: './experiment-dialog.component.html',
  styleUrls: ['./experiment-dialog.component.css']
})
export class ExperimentDialogComponent implements OnInit {

  title: string = "";
  selectedExperimentId: number = 0;
  experimentForm = this.formBuilder.group({
    name: ["", Validators.required]
  })

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Experiment,
    private dialogRef: MatDialogRef<ExperimentDialogComponent>,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private experimentService: ExperimentService
  ) { }


  ngOnInit(): void {
    // Check if dialogData is provided. If it is, this indicates that an update action is being performed on an existing experiment.
    if (this.dialogData) {
      this.title = 'Update Experiment';
      const experiment = this.dialogData;
      this.selectedExperimentId = experiment.id!;
      // Populate the form with the existing values of the experiment for editing.
      this._patchFormValues(experiment);
    } else {
      // If dialogData is not provided, this indicates that a new experiment is being created.
      this.title = 'Create Experiment';
    }
  }

  /* ==========================
   HTML Interaction Functions
   ========================== */

  onSubmit(): void {
    console.log("Here")
    if (this.experimentForm.valid) {
      if (this.dialogData) {
        this.updateExperiment()
      } else {
        this.createExperiment()
      }
    } else {
      this.toastr.error('Please fill in correctly the data.');
    }
  }

  resetDialog(msg?: string) {
    if (msg) this.toastr.success(msg);
    this.dialogRef.close(msg);
    this.experimentForm.reset();
  }

  /* ==========================
   Service Interaction Functions
   ========================== */

  createExperiment(): void {
    const experiment = this.experimentForm.value as Experiment;

    this.experimentService.createExperiment(experiment).subscribe({
      next: (_) => {
        this.resetDialog('The experiment has been created successfully.');
      },
      error: (e) => {
        this.toastr.error(
          'There was an error creating the experiment.'
        );
      },
    });
  }

  updateExperiment(): void {
    const experiment = this.experimentForm.value as Experiment;

    this.experimentService.updateExperiment(experiment, this.selectedExperimentId).subscribe({
      next: (_) => {
        this.resetDialog('The experiment has been updated successfully.');
      },
      error: (e) => {
        this.toastr.error(
          'There was an error updating the experiment.'
        );
      },
    });
  }


  /* ==========================
   Internal Functions
   ========================== */

  _patchFormValues(experiment: Experiment): void {
    this.experimentForm.patchValue({
      name: experiment.name
    })
  }
}
