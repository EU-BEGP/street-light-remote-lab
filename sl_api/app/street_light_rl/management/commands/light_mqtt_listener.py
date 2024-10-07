from django.core.management.base import BaseCommand
from utils.mqtt_listener import MQTTListener
from utils.tools import stream_message_over_websocket
import os

MQTT_LISTENER_NAME = "LIGHT"

# CONVERSION CONSTANTS
VOLTAGE_CONSTANT = 0.00025
CURRENT_CONSTANT = 0.0025
OFFSET = 16384

# MQTT CONSTANTS
MQTT_HOST = os.environ.get("MQTT_HOST", None)
MQTT_PORT = os.environ.get("MQTT_PORT", 1883)
MQTT_USER = os.environ.get("MQTT_USER", None)
MQTT_PWD = os.environ.get("MQTT_PWD", None)
MQTT_TOPIC = os.environ.get("MQTT_SUB_LIGHT_TOPIC", None)

# CHANNELS CONSTANT
GROUP_NAME = "light_group"


def process_message(mqtt_message):
    voltage = mqtt_message["voltage"]
    current = mqtt_message["current"]

    voltage = round(voltage * VOLTAGE_CONSTANT, 2)
    current = round(CURRENT_CONSTANT * (current - OFFSET), 2)
    power = round(voltage * current, 2)

    message = {"voltage": voltage, "current": current, "power": power}
    stream_message_over_websocket(message, GROUP_NAME)


class Command(BaseCommand):
    def handle(self, *args, **options):
        mqtt_listener = MQTTListener(
            MQTT_LISTENER_NAME,
            MQTT_HOST,
            MQTT_PORT,
            MQTT_USER,
            MQTT_PWD,
            MQTT_TOPIC,
            process_message,
        )

        mqtt_listener.start()
