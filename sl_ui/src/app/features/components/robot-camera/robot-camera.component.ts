import { CameraWebsocketService } from '../../services/websockets/camera-websocket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-robot-camera',
  templateUrl: './robot-camera.component.html',
  styleUrls: ['./robot-camera.component.css']
})
export class RobotCameraComponent implements OnInit, OnDestroy {
  private cameraSubscription: Subscription | null = null;
  frame: string = './assets/robot_01.jpeg';

  constructor(
    private cameraWebsocketService: CameraWebsocketService,
  ) { }

  ngOnInit(): void {
    this.connectCameraWebsocket();
  }

  ngOnDestroy(): void {
    if (this.cameraSubscription) this.cameraSubscription.unsubscribe();
    this.cameraWebsocketService.disconnect();
  }

  private connectCameraWebsocket(): void {
    this.cameraWebsocketService.connect();

    // Unsubscribe from the previous subscription, if it exists
    if (this.cameraSubscription) {
      this.cameraSubscription.unsubscribe();
    }

    // Subscribe to WebSocket messages
    this.cameraSubscription = this.cameraWebsocketService.messages$.subscribe((camera_msg) => {
      if (camera_msg) {
        this.frame = `data:image/jpeg;base64,${camera_msg.frame}`;
      }
    });
  }

}
