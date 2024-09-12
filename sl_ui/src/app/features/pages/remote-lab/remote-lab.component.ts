import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../../services/message-websocket.service';
import { IntensityGridComponent } from '../../components/intensity-grid/intensity-grid.component';
import { IntensityChartComponent } from '../../components/intensity-chart/intensity-chart.component';
import { LightControlComponent } from '../../components/light-control/light-control.component';

import { ExperimentService } from '../../services/experiment.service';
import { Experiment } from '../../interfaces/experiment';

@Component({
  selector: 'app-remote-lab',
  templateUrl: './remote-lab.component.html',
  styleUrls: ['./remote-lab.component.css']
})
export class RemoteLabComponent implements OnInit, OnDestroy {
  @ViewChild(IntensityGridComponent) gridComponent!: IntensityGridComponent;
  @ViewChild(IntensityChartComponent) chartComponent!: IntensityChartComponent;
  @ViewChild(LightControlComponent) lightControlComponent!: LightControlComponent;

  experimentId: number = 0;
  hasExperiment: boolean = false;
  isLoading: boolean = false;
  infoGridMessage: string = "Waiting for Grid Data"
  gridDimension: number = 10;
  gridId: number = 0;

  constructor(
    private websocketService: WebsocketService,
    private router: Router,
    private route: ActivatedRoute,
    private experimentService: ExperimentService
  ) { }

  ngOnInit(): void {
    // Get experiment grid information
    this.route.queryParams.subscribe((params): void => {
      this.experimentId = params["experiment"];
      this.experimentService.getExperimentGrid(this.experimentId).subscribe(
        (response: any): void => {
          // If the experiment is not assigned to any grid
          if (response.length === 0) {
            this.connectToWebSocket(); // Connect to WebSocket only if not assigned
          } else {
            this.hasExperiment = true;
            this.gridComponent.setGrid(response[0].grid_messages)
            this.chartComponent.setGraph(response[0].grid_messages)
          }
        },
        (error: any): void => {
          console.error(error);
        }
      );
    });
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  onGridRequested(): void {
    this.isLoading = true;
  }

  private connectToWebSocket(): void {
    this.websocketService.connect();

    // Connect to websocekts and receive messages
    this.websocketService.messages$.subscribe((message) => {
      this.isLoading = false;
      if (message.is_last) this.gridId = message.grid_id;

      this.gridComponent.refreshGrid(message);
      this.chartComponent.refreshGraph(message);
    });
  }
}
