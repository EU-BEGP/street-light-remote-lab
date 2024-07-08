import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/message-websocket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  data: any[] = [];

  constructor(
    private websocketService: WebsocketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.websocketService.connect()
    this.websocketService.messages$.subscribe((message) => {
      this.data.push(message);
    });
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }
}
