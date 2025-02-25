from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class RobotInformationConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        async_to_sync(self.channel_layer.group_add)("robot_group", self.channel_name)

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            "robot_group", self.channel_name
        )

    def send_websocket_data(self, event):
        data = event["data"]
        self.send(text_data=data)


class LightInformationConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        async_to_sync(self.channel_layer.group_add)("light_group", self.channel_name)

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            "light_group", self.channel_name
        )

    def send_websocket_data(self, event):
        data = event["data"]
        self.send(text_data=data)
