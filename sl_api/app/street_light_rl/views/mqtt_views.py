from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import paho.mqtt.publish as publish
import json
import os

mqtt_grid_topic = os.environ.get("MQTT_PUB_GRID_TOPIC", None)
mqtt_light_topic = os.environ.get("MQTT_PUB_LIGHT_TOPIC", None)
mqtt_host = os.environ.get("MQTT_HOST", None)
mqtt_port = os.environ.get("MQTT_PORT", 1883)
mqtt_user = os.environ.get("MQTT_USER", None)
mqtt_pwd = os.environ.get("MQTT_PWD", None)

mqtt_auth = {"username": mqtt_user, "password": mqtt_pwd}


class PublishRobotCommand(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    # Function to publish a message to indicate the robot to start capturing grid data
    def get(self, request, *args, **kwargs):
        message = {"message": "capture"}

        publish.single(
            mqtt_grid_topic,
            json.dumps(message),
            hostname=mqtt_host,
            port=int(mqtt_port),
            auth=mqtt_auth,
        )
        return Response(
            {"success": "Command sent successfully"}, status=status.HTTP_200_OK
        )


class PublishLightCommand(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    # Function to publish a message to indicate the robot to start capturing grid data
    def post(self, request, *args, **kwargs):
        pwm = request.data.get("pwm", None)

        if pwm is not None:
            message = {"pwm": pwm}
            publish.single(
                mqtt_light_topic,
                json.dumps(message),
                hostname=mqtt_host,
                port=int(mqtt_port),
                auth=mqtt_auth,
            )

            return Response(
                {"success": "Command sent successfully"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Please provide the pwm property"},
                status=status.HTTP_400_BAD_REQUEST,
            )
