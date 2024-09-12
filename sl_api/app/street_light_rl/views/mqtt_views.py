from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import paho.mqtt.publish as publish
import json
import os

grid_topic = os.environ.get("MQTT_PUB_GRID_TOPIC", None)
light_topic = os.environ.get("MQTT_PUB_LIGHT_TOPIC", None)
host = os.environ.get("MQTT_HOST", None)
port = os.environ.get("MQTT_PORT", 1883)


class GetGridMQTT(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    # Function to publish a message to indicate the robot to start capturing grid data
    def get(self, request, *args, **kwargs):
        message = {"message": "capture"}

        publish.single(grid_topic, json.dumps(message), hostname=host, port=int(port))
        return Response(
            {"success": "Request sent successfully"}, status=status.HTTP_200_OK
        )


class SetLightPropertiesMQTT(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    # Function to publish a message to indicate the robot to start capturing grid data
    def post(self, request, *args, **kwargs):
        state = request.data.get("state", None)
        dim = request.data.get("dim", None)

        if state is not None and dim is not None:
            message = {"state": state, "dim": dim}
            publish.single(
                light_topic, json.dumps(message), hostname=host, port=int(port)
            )

            return Response(
                {"success": "Data sent successfully"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Please provide the state and dim properties"},
                status=status.HTTP_400_BAD_REQUEST,
            )
