import config from 'src/app/config.json';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Light } from '../../interfaces/light';
import { LightWebsocketService } from '../../services/websockets/light-websocket.service';
import { MqttService } from '../../services/mqtt.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-light-table',
  templateUrl: './light-table.component.html',
  styleUrls: ['./light-table.component.css']
})
export class LightTableComponent implements OnInit, OnDestroy {
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
  newPwm: number = 0;
  bulkPwmValue: number = 0;

  displayedColumns: string[] = ['code', 'pwm', 'timeInterval', 'dcVoltage', 'dcCurrent', 'dcPower', 'dcLevel', 'control', 'bulkControl'];

  constructor(
    private lightWebsocketService: LightWebsocketService,
    private mqttService: MqttService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.connectLightWebsocket();
  }

  ngOnDestroy(): void {
    if (this.lightSubscription) this.lightSubscription.unsubscribe();
    this.lightWebsocketService.disconnect();
  }

  private connectLightWebsocket(): void {
    this.lightWebsocketService.connect();

    if (this.lightSubscription) {
      this.lightSubscription.unsubscribe();
    }
    this.lightSubscription = this.lightWebsocketService.messages$.subscribe((lightMsg) => {
      this.lights = this.lights.map(light => {
        if (light.code === lightMsg.light_code) {
          if (lightMsg.type == light.type) {
            return {
              ...light,
              pwm: lightMsg.pwm,
              timeInterval: (Number(lightMsg.time_interval) / 1000),
              dcVoltage: lightMsg.dc_voltage,
              dcCurrent: lightMsg.dc_current,
              dcPower: lightMsg.dc_power,
              dcLevel: Math.round(lightMsg.dc_level)
            };
          }
        }
        return light;
      });
    });
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
        pwm: this.newPwm,
        time_interval: 60
      };

      this.mqttService.publishLightCommand(command).subscribe((response) => {
        if (response.status !== null && response.status === 200) {
          this.toastr.success(response.body.success);
        }
      });
    }
  }

  // Send Bulk PWM value to all lights
  sendBulkPwmCommand(): void {
    if (this.bulkPwmValue !== null && this.bulkPwmValue >= 0 && this.bulkPwmValue <= 100) {
      // Collect all MQTT observables
      const mqttCommands = this.lights.map(light => {
        const command = {
          light_code: light.code,
          pwm: this.bulkPwmValue,
          time_interval: 60,
        };
        return this.mqttService.publishLightCommand(command);
      });

      // Wait for all commands to complete
      forkJoin(mqttCommands).subscribe({
        next: (responses: { status: number }[]) => {
          // Check if ALL commands succeeded (status 200)
          const allSuccess = responses.every(res => res.status === 200);
          if (allSuccess) {
            this.toastr.success('Commands sent succesfully');
          } else {
            this.toastr.error('Failed to send some publish commands');
          }
        },
        error: () => {
          this.toastr.error('Failed to handle MQTT command.');
        },
      });
    }
  }
}
