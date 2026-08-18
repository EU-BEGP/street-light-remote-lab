# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from time import sleep
import json
import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish
import random
import threading

MQTT_PORT = 1883
MQTT_HOST = "mosquitto"
MQTT_USER = ""
MQTT_PWD = ""
MQTT_SUB_TOPIC = "street-light-rl/lights/post/"
MQTT_PUB_TOPIC = "street-light-rl/lights/get/"
MQTT_AUTH = {"username": MQTT_USER, "password": MQTT_PWD} if MQTT_USER else None

LIGHT_CODE = "light_06"
LIGHT_TYPE = "DC"
PWM = 50
TIME_INTERVAL_MS = 5000


# MQTT functions
def on_connect(client, userdata, flags, reason_code, properties):
    client.subscribe(MQTT_SUB_TOPIC)
    print("[Light Data Simulator]: Connected to mqtt broker and topic")


def on_message(client, userdata, msg):
    global light_object, time_interval
    message = json.loads(msg.payload.decode())
    print(f"[Light Data Simulator]: Captured incoming message: {message}")

    time_interval = int(message["time_interval"])  # Update global time_interval
    if message["light_code"] == userdata["light_code"]:  # Update global light_object
        light_object["pwm"] = message["pwm"]
        light_object["time_interval"] = message["time_interval"]


def mqtt_loop():
    mqttc.loop_forever()


if __name__ == "__main__":
    global light_object, time_interval
    light_code = LIGHT_CODE
    light_type = LIGHT_TYPE
    pwm = PWM
    time_interval = TIME_INTERVAL_MS

    light_object = {
        "light_code": light_code,
        "type": light_type,
        "pwm": pwm,
        "time_interval": time_interval,  # Convert to ms
    }

    print("[Light Data Simulator]: Initialized")
    mqttc = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2, userdata={"light_code": light_code}
    )
    mqttc.on_connect = on_connect
    mqttc.on_message = on_message
    mqttc.username_pw_set(MQTT_USER, MQTT_PWD)
    mqttc.connect(MQTT_HOST, int(MQTT_PORT), 60)

    mqtt_thread = threading.Thread(target=mqtt_loop)
    mqtt_thread.start()

    while True:
        if light_type == "DC":
            light_object["dc_voltage"] = round(random.uniform(12.0, 48.0), 2)
            light_object["dc_current"] = round(random.uniform(0.1, 5.0), 2)
            light_object["dc_power"] = round(
                light_object["dc_voltage"] * light_object["dc_current"], 2
            )
            light_object["dc_energy_consumption"] = round(random.uniform(0.1, 10.0), 2)
            light_object["dc_energy_charge"] = round(random.uniform(-2.0, 5.0), 2)
            light_object["dc_level"] = random.randint(0, 100)
        elif light_type == "AC":
            light_object["ac_voltage"] = round(random.uniform(110.0, 240.0), 2)
            light_object["ac_current"] = round(random.uniform(0.5, 10.0), 2)
            light_object["ac_power"] = round(
                light_object["ac_voltage"] * light_object["ac_current"], 2
            )
            light_object["ac_energy"] = round(random.uniform(0.1, 20.0), 2)
            light_object["ac_frequency"] = round(random.uniform(50.0, 60.0), 2)
            light_object["ac_factor"] = round(random.uniform(0.8, 1.0), 2)
        elif light_type == "AC_INV":
            light_object["dc_voltage"] = round(random.uniform(12.0, 48.0), 2)
            light_object["dc_current"] = round(random.uniform(0.1, 5.0), 2)
            light_object["dc_power"] = round(
                light_object["dc_voltage"] * light_object["dc_current"], 2
            )
            light_object["dc_energy_consumption"] = round(random.uniform(0.1, 10.0), 2)
            light_object["dc_energy_charge"] = round(random.uniform(-2.0, 5.0), 2)
            light_object["dc_level"] = random.randint(0, 100)
            light_object["ac_voltage"] = round(random.uniform(110.0, 240.0), 2)
            light_object["ac_current"] = round(random.uniform(0.5, 10.0), 2)
            light_object["ac_power"] = round(
                light_object["ac_voltage"] * light_object["ac_current"], 2
            )
            light_object["ac_energy"] = round(random.uniform(0.1, 20.0), 2)
            light_object["ac_frequency"] = round(random.uniform(50.0, 60.0), 2)
            light_object["ac_factor"] = round(random.uniform(0.8, 1.0), 2)

        publish.single(
            MQTT_PUB_TOPIC,
            json.dumps(light_object),
            hostname=MQTT_HOST,
            port=int(MQTT_PORT),
            auth=MQTT_AUTH,
        )
        print(
            f"[Light Data Simulator]: Light information for {light_code} sent successfully (Time interval of {time_interval} [ms])"
        )
        sleep(time_interval / 1000)
