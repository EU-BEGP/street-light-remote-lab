// Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
// MIT License - See LICENSE file in the root directory
// Boris Pedraza, Alex Villazon, Omar Ormachea

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-light-monitoring-activity',
  templateUrl: './light-monitoring-activity.component.html',
  styleUrls: ['./light-monitoring-activity.component.css']
})
export class LightMonitoringActivityComponent implements OnInit {
  lamps = [1, 2, 3];

  constructor() { }

  ngOnInit(): void {
  }

}
