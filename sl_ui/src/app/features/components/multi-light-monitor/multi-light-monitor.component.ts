// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from 'src/app/config.json';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Light } from '../../interfaces/light';
import { LightWebsocketService } from '../../services/websockets/light-websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multi-light-monitor',
  templateUrl: './multi-light-monitor.component.html',
  styleUrls: ['./multi-light-monitor.component.css']
})
export class MultiLightMonitorComponent implements OnInit, OnDestroy {
  private lightSubscription: Subscription | null = null;
  lightsCodes = config.outsideLightsCodes;
  lights: Light[] = Array(this.lightsCodes.length).fill(null).map((_, index) => ({
    code: this.lightsCodes[index] || '',
    type: 'DC',
    pwm: 0,
    timeInterval: 0,
    dcVoltage: 0,
    dcCurrent: 0,
    dcPower: 0,
    dcLevel: 0,
  }));
  chartLayout: any;
  chartData: any[] = [];
  timeStamps: string[] = [];
  dataHistory: { [key: string]: { powers: number[], times: string[] } } = {};
  private readonly MAX_DATA_POINTS = 20;

  constructor(
    private lightWebsocketService: LightWebsocketService,
  ) { }

  ngOnInit(): void {
    this.initializeChart();
    this.connectLightWebsocket();
  }

  ngOnDestroy(): void {
    if (this.lightSubscription) this.lightSubscription.unsubscribe();
    this.lightWebsocketService.disconnect();
  }

  private initializeChart(): void {
    this.chartLayout = {
      title: 'Lights Power Over Time',
      xaxis: {
        title: 'Time',
        showgrid: true,
        zeroline: true
      },
      yaxis: {
        title: 'DC Power (W)',
        range: [0, 100],
        showgrid: true,
        zeroline: true
      },
      margin: { t: 40, r: 40, b: 40, l: 40 },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.2
      },
      hovermode: 'closest',
      plot_bgcolor: '#f8f9fa',
      paper_bgcolor: '#ffffff',
      font: {
        family: 'Roboto, sans-serif',
        color: '#2c3e50'
      }
    };

    // Initialize data structure for each light
    this.lightsCodes.forEach(code => {
      this.dataHistory[code] = { powers: [], times: [] };
    });
  }

  private connectLightWebsocket(): void {
    this.lightWebsocketService.connect();

    if (this.lightSubscription) {
      this.lightSubscription.unsubscribe();
    }

    this.lightSubscription = this.lightWebsocketService.messages$.subscribe((lightMsg) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();

      // Update the specific light's data
      const lightIndex = this.lights.findIndex(light => light.code === lightMsg.light_code);
      if (lightIndex !== -1) {
        // Update historical data
        if (!this.dataHistory[lightMsg.light_code]) {
          this.dataHistory[lightMsg.light_code] = { powers: [], times: [] };
        }

        this.dataHistory[lightMsg.light_code].powers.push(Math.round(lightMsg.dc_power));
        this.dataHistory[lightMsg.light_code].times.push(timeString);

        // Keep only the neccesary data points
        if (this.dataHistory[lightMsg.light_code].powers.length > this.MAX_DATA_POINTS) {
          this.dataHistory[lightMsg.light_code].powers.shift();
          this.dataHistory[lightMsg.light_code].times.shift();
        }

        // Update the specific light in the array
        this.lights[lightIndex] = {
          ...this.lights[lightIndex],
          pwm: lightMsg.pwm,
          timeInterval: (Number(lightMsg.time_interval) / 1000),
          dcVoltage: lightMsg.dc_voltage,
          dcCurrent: lightMsg.dc_current,
          dcPower: lightMsg.dc_power,
          dcLevel: Math.round(lightMsg.dc_level)
        };

        // Force update the chart data
        this.updateChartData();
      }
    });
  }

  private updateChartData(): void {
    // Create new array references for Plotly to detect changes
    this.chartData = this.lightsCodes.map(code => ({
      x: this.dataHistory[code]?.times ? [...this.dataHistory[code].times] : [],
      y: this.dataHistory[code]?.powers ? [...this.dataHistory[code].powers] : [],
      name: code,
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        shape: 'spline',
        width: 2,
        smoothing: 1.3
      },
      marker: {
        size: 8,
        line: {
          width: 1,
          color: '#ffffff'
        }
      },
      connectgaps: true
    }));
  }
}
