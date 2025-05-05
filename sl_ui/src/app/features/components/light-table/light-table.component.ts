import { Component, OnInit, OnDestroy } from '@angular/core';
import { Light } from '../../interfaces/light';
import { LightWebsocketService } from '../../services/websockets/light-websocket.service';
import { Subscription } from 'rxjs';
import config from 'src/app/config.json';

@Component({
  selector: 'app-light-table',
  templateUrl: './light-table.component.html',
  styleUrls: ['./light-table.component.css']
})
export class LightTableComponent implements OnInit, OnDestroy {
  private lightSubscription: Subscription | null = null;
  lights: Light[] = Array(5).fill({
    code: '',
    type: 'DC',
    pwm: 0,
    timeInterval: 0,
    dcVoltage: 0,
    dcCurrent: 0,
    dcPower: 0,
    dcLevel: 0,
  });
  newPwm: number = 0;
  bulkPwmValue: number = 0;

  displayedColumns: string[] = ['code', 'pwm', 'timeInterval', 'dcVoltage', 'dcCurrent', 'dcPower', 'dcLevel', 'control', 'bulkControl'];

  constructor(
    private lightWebsocketService: LightWebsocketService,
  ) {
    // Initialize light codes and set initial newPwm values
    for (let i = 0; i < 5; i++) {
      this.lights[i] = {
        ...this.lights[i],
        code: `${config.controlledEnvLightCode}-${i + 1}`,
      };
    }
  }

  ngOnInit(): void {
    this.connectLightWebsocket();
  }

  ngOnDestroy(): void {
    if (this.lightSubscription) this.lightSubscription.unsubscribe();
    this.lightWebsocketService.disconnect();
  }

  // Update newPwm value when slider changes
  onPwmChange(light: Light, event: any): void {
    this.newPwm = event.value;
  }

  // Send PWM command to the light
  sendPwmCommand(light: Light): void {
    if (this.newPwm !== null && this.newPwm >= 0 && this.newPwm <= 100) {
      const command = {
        light_code: light.code,
        command: 'SET_PWM',
        value: this.newPwm
      };
      console.log(command);
    }
  }

  // Send Bulk PWM value to all lights
  sendBulkPwmCommand(): void {
    if (this.bulkPwmValue !== null && this.bulkPwmValue >= 0 && this.bulkPwmValue <= 100) {
      console.log(`Setting all lights to ${this.bulkPwmValue}% PWM`);

      this.lights.forEach(light => {
        const command = {
          light_code: light.code,
          command: 'SET_PWM',
          value: this.bulkPwmValue
        };
        console.log('Sending bulk command:', command);
      });
    }
  }

  private connectLightWebsocket(): void {
    this.lightWebsocketService.connect();

    if (this.lightSubscription) {
      this.lightSubscription.unsubscribe();
    }

    this.lightSubscription = this.lightWebsocketService.messages$.subscribe((light_msg) => {
      const lightIndex = parseInt(light_msg.light_code.split('-').pop()) - 1;

      if (lightIndex >= 0 && lightIndex < 5) {
        this.lights[lightIndex] = {
          ...this.lights[lightIndex],
          pwm: light_msg.pwm,
          timeInterval: (Number(light_msg.time_interval) / 1000),
          dcVoltage: light_msg.dc_voltage,
          dcCurrent: light_msg.dc_current,
          dcPower: light_msg.dc_power,
          dcLevel: Math.round(light_msg.dc_level),
        };
      }
    });
  }
}
