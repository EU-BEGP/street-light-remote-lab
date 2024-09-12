import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/message-websocket.service';
import { IntensityGridComponent } from '../../components/intensity-grid/intensity-grid.component';
import { IntensityChartComponent } from '../../components/intensity-chart/intensity-chart.component';
import { LightControlComponent } from '../../components/light-control/light-control.component';

@Component({
  selector: 'app-remote-lab',
  templateUrl: './remote-lab.component.html',
  styleUrls: ['./remote-lab.component.css']
})
export class RemoteLabComponent implements OnInit, OnDestroy {
  @ViewChild(IntensityGridComponent) gridComponent!: IntensityGridComponent;
  @ViewChild(IntensityChartComponent) chartComponent!: IntensityChartComponent;
  @ViewChild(LightControlComponent) lightControlComponent!: LightControlComponent;

  isLoading: boolean = false;
  infoGridMessage: string = "Waiting for Grid Data"
  gridDimension: number = 10;
  gridId: number = 0;

  constructor(
    private websocketService: WebsocketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.websocketService.connect();
    this.websocketService.messages$.subscribe((message) => {
      this.isLoading = false;
      if (message.is_last) this.gridId = message.grid_id;

      this.gridComponent.updateGrid(message)
      this.chartComponent.updateGraph(message)
    });
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }

  onGridRequested(): void {
    this.isLoading = true;
  }
}
