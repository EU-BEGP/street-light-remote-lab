from channels.layers import get_channel_layer
from django.core.management.base import BaseCommand
from time import sleep
import asyncio
import django
import json
import os
import paho.mqtt.client as mqtt

# Ensure Django is set up
django.setup()

mqtt_host = os.environ.get("MQTT_HOST", None)
mqtt_port = os.environ.get("MQTT_PORT", 1883)
mqtt_user = os.environ.get("MQTT_USER", None)
mqtt_pwd = os.environ.get("MQTT_PWD", None)
mqtt_topic = os.environ.get("MQTT_SUB_LIGHT_TOPIC", None)

channel_layer = get_channel_layer()

VOLTAGE_CONSTANT = 0.00025
CURRENT_CONSTANT = 0.0025
OFFSET = 16384


def stream_message_over_websocket(message):
    # Send message data to WebSocket consumer
    loop = asyncio.get_event_loop()
    coroutine = channel_layer.group_send(
        "light_group",
        {"type": "send_websocket_data", "data": json.dumps(message)},
    )
    loop.run_until_complete(coroutine)


def process_incoming_message(mqtt_message):
    voltage = mqtt_message["voltage"]
    current = mqtt_message["current"]

    voltage = round(voltage * VOLTAGE_CONSTANT, 2)
    current = round(CURRENT_CONSTANT * (current - OFFSET), 2)
    power = round(voltage * current, 2)

    message = {"voltage": voltage, "current": current, "power": power}
    stream_message_over_websocket(message)


# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[Light MQTT Listener]: Connected to MQTT broker")
        client.subscribe(mqtt_topic)
    else:
        print(
            "[Light MQTT Listener]: Failed to connect to MQTT broker. Error code:", rc
        )


def on_disconnect(client, userdata, rc):
    print("Disconnected from MQTT broker. Return code:", rc)

    if rc != 0:  # Non-zero return code indicates abnormal disconnection
        while True:
            try:
                client.reconnect()
                print("[Light MQTT Listener]: Reconnected to MQTT broker.")
                break
            except Exception as e:
                print(
                    f"[Light MQTT Listener]: Reconnect failed: {e}. Retrying in 5 seconds..."
                )
                sleep(5)


def on_message(client, userdata, msg):
    try:
        # Get and parse MQTT message
        mqtt_message = json.loads(msg.payload.decode())
        process_incoming_message(mqtt_message)

    except json.JSONDecodeError:
        print(
            f"[Light MQTT Listener]: Failed to decode JSON from message: {msg.payload}"
        )
    except Exception as e:
        print(f"[Light MQTT Listener]: An error occurred: {e}")


# Command
class Command(BaseCommand):
    def handle(self, *args, **options):
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_disconnect = on_disconnect
        client.on_message = on_message
        client.username_pw_set(mqtt_user, mqtt_pwd)

        while True:
            try:
                client.connect(mqtt_host, int(mqtt_port), 60)
                client.loop_forever()  # This will block and handle messages
                break  # Exit the loop if connection is successful
            except Exception as e:
                print(f"Connection failed: {e}. Retrying...")
                sleep(5)
