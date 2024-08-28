import asyncio
from django.core.management.base import BaseCommand
import paho.mqtt.client as mqtt

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from street_light_rl.models import Message, Robot, Grid

import uuid
import os
import json

mqtt_host = os.environ.get("MQTT_HOST")
mqtt_port = os.environ.get("MQTT_PORT")
mqtt_topic = os.environ.get("MQTT_SUB_TOPIC")

channel_layer = get_channel_layer()


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe(mqtt_topic)
    else:
        print("Failed to connect to MQTT broker. Error code:", rc)


def on_message(client, userdata, msg):
    message_content = msg.payload.decode()
    message_object = json.loads(message_content)
    robot_id = message_object["robot_id"]  # Getting robot_id from message.
    grid_id = uuid.UUID(
        message_object["grid_id"]
    )  # Getting grid id and converting to a uuid object.

    try:
        # Retrieving robot object.
        robot = Robot.objects.get(robot_id=robot_id)
    except Robot.DoesNotExist:
        # If the robot object does not exist, create one.
        robot = Robot(robot_id)
        robot.save()

    try:
        # Getting grid object.
        grid = Grid.objects.get(grid_id=grid_id)
        # Creating and saving message if it is not the last one.
        if not message_object["is_last"]:
            message = Message(
                x_pos=message_object["x_pos"],
                y_pos=message_object["y_pos"],
                intensity=message_object["intensity"],
                is_last=message_object["is_last"],
                grid=grid,
            )
            message.save()

    except Grid.DoesNotExist:
        # If grid does not exit and message is not last create new grid, message and save both.
        if not message_object["is_last"]:
            new_grid = Grid(grid_id=grid_id, robot=robot)
            new_grid.save()
            message = Message(
                x_pos=message_object["x_pos"],
                y_pos=message_object["y_pos"],
                intensity=message_object["intensity"],
                is_last=message_object["is_last"],
                grid=new_grid,
            )
            message.save()

        if message_object["is_last"]:  # Case for 1x1 grid.
            new_grid = Grid(grid_id=grid_id, robot=robot)
            new_grid.save()  # Create and save grid first.
            message = Message(
                x_pos=message_object["x_pos"],
                y_pos=message_object["y_pos"],
                intensity=message_object["intensity"],
                is_last=message_object["is_last"],
                grid=new_grid,
            )
            message.save()  # Create and save single message.
            width, height = get_width_and_height(new_grid)
            new_grid.width = width
            new_grid.height = height
            new_grid.save()  # Get and save width and height, omce single message is created.
            return

    if message_object["is_last"]:
        # If message is_last retrieve grid and set its width and height.
        grid = Grid.objects.get(grid_id=grid_id)
        width, height = get_width_and_height(grid)
        grid.width = width
        grid.height = height
        grid.save()

        # Saving last message.
        message = Message(
            x_pos=message_object["x_pos"],
            y_pos=message_object["y_pos"],
            intensity=message_object["intensity"],
            is_last=message_object["is_last"],
            grid=grid,
        )
        message.save()

    # Send data to WebSocket consumers
    loop = asyncio.get_event_loop()
    coroutine = channel_layer.group_send(
        "data_group",
        {"type": "send_websocket_data", "data": json.dumps(message_object)},
    )
    loop.run_until_complete(coroutine)


def get_width_and_height(grid):
    messages = Message.objects.all()
    filtered_messages = messages.filter(
        grid=grid
    )  # Filtering messages that belong to specific grid.
    x_coords = list(filtered_messages.values_list("x_pos", flat=True))  # List of x pos.
    y_coords = list(filtered_messages.values_list("y_pos", flat=True))  # List of y pos.
    width = max(y_coords) + 1
    height = max(x_coords) + 1

    return width, height  # Returns a tuple.


class Command(BaseCommand):
    def handle(self, *args, **options):
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        client.connect(mqtt_host, int(mqtt_port), 60)
        client.loop_forever()
