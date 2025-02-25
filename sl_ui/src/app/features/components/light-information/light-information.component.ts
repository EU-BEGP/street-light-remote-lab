import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Light } from '../../interfaces/light';
import { LightWebsocketService } from '../../services/websockets/light-websocket.service';
import { StorageService } from '../../services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-light-information',
  templateUrl: './light-information.component.html',
  styleUrls: ['./light-information.component.css']
})
export class LightInformationComponent implements OnInit, OnDestroy {
  private lightSubscription: Subscription | null = null;
  light: Light;

  constructor(
    private lightWebsocketService: LightWebsocketService,
    private storageService: StorageService,
  ) {
    this.light = {
      code: this.storageService.getLightCode() || '',
      type: this.storageService.getLightType() || '',
    }
  }

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
    this.lightSubscription = this.lightWebsocketService.messages$.subscribe((light_msg) => {
      if (light_msg.light_code == this.light.code) {
        this.light.pwm = light_msg.pwm;
        this.light.timeInterval = (Number(light_msg.time_interval) / 1000);

        if (light_msg.type == this.light.type) {
          if (this.light.type == 'DC') {
            this.light = {
              ...this.light,
              dcVoltage: light_msg.dc_voltage,
              dcCurrent: light_msg.dc_current,
              dcPower: light_msg.dc_power,
              dcEnergyConsumption: light_msg.dc_energy_consumption,
              dcEnergyCharge: light_msg.dc_energy_charge,
              dcLevel: Math.round(light_msg.dc_level),
            };
          }
          if (this.light.type == 'AC') {
            this.light = {
              ...this.light,
              acVoltage: light_msg.ac_voltage,
              acCurrent: light_msg.ac_current,
              acPower: light_msg.ac_power,
              acEnergy: light_msg.ac_energy,
              acFrequency: light_msg.ac_frequency,
              acFactor: light_msg.ac_factor,
            };
          }
          if (this.light.type == 'AC_INV') {
            this.light = {
              ...this.light,
              dcVoltage: light_msg.dc_voltage,
              dcCurrent: light_msg.dc_current,
              dcPower: light_msg.dc_power,
              dcEnergyConsumption: light_msg.dc_energy_consumption,
              dcEnergyCharge: light_msg.dc_energy_charge,
              dcLevel: Math.round(light_msg.dc_level),
              acVoltage: light_msg.ac_voltage,
              acCurrent: light_msg.ac_current,
              acPower: light_msg.ac_power,
              acEnergy: light_msg.ac_energy,
              acFrequency: light_msg.ac_frequency,
              acFactor: light_msg.ac_factor,
            };
          }
        }
      }
    });
  }
}
