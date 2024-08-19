import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-light-control',
  templateUrl: './light-control.component.html',
  styleUrls: ['./light-control.component.css']
})
export class LightControlComponent implements OnInit {
  sliderValue: number = 50;
  switchValue: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
