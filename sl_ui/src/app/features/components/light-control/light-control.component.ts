// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, OnInit } from '@angular/core';
import { MqttService } from '../../services/mqtt.service';
import { StorageService } from '../../services/storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-light-control',
  templateUrl: './light-control.component.html',
  styleUrls: ['./light-control.component.css']
})
export class LightControlComponent implements OnInit {
  pwmValue: number = 0;
  timeIntervalValue: number = 15;
  lightCode: string;

  constructor(
    private mqttService: MqttService,
    private storageService: StorageService,
    private toastr: ToastrService,
  ) {
    this.lightCode = this.storageService.getLightCode() || '';
  }

  //Lifecycle hooks
  ngOnInit(): void { }

  sendLightCommand(turnOff: boolean): void {
    var data = {
      'light_code': this.lightCode,
      'pwm': this.pwmValue,
      'time_interval': this.timeIntervalValue,
    }
    if (turnOff) data['pwm'] = 0;

    this.mqttService.publishLightCommand(data).subscribe((response) => {
      if (response.status !== null && response.status === 200) {
        if (!turnOff) this.toastr.success(response.body.success);
      }
    });
  }

}
