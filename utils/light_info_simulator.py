from time import sleep
import json
import paho.mqtt.publish as publish
import random

# Define mqtt constants
MQTT_HOST = None
MQTT_PORT = None
MQTT_USER = None
MQTT_PWD = None
MQTT_SUB_TOPIC = None
MQTT_PUB_TOPIC = None
MQTT_AUTH = {"username": MQTT_USER, "password": MQTT_PWD}

LIGHT_CODE = ""
TIME_INTERVAL = 5

if __name__ == "__main__":
    while True:
        print("Sending light information")
        light_information = {
            "light_code": LIGHT_CODE,
            "type": "DC",
            "PWM": random.randint(0, 100),
            "voltage": random.randint(11000, 15000),
            "current": random.randint(14000, 20500),
            "time_interval": TIME_INTERVAL,
        }

        publish.single(
            MQTT_PUB_TOPIC,
            json.dumps(light_information),
            hostname=MQTT_HOST,
            port=int(MQTT_PORT),
            auth=MQTT_AUTH,
        )
        sleep(TIME_INTERVAL)
