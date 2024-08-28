import { Component, OnInit } from '@angular/core';
import { LightService } from 'src/app/features/services/light.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-light-control',
  templateUrl: './light-control.component.html',
  styleUrls: ['./light-control.component.css']
})
export class LightControlComponent implements OnInit {
  sliderValue: number = 50;
  switchValue: boolean = false;

  constructor(private lightService: LightService, private toastr: ToastrService) { }


  ngOnInit(): void {
  }

  requestGrid(): void {
    this.lightService.requestGrid().subscribe((response) => {
      if (response.success) {
        this.toastr.success(response.success);
      }
    });
  }

  setLightProperties(): void {
    var message = {
      "state": this.switchValue,
      "dim": this.sliderValue
    }

    this.lightService.setLightProperties(message).subscribe((response) => {
      if (response.status !== null && response.status === 200) {
        this.toastr.success(response.body.success);
      }
    });
  }
}
