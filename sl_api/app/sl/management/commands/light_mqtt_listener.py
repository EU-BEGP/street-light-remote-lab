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
    light_code = mqtt_message["light_code"]
    type = mqtt_message["type"]
    pwm = mqtt_message["pwm"]
    time_interval = mqtt_message["time_interval"]

    light_object = {
        "type": type,
        "pwm": pwm,
        "time_interval": time_interval,
    }

    if type == "DC":
        # Capture DC only data and store it in the light object
        light_object["dc_voltage"] = mqtt_message["dc_voltage"]
        light_object["dc_current"] = mqtt_message["dc_current"]
        light_object["dc_power"] = mqtt_message["dc_power"]
        light_object["dc_energy_consumption"] = mqtt_message["dc_energy_consumption"]
        light_object["dc_energy_charge"] = mqtt_message["dc_energy_charge"]
        light_object["dc_level"] = mqtt_message["dc_level"]

    elif type == "AC":
        # Capture AC only data and store it in the light object
        light_object["ac_voltage"] = mqtt_message["ac_voltage"]
        light_object["ac_current"] = mqtt_message["ac_current"]
        light_object["ac_power"] = mqtt_message["ac_power"]
        light_object["ac_energy"] = mqtt_message["ac_energy"]
        light_object["ac_frequency"] = mqtt_message["ac_frequency"]
        light_object["ac_factor"] = mqtt_message["ac_factor"]

    elif type == "AC_INV":
        # Capture data combination of both types of lights
        light_object["ac_voltage"] = mqtt_message["ac_voltage"]
        light_object["ac_current"] = mqtt_message["ac_current"]
        light_object["ac_power"] = mqtt_message["ac_power"]
        light_object["ac_energy"] = mqtt_message["ac_energy"]
        light_object["ac_frequency"] = mqtt_message["ac_frequency"]
        light_object["ac_factor"] = mqtt_message["ac_factor"]
        light_object["dc_voltage"] = mqtt_message["dc_voltage"]
        light_object["dc_current"] = mqtt_message["dc_current"]
        light_object["dc_power"] = mqtt_message["dc_power"]
        light_object["dc_energy_consumption"] = mqtt_message["dc_energy_consumption"]
        light_object["dc_energy_charge"] = mqtt_message["dc_energy_charge"]
        light_object["dc_level"] = mqtt_message["dc_level"]

    _, _ = Light.objects.update_or_create(
        code=light_code,
        defaults=light_object,
    )

    light_object = dict({"light_code": light_code}, **light_object)
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
