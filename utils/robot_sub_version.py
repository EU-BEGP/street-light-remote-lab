# File: robot_simulator.py
# Purpose: A robot data simulator for UPB remote lab.
# Author: Maria Fernanda del Granado

from time import sleep
import json
import math
import paho.mqtt.client as mqtt
import random
import sys
import uuid

# Define mqtt constants
MQTT_HOST = None
MQTT_PORT = None
MQTT_USER = None
MQTT_PWD = None
MQTT_SUB_TOPIC = None
MQTT_PUB_TOPIC = None

# Define robot_id constant
ROBOT_CODE = None

"""
Class that allows user to create robot object given the following:
-A robot code
-A grid code
-The width of the grid
-The height of the grid
-The upper intensity value
-The lower intensity value
"""


class Robot:
    def __init__(
        self,
        robot_code,
        grid_code,
        width,
        height,
        lower_intensity_val,
        upper_intensity_val,
    ):
        self.width = width
        self.height = height
        self.robot_code = robot_code
        self.grid_code = str(grid_code)
        self.upper_intensity_val = upper_intensity_val
        self.lower_intensity_val = lower_intensity_val
        self.results = []  # 2D list.

    """
    Function calculates intensity of the distance.
    """

    def calculate_intensity(self, distance, max_distance):
        # Highest value times the proportion times the range.
        intensity = int(
            self.upper_intensity_val
            - (distance / max_distance)
            * (self.upper_intensity_val - self.lower_intensity_val)
        )
        variation = random.uniform(-5, 5)
        intensity = intensity + variation

        return max(
            self.lower_intensity_val, min(self.upper_intensity_val, round(intensity))
        )

    """
    Function generates data based on distance from center and intensity of distance between grid squares and center.
    """

    def generate_data(self):
        self.results = []
        center_x = self.width // 2
        center_y = self.height // 2

        # Distance from the center to farthest corner.
        max_distance = math.sqrt(center_x**2 + center_y**2)

        for i in range(self.height):
            temp_list = []

            for j in range(self.width):
                # Calculating distance between squares in the grid.
                distance = math.sqrt((i - center_y) ** 2 + (j - center_x) ** 2)
                intensity = self.calculate_intensity(distance, max_distance)
                temp_list.append(intensity)

            self.results.append(temp_list)

    """
    Function that connects client to mqtt host and port, then publishes data in payloads.
    """

    def send_json_data(self):
        for i in range(self.height):
            for j in range(self.width):
                data = {
                    "robot_code": self.robot_code,
                    "grid_code": self.grid_code,
                    "x_pos": i,
                    "y_pos": j,
                    "intensity": self.results[i][j],
                }

                if (i == (self.height - 1)) and (j == (self.width - 1)):
                    # Send the last message with "is_last" set to true.
                    data["is_last"] = True
                else:
                    data["is_last"] = False

                sleep(0.05)
                # print(data)
                mqttc.publish(MQTT_PUB_TOPIC, json.dumps(data))

        print("Data sent successfully\n")


# MQTT CALLBACKS
def on_connect(client, userdata, flags, reason_code, properties):
    client.subscribe(MQTT_SUB_TOPIC)


def on_message(client, userdata, msg):
    message = json.loads(msg.payload.decode())
    if message["message"] == "capture":
        print("Capture of grid requested")

        robot = Robot(
            robot_code=ROBOT_CODE,
            grid_code=str(uuid.uuid4()),
            width=10,
            height=10,
            lower_intensity_val=1,
            upper_intensity_val=20,
        )
        robot.generate_data()
        robot.send_json_data()


if __name__ == "__main__":
    mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    mqttc.on_connect = on_connect
    mqttc.on_message = on_message
    mqttc.username_pw_set(MQTT_USER, MQTT_PWD)
    mqttc.connect(MQTT_HOST, int(MQTT_PORT), 60)
    mqttc.loop_forever()
