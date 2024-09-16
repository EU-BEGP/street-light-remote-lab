import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../../services/message-websocket.service';
import { IntensityGridComponent } from '../../components/intensity-grid/intensity-grid.component';
import { IntensityChartComponent } from '../../components/intensity-chart/intensity-chart.component';
import { LightControlComponent } from '../../components/light-control/light-control.component';
import { ExperimentService } from '../../services/experiment.service';
import { GridService } from '../../services/grid.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-remote-lab',
  templateUrl: './remote-lab.component.html',
  styleUrls: ['./remote-lab.component.css']
})
export class RemoteLabComponent implements OnInit, OnDestroy {
  @ViewChild(IntensityGridComponent) gridComponent!: IntensityGridComponent;
  @ViewChild(IntensityChartComponent) chartComponent!: IntensityChartComponent;
  @ViewChild(LightControlComponent) lightControlComponent!: LightControlComponent;

  hasUnsavedChanges: boolean = false;
  displayControl: boolean = true;
  isLoading: boolean = false;

  experimentId: number = 0;
  gridId: number = 0;

  gridDimension: number = 10;
  infoGridMessage: string = 'Waiting for Grid Data'

  constructor(
    private websocketService: WebsocketService,
    private router: Router,
    private route: ActivatedRoute,
    private experimentService: ExperimentService,
    private gridService: GridService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    // Get experiment grid information
    this.route.queryParams.subscribe((params): void => {
      this.experimentId = params['experiment'];
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
    });
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  onGridRequested(): void {
    this.isLoading = true;
    this.connectToWebSocket();
  }

  private connectToWebSocket(): void {
    this.websocketService.connect();

    // Connect to websocekts and receive messages
    this.websocketService.messages$.subscribe((message) => {
      this.hasUnsavedChanges = true;
      this.isLoading = false;
      if (message.is_last) this.gridId = message.grid_id;

      this.gridComponent.refreshGrid(message);
      this.chartComponent.refreshGraph(message);
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
