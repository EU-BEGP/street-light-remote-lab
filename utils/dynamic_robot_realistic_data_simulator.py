from time import sleep
import json
import math
import paho.mqtt.client as mqtt
import random
import uuid

MQTT_PORT = 1883
MQTT_HOST = ""
MQTT_USER = ""
MQTT_PWD = ""
MQTT_SUB_TOPIC = ""
MQTT_PUB_TOPIC = ""

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
        self.results = []

    def calculate_intensity(self, distance, max_distance, i, j):
        # Base intensity gets more weight now
        base_intensity = self.upper_intensity_val - (distance / max_distance) * (
            self.upper_intensity_val - self.lower_intensity_val
        )

        # Moderate random components
        random_component = random.uniform(
            -0.15 * (self.upper_intensity_val - self.lower_intensity_val),
            0.15 * (self.upper_intensity_val - self.lower_intensity_val),
        )

        # Subtle noise pattern
        pattern_noise = (
            math.sin(j * 0.5)
            * math.cos(i * 0.3)
            * 0.1
            * (self.upper_intensity_val - self.lower_intensity_val)
        )

        # Combine with strong base influence
        intensity = base_intensity * 0.8 + random_component * 0.5 + pattern_noise * 0.3

        # Apply occasional small spikes (less frequent and smaller)
        if random.random() < 0.1:  # Reduced from 0.15
            spike = random.choice(
                [
                    random.uniform(0.05, 0.15) * self.upper_intensity_val,
                    -random.uniform(0.05, 0.15) * self.lower_intensity_val,
                ]
            )
            intensity += spike

        return int(
            round(
                max(self.lower_intensity_val, min(self.upper_intensity_val, intensity))
            )
        )

    def generate_data(self):
        self.results = []
        center_x = self.width // 2
        center_y = self.height // 2
        max_distance = math.sqrt(center_x**2 + center_y**2)

        # Generate just 1-2 subtle noise fields
        noise_fields = []
        for _ in range(random.randint(1, 2)):  # Fewer noise fields
            noise_fields.append(
                {
                    "scale": random.uniform(0.3, 0.6),  # Reduced scale range
                    "offset_x": random.uniform(0, 100),
                    "offset_y": random.uniform(0, 100),
                    "intensity": random.uniform(0.1, 0.3),  # Reduced intensity
                }
            )

        for i in range(self.height):
            temp_list = []
            for j in range(self.width):
                # Calculate noise component (subtler now)
                noise_value = 0
                for nf in noise_fields:
                    nx = (i + nf["offset_x"]) * nf["scale"]
                    ny = (j + nf["offset_y"]) * nf["scale"]
                    noise_value += (math.sin(nx) * math.cos(ny)) * nf["intensity"]

                noise_value = noise_value / len(noise_fields)
                distance = math.sqrt((i - center_y) ** 2 + (j - center_x) ** 2)
                base_value = self.calculate_intensity(distance, max_distance, i, j)

                # Final combination with stronger base influence
                final_value = (
                    base_value * 0.9 + noise_value * 0.1 * self.upper_intensity_val
                )
                final_value = final_value * random.uniform(
                    0.95, 1.05
                )  # Smaller final variation

                temp_list.append(
                    int(
                        round(
                            max(
                                self.lower_intensity_val,
                                min(self.upper_intensity_val, final_value),
                            )
                        )
                    )
                )

            self.results.append(temp_list)

    """
    Function that connects client to mqtt host and port, then publishes data in payloads.
    """

    def send_json_data(self):
        print("[Robot Data Simulator]: Sending messages...")
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
                mqttc.publish(MQTT_PUB_TOPIC, json.dumps(data))
                print(f"[Robot Data Simulator]: Message for position [{i},{j}] sent...")

        print("[Robot Data Simulator]: All messages sent successfully\n")


# MQTT CALLBACKS
def on_connect(client, userdata, flags, reason_code, properties):
    client.subscribe(MQTT_SUB_TOPIC)
    print("[Robot Data Simulator]: Connected to mqtt broker and topic")


def on_message(client, userdata, msg):
    global robot_code, width, height, lower_intensity_value, upper_intensity_value
    message = json.loads(msg.payload.decode())
    print(f"[Robot Data Simulator]: Captured request {message}")
    if message["robot_code"] == robot_code and message["start"]:
        robot = Robot(
            robot_code=robot_code,
            grid_code=str(uuid.uuid4()),
            width=int(width),
            height=int(height),
            lower_intensity_val=int(lower_intensity_value),
            upper_intensity_val=int(upper_intensity_value),
        )
        robot.generate_data()
        robot.send_json_data()
    else:
        print("[Robot Data Simulator]: The code provided doesn't match")


# User interactions
def get_robot_code():
    """Prompt the user to enter the robot code."""
    return input("Enter the robot code: ")


def get_width():
    """Prompt the user to enter the grid width."""
    return input("Enter the grid width: ")


def get_height():
    """Prompt the user to enter the grid height."""
    return input("Enter the grid height: ")


def get_lower_intensity_value():
    """Prompt the user to enter the grid lower intensity value."""
    return input("Enter the grid lower intensity value: ")


def get_upper_intensity_value():
    """Prompt the user to enter the grid upper intensity value."""
    return input("Enter the grid upper intensity value: ")


if __name__ == "__main__":
    global robot_code, width, height, lower_intensity_value, upper_intensity_value
    robot_code = get_robot_code()
    width = get_width()
    height = get_height()
    lower_intensity_value = get_lower_intensity_value()
    upper_intensity_value = get_upper_intensity_value()

    print("[Robot Data Simulator]: Initialized")
    mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    mqttc.on_connect = on_connect
    mqttc.on_message = on_message
    mqttc.username_pw_set(MQTT_USER, MQTT_PWD)
    mqttc.connect(MQTT_HOST, int(MQTT_PORT), 60)
    mqttc.loop_forever()
