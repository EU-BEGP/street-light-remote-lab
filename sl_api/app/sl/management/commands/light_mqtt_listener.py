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
    light_code = mqtt_message.get("light_code")
    type = mqtt_message.get("type")
    pwm = mqtt_message.get("pwm", 0.0)
    time_interval = mqtt_message.get("time_interval")

    light_object = {
        "type": type,
        "pwm": pwm,
        "time_interval": time_interval,
    }

    if type == "DC":
        # Capture DC data and store it in the light object
        light_object["dc_voltage"] = mqtt_message.get("dc_voltage", 0.0)
        light_object["dc_current"] = mqtt_message.get("dc_current", 0.0)
        light_object["dc_power"] = mqtt_message.get("dc_power", 0.0)
        light_object["dc_energy_consumption"] = mqtt_message.get(
            "dc_energy_consumption", 0.0
        )
        light_object["dc_energy_charge"] = mqtt_message.get("dc_energy_charge", 0.0)
        light_object["dc_level"] = mqtt_message.get("dc_level", 0.0)

    elif type == "AC":
        # Capture AC only data and store it in the light object
        light_object["ac_voltage"] = mqtt_message.get("ac_voltage", 0.0)
        light_object["ac_current"] = mqtt_message.get("ac_current", 0.0)
        light_object["ac_power"] = mqtt_message.get("ac_power", 0.0)
        light_object["ac_energy"] = mqtt_message.get("ac_energy", 0.0)
        light_object["ac_frequency"] = mqtt_message.get("ac_frequency", 0.0)
        light_object["ac_factor"] = mqtt_message.get("ac_factor", 0.0)

    elif type == "AC_INV":
        # Capture data combination of both types of lights
        light_object["ac_voltage"] = mqtt_message.get("ac_voltage", 0.0)
        light_object["ac_current"] = mqtt_message.get("ac_current", 0.0)
        light_object["ac_power"] = mqtt_message.get("ac_power", 0.0)
        light_object["ac_energy"] = mqtt_message.get("ac_energy", 0.0)
        light_object["ac_frequency"] = mqtt_message.get("ac_frequency", 0.0)
        light_object["ac_factor"] = mqtt_message.get("ac_factor", 0.0)
        light_object["dc_voltage"] = mqtt_message.get("dc_voltage", 0.0)
        light_object["dc_current"] = mqtt_message.get("dc_current", 0.0)
        light_object["dc_power"] = mqtt_message.get("dc_power", 0.0)
        light_object["dc_energy_consumption"] = mqtt_message.get(
            "dc_energy_consumption", 0.0
        )
        light_object["dc_energy_charge"] = mqtt_message.get("dc_energy_charge", 0.0)
        light_object["dc_level"] = mqtt_message.get("dc_level", 0.0)

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
