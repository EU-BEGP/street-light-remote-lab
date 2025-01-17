from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
import asyncio
import base64
import cv2
import json
import os


class RobotInformationConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            self.close()  # Reject the connection for anonymous users
        else:
            self.accept()
            async_to_sync(self.channel_layer.group_add)(
                "robot_group", self.channel_name
            )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            "robot_group", self.channel_name
        )

    def send_websocket_data(self, event):
        data = event["data"]
        self.send(text_data=data)


class LightInformationConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            self.close()  # Reject the connection for anonymous users
        else:
            self.accept()
            async_to_sync(self.channel_layer.group_add)(
                "light_group", self.channel_name
            )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            "light_group", self.channel_name
        )

    def send_websocket_data(self, event):
        data = event["data"]
        self.send(text_data=data)


RTSP_URL = os.environ.get("RTSP_URL", None)


class CameraStreamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()  # Reject the connection for anonymous users
        else:
            await self.accept()
            await self.start_stream()

    async def disconnect(self, close_code):
        pass

    async def start_stream(self):
        if RTSP_URL:
            capture = cv2.VideoCapture(RTSP_URL)

            try:
                while capture.isOpened():
                    ret, frame = capture.read()

                    if not ret:
                        break

                    # Resize and encode the frame as JPEG
                    target_size = (640, 360)
                    frame = cv2.resize(frame, target_size)
                    _, buffer = cv2.imencode(".jpg", frame)
                    frame_data = base64.b64encode(buffer).decode("utf-8")

                    # Prepare and send the message
                    message = {"frame": frame_data}
                    await self.send(text_data=json.dumps(message))
                    await self.sleep(
                        0.15
                    )  # TODO: Get rid of the sleep workaround (try to process and send the frame in another thread or similar)

            finally:
                capture.release()

    async def sleep(self, seconds):
        await asyncio.sleep(seconds)
