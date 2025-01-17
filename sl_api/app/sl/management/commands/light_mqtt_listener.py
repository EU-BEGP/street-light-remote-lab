from django.core.management.base import BaseCommand
from sl.models import Light
from utils.mqtt_listener import MQTTListener
from utils.tools import stream_message_over_websocket
import os

MQTT_LISTENER_NAME = "LIGHT"

# MQTT CONSTANTS
MQTT_HOST = os.environ.get("MQTT_HOST", None)
MQTT_PORT = os.environ.get("MQTT_PORT", 1883)
MQTT_USER = os.environ.get("MQTT_USER", None)
MQTT_PWD = os.environ.get("MQTT_PWD", None)
MQTT_TOPIC = os.environ.get("MQTT_SUB_LIGHT_TOPIC", None)

# CHANNELS CONSTANT
GROUP_NAME = "light_group"


def process_message(mqtt_message):
    # Capture light properties
    code = mqtt_message["code"]
    type = mqtt_message["type"]
    pwm = mqtt_message["pwm"]
    voltage = mqtt_message["voltage"]
    current = mqtt_message["current"]
    time_interval = mqtt_message["time_interval"]

    light_object = {
        "code": code,
        "type": type,
        "pwm": pwm,
        "voltage": voltage,
        "current": current,
        "time_interval": time_interval,
    }

    if type == "AC":
        # Capture AC only data and store it in the light object
        light_object["power"] = mqtt_message["power"]
        light_object["energy"] = mqtt_message["energy"]
        light_object["frequency"] = mqtt_message["frequency"]
        light_object["factor"] = mqtt_message["factor"]

    elif type == "DC":
        # Capture DC only data and store it in the light object
        light_object["power_consumption"] = mqtt_message["power_consumption"]
        light_object["power_charge"] = mqtt_message["power_charge"]
        light_object["energy_consumption"] = mqtt_message["energy_consumption"]
        light_object["energy_charge"] = mqtt_message["energy_charge"]

    _, _ = Light.objects.update_or_create(
        code=code,
        defaults=light_object,
    )

    stream_message_over_websocket(light_object, GROUP_NAME)


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
