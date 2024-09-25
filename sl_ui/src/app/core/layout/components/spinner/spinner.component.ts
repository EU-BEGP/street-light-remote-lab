import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
})
export class SpinnerComponent {
  @Input() diameter: number = 70;
  @Input() showSpinner: boolean = false;

  constructor() { }

  ngOnInit(): void { }
}
