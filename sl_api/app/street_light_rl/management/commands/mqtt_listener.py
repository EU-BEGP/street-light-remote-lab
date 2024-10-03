from channels.layers import get_channel_layer
from django.core.management.base import BaseCommand
from street_light_rl.models import Message, Grid, Robot, Lamp
from time import sleep
import asyncio
import django
import json
import os
import paho.mqtt.client as mqtt
import uuid

# Ensure Django is set up
django.setup()

mqtt_host = os.environ.get("MQTT_HOST", None)
mqtt_port = os.environ.get("MQTT_PORT", 1883)
mqtt_topic = os.environ.get("MQTT_SUB_TOPIC", None)
mqtt_user = os.environ.get("MQTT_USER", None)
mqtt_pwd = os.environ.get("MQTT_PWD", None)

channel_layer = get_channel_layer()


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


def stream_message_over_websocket(message):
    # Send message data to WebSocket consumer
    loop = asyncio.get_event_loop()
    coroutine = channel_layer.group_send(
        "data_group",
        {"type": "send_websocket_data", "data": json.dumps(message)},
    )
    loop.run_until_complete(coroutine)


def process_incoming_message(mqtt_message):
    robot_code = mqtt_message["robot_code"]  # Get robot_code from message.
    grid_code = uuid.UUID(
        mqtt_message["grid_code"]
    )  # Get grid code and converting to a uuid object.

    # Approach: Get robot code and relate them to a lamp
    try:
        # Retrieving robot object.
        robot = Robot.objects.get(code=robot_code)
        lamp = Lamp.objects.get(robot=robot)

        try:
            # Get existing Grid
            grid = Grid.objects.get(code=grid_code)

        except Grid.DoesNotExist:
            # Crete new Grid
            grid = Grid(code=grid_code, lamp=lamp)
            grid.save()

        # Save message
        message = Message(
            x_pos=mqtt_message["x_pos"],
            y_pos=mqtt_message["y_pos"],
            intensity=mqtt_message["intensity"],
            is_last=mqtt_message["is_last"],
            grid=grid,
        )
        message.save()

        # If the message is the last one, update grid dimension info
        if mqtt_message["is_last"]:
            print("[MQTT Listener]: Last Message received")
            width, height, is_complete = get_grid_information(grid)
            grid.width = width
            grid.height = height
            grid.complete = is_complete
            grid.save()

            # Send complete grid information over websockets
            if is_complete:
                print("[MQTT Listener]: Sending complete grid data")
                grid_messages = Message.objects.filter(grid=grid).order_by("id")
                for grid_message in grid_messages:
                    message = {
                        "grid_id": grid_message.grid.id,
                        "x_pos": grid_message.x_pos,
                        "y_pos": grid_message.y_pos,
                        "intensity": grid_message.intensity,
                    }

                    if grid_message.is_last:
                        message["is_last"] = True

                    stream_message_over_websocket(message)
                    sleep(0.1)

    except Robot.DoesNotExist as e:
        print(f"[MQTT Listener]: Robot is not registered: {e}")

    except Lamp.DoesNotExist as e:
        print(f"[MQTT Listener]: Lamp is not registered: {e}")


# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[MQTT Listener]: Connected to MQTT broker")
        client.subscribe(mqtt_topic)
    else:
        print("[MQTT Listener]: Failed to connect to MQTT broker. Error code:", rc)


def on_disconnect(self, client, userdata, rc):
    print("Disconnected from MQTT broker.")
    while True:
        try:
            client.reconnect()
            print("[MQTT Listener]: Reconnected to MQTT broker.")
            break
        except Exception as e:
            print(f"[MQTT Listener]: Reconnect failed: {e}. Retrying in 5 seconds...")
            sleep(5)


def on_message(client, userdata, msg):
    try:
        print("[MQTT Listener]: Message received")
        # Get and parse MQTT message
        mqtt_message = json.loads(msg.payload.decode())
        process_incoming_message(mqtt_message)

    except json.JSONDecodeError:
        print(f"[MQTT Listener]: Failed to decode JSON from message: {msg.payload}")
    except Exception as e:
        print(f"[MQTT Listener]: An error occurred: {e}")


# Command
class Command(BaseCommand):
    def handle(self, *args, **options):
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_disconnect = on_disconnect
        client.on_message = on_message
        client.username_pw_set(mqtt_user, mqtt_pwd)

        while True:
            try:
                client.connect(mqtt_host, int(mqtt_port), 60)
                client.loop_forever()  # This will block and handle messages
                break  # Exit the loop if connection is successful
            except Exception as e:
                print(f"Connection failed: {e}. Retrying...")
                sleep(5)
