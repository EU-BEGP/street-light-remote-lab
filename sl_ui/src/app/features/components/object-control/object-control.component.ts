// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import config from 'src/app/config.json';
import { Component, EventEmitter, Output } from '@angular/core';
import { MqttService } from '../../services/mqtt.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-object-control',
  templateUrl: './object-control.component.html',
  styleUrls: ['./object-control.component.css']
})
export class ObjectControlComponent {
  pwmValue: number = 0;
  timeIntervalValue: number = 15;
  lightCode: string = config.controlledEnvLightCode;

  @Output() robotCommand = new EventEmitter<void>();

  constructor(
    private mqttService: MqttService,
    private toastr: ToastrService,
  ) { }

  sendLightCommand(turnOff: boolean): void {
    const data = {
      'light_code': this.lightCode,
      'pwm': turnOff ? 0 : this.pwmValue,
      'time_interval': this.timeIntervalValue,
    };

    this.mqttService.publishLightCommand(data).subscribe((response) => {
      if (response.status !== null && response.status === 200 && !turnOff) {
        this.toastr.success(response.body.success);
      }
    });
  }

  sendRobotCommand(): void {
    this.robotCommand.emit();
  }
}
