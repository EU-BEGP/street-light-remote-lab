import asyncio
from django.core.management.base import BaseCommand
import paho.mqtt.client as mqtt

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

import os
import json

mqtt_host = os.environ.get("MQTT_HOST")
mqtt_port = os.environ.get("MQTT_PORT")
mqtt_topic = os.environ.get("MQTT_TOPIC")

channel_layer = get_channel_layer()


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe(mqtt_topic)
    else:
        print("Failed to connect to MQTT broker. Error code:", rc)


def on_message(client, userdata, msg):
    message_content = msg.payload.decode()
    message_object = json.loads(message_content)
    print(message_object)

    # Send data to WebSocket consumers
    loop = asyncio.get_event_loop()
    coroutine = channel_layer.group_send(
        "data_group",
        {"type": "send_websocket_data", "data": json.dumps(message_object)},
    )
    loop.run_until_complete(coroutine)


class Command(BaseCommand):
    def handle(self, *args, **options):
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        client.connect(mqtt_host, int(mqtt_port), 60)
        client.loop_forever()
