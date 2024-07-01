import { Component, OnInit } from '@angular/core';
import config from 'src/app/config.json';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  acronym: string = config.organizationData.acronym;
  version: string = config.version;

  constructor() { }

  ngOnInit(): void { }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
