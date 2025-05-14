// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from 'src/app/config.json';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Light } from '../../interfaces/light';
import { LightWebsocketService } from '../../services/websockets/light-websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-light-information',
  templateUrl: './light-information.component.html',
  styleUrls: ['./light-information.component.css']
})
export class LightInformationComponent implements OnInit, OnDestroy {
  private lightSubscription: Subscription | null = null;
  light: Light = {
    code: config.controlledEnvLightCode,
    type: config.controlledEnvLightType,
  };

  constructor(
    private lightWebsocketService: LightWebsocketService,
  ) { }

  //Lifecycle hooks
  ngOnInit(): void {
    this.connectLightWebsocket();
  }

  ngOnDestroy(): void {
    if (this.lightSubscription) this.lightSubscription.unsubscribe();
    this.lightWebsocketService.disconnect();
  }

  // Light websocket connection
  private connectLightWebsocket(): void {
    this.lightWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.lightSubscription) {
      this.lightSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.lightSubscription = this.lightWebsocketService.messages$.subscribe((lightMsg) => {
      if (lightMsg.light_code == this.light.code) {
        this.light.pwm = lightMsg.pwm;
        this.light.timeInterval = (Number(lightMsg.time_interval) / 1000);

        if (lightMsg.type == this.light.type) {
          if (this.light.type == 'DC') {
            this.light = {
              ...this.light,
              dcVoltage: lightMsg.dc_voltage,
              dcCurrent: lightMsg.dc_current,
              dcPower: lightMsg.dc_power,
              dcEnergyConsumption: lightMsg.dc_energy_consumption,
              dcEnergyCharge: lightMsg.dc_energy_charge,
              dcLevel: Math.round(lightMsg.dc_level),
            };
          }
          if (this.light.type == 'AC') {
            this.light = {
              ...this.light,
              acVoltage: lightMsg.ac_voltage,
              acCurrent: lightMsg.ac_current,
              acPower: lightMsg.ac_power,
              acEnergy: lightMsg.ac_energy,
              acFrequency: lightMsg.ac_frequency,
              acFactor: lightMsg.ac_factor,
            };
          }
          if (this.light.type == 'AC_INV') {
            this.light = {
              ...this.light,
              dcVoltage: lightMsg.dc_voltage,
              dcCurrent: lightMsg.dc_current,
              dcPower: lightMsg.dc_power,
              dcEnergyConsumption: lightMsg.dc_energy_consumption,
              dcEnergyCharge: lightMsg.dc_energy_charge,
              dcLevel: Math.round(lightMsg.dc_level),
              acVoltage: lightMsg.ac_voltage,
              acCurrent: lightMsg.ac_current,
              acPower: lightMsg.ac_power,
              acEnergy: lightMsg.ac_energy,
              acFrequency: lightMsg.ac_frequency,
              acFactor: lightMsg.ac_factor,
            };
          }
        }
      }
    });
  }
}
