// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Experiment } from '../../interfaces/experiment';
import { ExperimentService } from '../../services/experiment.service';
import { Light } from '../../interfaces/light';
import { LightService } from '../../services/light.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-experiment-dialog',
  templateUrl: './experiment-dialog.component.html',
  styleUrls: ['./experiment-dialog.component.css']
})
export class ExperimentDialogComponent implements OnInit {

  title: string = '';
  selectedExperimentId: number = 0;

  lights?: Light[];

  experimentForm = this.formBuilder.group({
    name: ['', Validators.required],
    light: ['', Validators.required]
  })

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: Experiment,
    private dialogRef: MatDialogRef<ExperimentDialogComponent>,
    private experimentService: ExperimentService,
    private formBuilder: FormBuilder,
    private lightService: LightService,
    private toastr: ToastrService,
  ) { }


  ngOnInit(): void {
    this.lightService.getLights().subscribe((lights: Light[]): void => {
      this.lights = lights
      // Check if dialogData is provided. If it is, this indicates that an update action is being performed on an existing experiment.
      if (this.dialogData) {
        this.title = 'Update Experiment';
        const experiment = this.dialogData;
        this.selectedExperimentId = experiment.id!;
        // Populate the form with the existing values of the experiment for editing.
        this.patchFormValues(experiment);
      } else {
        // If dialogData is not provided, this indicates that a new experiment is being created.
        this.title = 'Create Experiment';
      }
    })
  }

  /*** HTML interaction functions ***/

  onSubmit(): void {
    if (this.experimentForm.valid) {
      if (this.dialogData) {
        this.updateExperiment()
      } else {
        this.createExperiment()
      }
    } else {
      this.toastr.error(
        'Please, complete correctly the information.'
      );
    }
  }

  resetDialog(msg?: string) {
    if (msg) this.toastr.success(msg);
    this.dialogRef.close(msg);
    this.experimentForm.reset();
  }

  /*** Service interaction functions ***/

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
    const experimentFormValue: any = this.experimentForm.value;
    const experiment: Experiment = {
      'name': experimentFormValue.name
    }

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

  /*** Internal functions ***/

  /* Form manipulation */

  patchFormValues(experiment: Experiment): void {
    if (experiment) {
      const light = this.lights?.find(light => light.id == experiment.light?.id);
      const lightCode = light?.code;
      const lightType = light?.type;

      this.experimentForm.patchValue({
        name: experiment.name,
        light: `${lightCode} (${lightType})`
      })
    }
  }

  // Getters
  get nameControl() {
    return this.experimentForm.get('name');
  }
}
