from django.core.management.base import BaseCommand
from utils.mqtt_listener import MQTTListener
from utils.tools import stream_message_over_websocket
from street_light_rl.models import Light
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
    # Capture light properties
    light_code = mqtt_message["light_code"]
    type = mqtt_message["type"]
    pwm = mqtt_message["pwm"]
    battery_voltage = mqtt_message["voltage"]
    battery_current = mqtt_message["current"]
    time_interval = mqtt_message["time_interval"]

    # Apply formulas
    battery_voltage = round(battery_voltage * VOLTAGE_CONSTANT, 2)
    battery_current = round(CURRENT_CONSTANT * (battery_current - OFFSET), 2)
    battery_power = round(battery_voltage * battery_current, 2)
    battery_level = round(((battery_voltage - 2.60) / 1.05) * 100)
    battery_energy = (
        0.0  # TODO: Define a proper formula to calculate the batttery energy
    )

    # Prepare dictionary with the light values for the update or creation
    light_defaults = {
        "code": light_code,
        "type": type,
        "pwm": pwm,
        "battery_voltage": battery_voltage,
        "battery_current": battery_current,
        "battery_power": battery_power,
        "battery_level": battery_level,
        "battery_energy": battery_energy,
        "time_interval": time_interval,
    }

    _, _ = Light.objects.update_or_create(
        code=light_code,
        defaults=light_defaults,
    )

    ## Prepare the message object and sent it via websockets
    message = {
        k: light_defaults[k]
        for k in light_defaults.keys() - {"code", "type", "pwm", "battery_energy"}
    }

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
