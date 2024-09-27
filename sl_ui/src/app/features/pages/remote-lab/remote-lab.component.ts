import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ExperimentService } from '../../services/experiment.service';
import { ExperimentStateService } from '../../services/experiment-state.service';
import { GridService } from '../../services/grid.service';
import { IntensityChartComponent } from '../../components/intensity-chart/intensity-chart.component';
import { IntensityGridComponent } from '../../components/intensity-grid/intensity-grid.component';
import { LightControlComponent } from '../../components/light-control/light-control.component';
import { ToastrService } from 'ngx-toastr';
import { WebsocketService } from '../../services/message-websocket.service';

@Component({
  selector: 'app-remote-lab',
  templateUrl: './remote-lab.component.html',
  styleUrls: ['./remote-lab.component.css']
})
export class RemoteLabComponent implements OnInit, OnDestroy {
  @ViewChild(IntensityGridComponent) gridComponent!: IntensityGridComponent;
  @ViewChild(IntensityChartComponent) chartComponent!: IntensityChartComponent;
  @ViewChild(LightControlComponent) lightControlComponent!: LightControlComponent;

  displayControl: boolean = true;
  experimentId: number | null = null;
  gridDimension: number = 10;
  gridId: number = 0;
  hasUnsavedChanges: boolean = false;
  isWsLoading: boolean = false;

  constructor(
    private experimentService: ExperimentService,
    private experimentStateService: ExperimentStateService,
    private gridService: GridService,
    private toastr: ToastrService,
    private websocketService: WebsocketService,
  ) { }

  ngOnInit(): void {
    this.experimentId = this.experimentStateService.getExperimentId();
    if (this.experimentId) {
      this.experimentService.getExperimentGrid(this.experimentId).subscribe(
        (response: any): void => {
          // If the experiment is assigned to any grid
          if (response.length) {
            this.displayControl = false;
            this.gridComponent.setGrid(response[0].grid_messages)
            this.chartComponent.setGraph(response[0].grid_messages)
          }
        },
        (error: any): void => {
          this.displayControl = false;
          this.toastr.error(error.error.error);
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  onGridRequested(): void {
    this.isWsLoading = true;
    this.connectToWebSocket();
  }

  private connectToWebSocket(): void {
    this.websocketService.connect();

    // Connect to websocekts and receive messages
    this.websocketService.messages$.subscribe((message) => {
      if (message) {
        this.isWsLoading = false
        this.hasUnsavedChanges = true;
        if (message.is_last) this.gridId = message.grid_id;

        this.gridComponent.refreshGrid(message);
        this.chartComponent.refreshGraph(message);
      }
    });
  }

  saveGridToExperiment(): void {
    if (this.gridId !== 0) {
      this.gridService.updateGrid(
        { experiment: this.experimentId },
        this.gridId
      ).subscribe({
        next: (response: any): void => {
          this.hasUnsavedChanges = false;
          this.displayControl = false;
          this.toastr.success(
            'Grid bound to experiment'
          );
        },
        error: (e: any): void => {
          this.toastr.error(
            'There was an error binding the grid to the experiment'
          );
        },
      });
    }
  }
}
