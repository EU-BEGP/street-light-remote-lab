from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from street_light_rl.models import Robot
import json
import os
import paho.mqtt.publish as publish

mqtt_grid_topic = os.environ.get("MQTT_PUB_ROBOT_TOPIC", None)
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
    def post(self, request, *args, **kwargs):
        light_code = request.data.get("light_code", None)
        capture = True

        if light_code:
            try:
                robot = Robot.objects.get(light__code=light_code)
                robot_code = robot.code

                message = {
                    "robot_code": robot_code,
                    "capture": capture,
                }

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
            except Robot.DoesNotExist:
                return Response(
                    {"error": "Light does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"error": "Please provide the neccesary property [light_code]"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PublishLightCommand(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    # Function to publish a message to indicate the robot to start capturing grid data
    def post(self, request, *args, **kwargs):
        light_code = request.data.get("light_code", None)
        pwm = int(request.data.get("PWM", None))
        time_interval = int(request.data.get("time_interval", None))

        if light_code is not None and pwm is not None and time_interval is not None:
            message = {
                "light_code": light_code,
                "PWM": pwm,
                "time_interval": time_interval * 1000,  # Convert to miliseconds
            }
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
                {
                    "error": "Please provide the neccesary properties [light_code, PWM, time_interval]"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
