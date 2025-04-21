# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from django.core.management.base import BaseCommand
from sl.models import Message, Grid, Robot, Light
from time import sleep
from utils.mqtt_listener import MQTTListener
from utils.tools import (
    create_matrix_from_grid,
    perform_2d_spline,
    stream_message_over_websocket,
)
import os
import uuid

MQTT_LISTENER_NAME = "ROBOT"

# MQTT CONSTANTS
MQTT_HOST = os.environ.get("MQTT_HOST", None)
MQTT_PORT = os.environ.get("MQTT_PORT", 1883)
MQTT_USER = os.environ.get("MQTT_USER", None)
MQTT_PWD = os.environ.get("MQTT_PWD", None)
MQTT_TOPIC = os.environ.get("MQTT_SUB_ROBOT_TOPIC", None)

# CHANNELS CONSTANT
GROUP_NAME = "robot_group"


def get_grid_information(grid):
    messages = Message.objects.filter(grid=grid)

    x_coords = list(messages.values_list("x_pos", flat=True))  # List of x pos.
    y_coords = list(messages.values_list("y_pos", flat=True))  # List of y pos.

    min_x, max_x = min(x_coords), max(x_coords)
    min_y, max_y = min(y_coords), max(y_coords)

    # Get width and height
    width = max_x - min_x + 1
    height = max_y - min_y + 1

    # Check if the GRID contains all the messages
    # Create a set of actual coordinates
    present_coords = set((x, y) for x, y in zip(x_coords, y_coords))

    # Create a set of expected coordinates
    expected_coords = set(
        (x, y)
        for x in range(min_x, min_x + width)
        for y in range(min_y, min_y + height)
    )
    # Find missing coordinates
    missing_coords = expected_coords - present_coords

    return width, height, not missing_coords


# MQTT Callback
def process_message(mqtt_message):
    robot_code = mqtt_message.get("robot_code")  # Get robot_code from message.
    grid_code = uuid.UUID(mqtt_message.get("grid_code"))

    # Approach: Get robot code and relate them to a light
    try:
        # Retrieving robot object.
        robot = Robot.objects.get(code=robot_code)
        light = Light.objects.get(id=robot.light.id)

        try:
            # Get existing Grid
            grid = Grid.objects.get(code=grid_code)

        except Grid.DoesNotExist:
            # Crete new Grid
            grid = Grid(code=grid_code, light=light, grid_type="REAL_TIME")
            grid.save()

        # Save message
        message = Message(
            x_pos=mqtt_message.get("x_pos", 0.0),
            y_pos=mqtt_message.get("y_pos", 0.0),
            intensity=mqtt_message.get("intensity", 0.0),
            is_last=mqtt_message.get("is_last", False),
            grid=grid,
        )
        message.save()

        # If the message is the last one, update grid dimension info
        if mqtt_message.get("is_last"):
            print(f"[{MQTT_LISTENER_NAME} MQTT Listener]: Last Message received")
            width, height, is_complete = get_grid_information(grid)
            grid.width = width
            grid.height = height
            grid.complete = is_complete
            grid.save()

            # Send grid information over websockets
            websocket_message = {}
            if is_complete:
                print(
                    f"[{MQTT_LISTENER_NAME} MQTT Listener]: Sending complete grid data"
                )
                grid_messages = Message.objects.filter(grid=grid).order_by("id")

                # Create matrix and get position mappings
                intensity_matrix = create_matrix_from_grid(grid_messages)
                splined_matrix = perform_2d_spline(intensity_matrix)

                for grid_message in grid_messages:
                    websocket_message = {
                        "grid_id": str(grid_message.grid.id),
                        "grid_code": str(grid_message.grid.code),
                        "x_pos": grid_message.x_pos,
                        "y_pos": grid_message.y_pos,
                        "intensity": grid_message.intensity,
                        "splined_intensity": float(
                            splined_matrix[grid_message.x_pos][grid_message.y_pos]
                        ),
                        "is_last": grid_message.is_last,
                    }

                    stream_message_over_websocket(websocket_message, GROUP_NAME)
                    sleep(0.1)
            else:
                websocket_message["error"] = "The grid contains missing messages"
                stream_message_over_websocket(websocket_message, GROUP_NAME)

    except Robot.DoesNotExist as e:
        print(f"[{MQTT_LISTENER_NAME} MQTT Listener]: Robot is not registered: {e}")

    except Light.DoesNotExist as e:
        print(f"[{MQTT_LISTENER_NAME} MQTT Listener]: Light is not registered: {e}")


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
