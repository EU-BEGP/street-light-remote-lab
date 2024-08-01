# File: robot_simulator.py
# Purpose: A robot data simulator for UPB remote lab.
# Author: Maria Fernanda del Granado

import random
import math
import json
import time
import sys
import paho.mqtt.client as mqtt

# Define mqtt constants
MQTT_PORT = None
MQTT_HOST = None
MQTT_TOPIC = None

"""
Class that allows user to create robot object given the following:
-A robot ID
-The width of the grid
-The height of the grid
-The upper intensity value
-The lower intensity value
"""


class Robot:
    def __init__(self, ID, width, height, lower_intensity_val, upper_intensity_val):
        self.width = width
        self.height = height
        self.ID = ID
        self.upper_intensity_val = upper_intensity_val
        self.lower_intensity_val = lower_intensity_val
        self.results = []  # 2D list
        self.final_result_strings = []

    """
    Function generates data based on distance from center and intensity of distance between grid squares and center.
    """

    def generate_data(self):
        center_x = self.width // 2
        center_y = self.height // 2

        # Distance from the center to farthest corner
        max_distance = math.sqrt(center_x**2 + center_y**2)

        for i in range(self.height):
            temp_list = []

            for j in range(self.width):
                # Calculating distance between squares in the grid
                distance = math.sqrt((i - center_y) ** 2 + (j - center_x) ** 2)
                intensity = self.calculate_intensity(distance, max_distance)
                temp_list.append(intensity)

            self.results.append(temp_list)
        self.create_result_strings_format()

    """
    Function calculates intensity of the distance.
    """

    def calculate_intensity(self, distance, max_distance):
        # Highest value times the proportion times the range
        return int(
            self.upper_intensity_val
            - (distance / max_distance)
            * (self.upper_intensity_val - self.lower_intensity_val)
        )

    """
    Helper function to print out results as grid.
    """

    def print_grid(self):
        grid_tops = "+------" * self.width + "+"
        sides = "|      " * self.width + "|"

        for i in range(self.height):
            print(grid_tops)
            temp_string = ""

            for j in range(self.width):
                if j == 0:
                    if self.results[i][j] > 9:
                        temp_string += f"|  {self.results[i][j]}  |"

                    else:
                        temp_string += f"|  {self.results[i][j]}   |"

                else:
                    if self.results[i][j] > 9:
                        temp_string += f"  {self.results[i][j]}  |"
                    else:
                        temp_string += f"   {self.results[i][j]}  |"
            print(sides)
            print(temp_string)
            print(sides)

        print(grid_tops)

    """
    Function formats strings results.
    """

    def create_result_strings_format(self):
        for i in range(self.height):
            for j in range(self.width):
                data_at_index = self.results[i][j]
                temp_string = f"{{ID: {self.ID}, intensity: {data_at_index}, x_pos: {i}, y_pos: {j}}}"
                self.final_result_strings.append(temp_string)

    """
    Prints results.
    """

    def print_results(self):
        print("\nData: ")

        for i in range(len(self.final_result_strings)):
            print(self.final_result_strings[i])
        print("")

    """
    Function that connects client to mqtt host and port, then publishes data in payloads.
    """

    def send_json_data(self):
        client = mqtt.Client(
            client_id="", clean_session=True, userdata=None, protocol=mqtt.MQTTv311
        )

        # Handles connection error case
        if client.connect(MQTT_HOST, MQTT_PORT, 40) != 0:
            print("Could not connect!")
            sys.exit(-1)

        for i in range(self.height):
            for j in range(self.width):
                if (i == self.height - 1) and (j == self.width - 1):
                    continue
                data = {
                    "ID": self.ID,  # Only strings should be in quotes when sending in JSON format
                    "x_pos": i,
                    "y_pos": j,
                    "intensity": self.results[i][j],
                    "finish": False,  # Send all messages with "finish" set to false except for last
                }
                client.publish(MQTT_TOPIC, json.dumps(data))  # Publish to topic

        # Send the last message with "finish" set to true
        last_data = {
            "ID": self.ID,
            "x_pos": self.height - 1,
            "y_pos": self.width - 1,
            "intensity": self.results[-1][-1],
            "finish": True,
        }
        client.publish(MQTT_TOPIC, json.dumps(last_data))
        client.disconnect()


if __name__ == "__main__":
    while True:
        id_num = random.randrange(1, 5)
        curr_id = "robot" + str(id_num)
        robot = Robot(curr_id, 5, 5, 5, 20)
        robot.generate_data()
        robot.print_results()
        robot.print_grid()
        robot.send_json_data()
        time.sleep(20)  # 20 second time delay before next data is generated
