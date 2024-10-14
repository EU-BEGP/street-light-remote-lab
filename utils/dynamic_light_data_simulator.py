from time import sleep
import json
import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish
import random
import threading

MQTT_PORT = 1884
MQTT_HOST = ""
MQTT_USER = ""
MQTT_PWD = ""
MQTT_SUB_TOPIC = ""
MQTT_PUB_TOPIC = ""
MQTT_AUTH = {"username": MQTT_USER, "password": MQTT_PWD}

LIGHT_CODE = ""
DEFAULT_TIME_INTERVAL = 5

pwm = random.randint(0, 100)
time_interval = DEFAULT_TIME_INTERVAL


# MQTT CALLBACKS
def on_connect(client, userdata, flags, reason_code, properties):
    client.subscribe(MQTT_SUB_TOPIC)
    print("[Light Data Simulator]: Connected to mqtt broker and topic")


def on_message(client, userdata, msg):
    print("[Light Data Simulator]: Captured new light properties")
    global pwm, time_interval
    message = json.loads(msg.payload.decode())
    if message["light_code"] == LIGHT_CODE:
        pwm = message["PWM"]
        time_interval = message["time_interval"]


def mqtt_loop():
    mqttc.loop_forever()


if __name__ == "__main__":
    print("[Light Data Simulator]: Initialized")
    mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    mqttc.on_connect = on_connect
    mqttc.on_message = on_message
    mqttc.username_pw_set(MQTT_USER, MQTT_PWD)
    mqttc.connect(MQTT_HOST, int(MQTT_PORT), 60)

    mqtt_thread = threading.Thread(target=mqtt_loop)
    mqtt_thread.start()

    while True:
        print("[Light Data Simulator]: Light information sent")
        light_information = {
            "light_code": LIGHT_CODE,
            "type": "DC",
            "PWM": pwm,
            "voltage": random.randint(11000, 15000),
            "current": random.randint(14000, 20500),
            "time_interval": time_interval,
        }

        publish.single(
            MQTT_PUB_TOPIC,
            json.dumps(light_information),
            hostname=MQTT_HOST,
            port=int(MQTT_PORT),
            auth=MQTT_AUTH,
        )
        sleep(time_interval)
