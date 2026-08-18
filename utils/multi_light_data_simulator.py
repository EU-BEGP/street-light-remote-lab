# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from time import sleep
import json
import paho.mqtt.publish as publish
import random

MQTT_PORT = 1883
MQTT_HOST = "mosquitto"
MQTT_USER = ""
MQTT_PWD = ""
MQTT_PUB_TOPIC = "street-light-rl/lights/get/"
MQTT_AUTH = {"username": MQTT_USER, "password": MQTT_PWD} if MQTT_USER else None

LIGHT_CODES = ["light_01", "light_02", "light_03", "light_04", "light_05"]
TIME_INTERVAL_MS = 5000


def build_light_object(light_code):
    dc_voltage = round(random.uniform(12.0, 48.0), 2)
    dc_current = round(random.uniform(0.1, 5.0), 2)

    return {
        "light_code": light_code,
        "type": "DC",
        "pwm": random.randint(0, 100),
        "time_interval": TIME_INTERVAL_MS,
        "dc_voltage": dc_voltage,
        "dc_current": dc_current,
        "dc_power": round(dc_voltage * dc_current, 2),
        "dc_energy_consumption": round(random.uniform(0.1, 10.0), 2),
        "dc_energy_charge": round(random.uniform(-2.0, 5.0), 2),
        "dc_level": random.randint(0, 100),
    }


if __name__ == "__main__":
    print(f"[Multi Light Data Simulator]: Publishing {LIGHT_CODES} every {TIME_INTERVAL_MS}ms")

    while True:
        for light_code in LIGHT_CODES:
            light_object = build_light_object(light_code)
            publish.single(
                MQTT_PUB_TOPIC,
                json.dumps(light_object),
                hostname=MQTT_HOST,
                port=MQTT_PORT,
                auth=MQTT_AUTH,
            )
            print(f"[Multi Light Data Simulator]: Sent data for {light_code}")

        sleep(TIME_INTERVAL_MS / 1000)
