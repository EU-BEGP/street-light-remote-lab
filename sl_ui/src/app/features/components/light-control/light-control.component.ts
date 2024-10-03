import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { LightService } from 'src/app/features/services/light.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-light-control',
  templateUrl: './light-control.component.html',
  styleUrls: ['./light-control.component.css']
})
export class LightControlComponent implements OnInit {
  @Output() gridRequested: EventEmitter<void> = new EventEmitter<void>();
  sliderValue: number = 50;
  switchValue: boolean = false;

  constructor(private lightService: LightService, private toastr: ToastrService) { }


  ngOnInit(): void {
  }

  requestGrid(): void {
    this.lightService.requestGrid().subscribe((response) => {
      if (response.success) {
        this.toastr.success(response.success);
        this.gridRequested.emit();
      }
    });
  }

  setLightProperties(): void {
    var message = {
      // 'state': this.switchValue,
      'pwm': this.sliderValue
    }

    this.lightService.setLightProperties(message).subscribe((response) => {
      if (response.status !== null && response.status === 200) {
        this.toastr.success(response.body.success);
      }
    });
  }
}
