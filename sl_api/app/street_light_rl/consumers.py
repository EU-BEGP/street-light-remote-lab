from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json


class MessageConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        async_to_sync(self.channel_layer.group_add)("data_group", self.channel_name)

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)("data_group", self.channel_name)

    def receive(self, message):
        pass

    def send_websocket_data(self, event):
        # Handler method for "send_websocket_data" messages
        data = event["data"]
        self.send(text_data=data)
