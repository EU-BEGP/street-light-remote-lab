from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta
from .models import Robot, Experiment, Grid, Message
from .serializers import (
    RobotSerializer,
    ExperimentSerializer,
    GridSerializer,
    MessageSerializer,
)
import json
import paho.mqtt.publish as publish
import os


class RobotListView(generics.ListCreateAPIView):
    serializer_class = RobotSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Robot.objects.all()

    def create(self, request, *args, **kwargs):
        # Gets data from POST request in json format.
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            # Checks if data can be correctly serialized and contains necessary fields.
            serializer.save()
            # Creates and saves new Experiment object in database.
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class ExperimentListView(generics.ListCreateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Experiment.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        owner = request.query_params.get("owner", None)
        if owner is not None:
            queryset = queryset.filter(owner=owner)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        # Gets data from POST request in json format.
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            # Checks if data can be correctly serialized and contains necessary fields.
            serializer.save()
            # Creates and saves new Experiment object in database.
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class UpdateGrid(generics.UpdateAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Grid.objects.all()
        # Gets grid_id from url.
        grid_id = self.kwargs.get("grid_id")
        # Gets the grid object with a matching 'grid_id' from the queryset.
        grid = queryset.get(id=grid_id)
        return grid

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data)
        if serializer.is_valid():
            # If the serializer is valid, the grid object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class UpdateRobot(generics.UpdateAPIView):
    serializer_class = RobotSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Robot.objects.all()
        # Gets robot_id from url.
        robot_id = self.kwargs.get("robot_id")
        # Gets the robot object with a matching'robot_id' from the queryset.
        robot = queryset.get(robot_id=robot_id)
        return robot

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data)
        if serializer.is_valid():
            # If the serializer is valid, the robot object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class UpdateMessage(generics.UpdateAPIView):
    serializer_class = MessageSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Message.objects.all()
        # Gets message id from url.
        message_id = self.kwargs.get("id")
        # Gets the message object with a matching message 'id' from the queryset.
        message = queryset.get(id=message_id)
        return message

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data)
        if serializer.is_valid():
            # If the serializer is valid, the message object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class UpdateExperiment(generics.UpdateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Experiment.objects.all()
        # Gets experiment id from url.
        experiment_id = self.kwargs.get("id")
        # Gets experiment object with experiment'id' from queryset.
        experiment = queryset.get(id=experiment_id)
        return experiment

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data)
        if serializer.is_valid():
            # If the serializer is valid, the experiment object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class GridsView(generics.ListAPIView):
    # Returns all grid objects in the database.
    serializer_class = GridSerializer
    queryset = Grid.objects.all()
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)


class MessagesView(generics.ListCreateAPIView):
    # Returns all message objects in the database.
    serializer_class = MessageSerializer
    queryset = Message.objects.all()
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        # Gets data from POST request in json format.
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            # Checks if data can be correctly serialized and contains necessary fields.
            serializer.save()
            # Creates and saves new Message object in database.
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class RobotExperimentsView(generics.ListCreateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        robot_id = self.kwargs["robot_id"]
        experiments = Experiment.objects.filter(robot_id=robot_id)
        return experiments


class RobotGridsView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        robot_id = self.kwargs["robot_id"]
        grids = Grid.objects.filter(robot_id=robot_id).prefetch_related("grid_messages")
        return grids

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by("id")
        grid_param = request.query_params.get("grid", None)
        start_date_param = request.query_params.get("start", None)
        end_date_param = request.query_params.get("end", None)

        # Returns an error message if the robot ID is invalid or if the robot has no associated grids.
        if len(queryset) == 0:
            return Response(
                "Error: The provided Robot ID is invalid or the robot does not have any associated grids.",
                status=404,
            )

        # If only the grid query param is provided, the data is passed to a specific function for handling, which returns the corresponding grid.
        if grid_param:
            serializer_data = _handle_grid_param(self, grid_param, queryset)

        # If only the start date or both start and end dates are provided as query parameters,
        # the data is passed to a specific function for processing, which returns the corresponding grids.
        elif start_date_param and (end_date_param is None) and (grid_param is None):
            serializer_data = _handle_date_params(
                self, start_date_param, end_date_param, queryset
            )
        elif start_date_param and end_date_param and (grid_param is None):
            serializer_data = _handle_date_params(
                self, start_date_param, end_date_param, queryset
            )
        else:
            # If no query parameters are provided, or if incorrect parameters are used, return all grids associated with the specified robot ID.
            serializer_data = self.get_serializer(queryset, many=True).data

        return Response(
            serializer_data
        )  # Returns the grid(s) that match the specified criteria.


class ExperimentGridsView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        experiment_id = self.kwargs["id"]
        grids = Grid.objects.filter(experiment_id=experiment_id).prefetch_related(
            "grid_messages"
        )
        return grids

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by("id")
        grid_param = request.query_params.get("grid", None)
        start_date_param = request.query_params.get("start", None)
        end_date_param = request.query_params.get("end", None)

        # Returns an error message if the experiment ID is invalid or if the experiment has no associated grids.
        if len(queryset) == 0:
            return Response(
                "Error: The provided Experiment ID is invalid or the robot does not have any associated grids.",
                status=404,
            )

        # If only the grid query param is provided, the data is passed to a specific function for handling, which returns the corresponding grid.
        if grid_param:
            serializer_data = _handle_grid_param(self, grid_param, queryset)

        # If only the start date or both start and end dates are provided as query parameters,
        # the data is passed to a specific function for processing, which returns the corresponding grids.
        elif start_date_param and (end_date_param is None) and (grid_param is None):
            serializer_data = _handle_date_params(
                self, start_date_param, end_date_param, queryset
            )
        elif start_date_param and end_date_param and (grid_param is None):
            serializer_data = _handle_date_params(
                self, start_date_param, end_date_param, queryset
            )
        else:
            # If no query parameters are provided, or if incorrect parameters are used, return all grids associated with the specified experiment ID.
            serializer_data = self.get_serializer(queryset, many=True).data

        return Response(
            serializer_data
        )  # Returns the grid(s) that match the specified criteria.


def _handle_grid_param(self, grid_param, queryset):
    grid = None
    if grid_param == "last":
        grid = queryset.last()
    elif grid_param == "first":
        grid = queryset.first()
    else:
        try:
            # Converts 'grid_param' to an int and then retrieves the corresponding data from the queryset.
            grid_param = int(grid_param)
            grid = queryset[grid_param - 1]

        except:
            response = json.loads(
                '{"Error": "Invalid grid number. Please enter a valid grid number within the range of available grids."}'
            )
            return response

    if grid is not None:
        serializer = self.get_serializer(grid)
        return serializer.data


def _handle_date_params(self, start_date_param, end_date_param, queryset):
    try:
        date_format = "%Y-%m-%d"
        if "-" in start_date_param and (end_date_param is not None):
            start_date_obj = (datetime.strptime(start_date_param, date_format)).date()
            # Add one day to the end date to include grids created at the end date (since the range ends at 00:00).
            end_date_obj = (
                datetime.strptime(end_date_param, date_format) + timedelta(days=1)
            ).date()
        elif "-" in start_date_param and (end_date_param is None):
            start_date_obj = (datetime.strptime(start_date_param, date_format)).date()

        if start_date_obj and (end_date_param is None):
            current_date_obj = (datetime.now() + timedelta(days=1)).date()
            # Returns an error message if the start date is later than today's date.
            if start_date_obj > (current_date_obj - timedelta(days=1)):
                response = json.loads(
                    '{"Error": "The start date cannot be later than todays date."}'
                )
                return response
            filtered_queryset = queryset.filter(
                timestamp__range=[start_date_obj, current_date_obj]
            )

        elif start_date_obj and end_date_obj:
            # Returns an error message if the start date is after the end date.
            if start_date_obj > (end_date_obj - timedelta(days=1)):
                response = json.loads(
                    '{"Error": "The start date cannot be after the end date."}'
                )
                return response
            # Filters the queryset to include grids with dates within the specified start and end date range.
            filtered_queryset = queryset.filter(
                timestamp__range=[start_date_obj, end_date_obj]
            )

    except:  # Returns an error message if the date is in an incorrect format or if random strings/numbers are provided.
        response = json.loads('{"Error": "Dates must be formatted as YYYY-MM-DD."}')
        return response

    serializer_data = self.get_serializer(filtered_queryset, many=True).data
    return serializer_data  # Returns the grid(s) that match the specified criteria.


class RequestGridMQTT(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    # Function to publish a message to indicate the robot to start capturing grid data
    def get(self, request, *args, **kwargs):
        topic = os.environ.get("MQTT_PUB_GRID_TOPIC")
        host = os.environ.get("MQTT_HOST")
        port = os.environ.get("MQTT_PORT")
        message = {"message": "capture"}

        publish.single(topic, json.dumps(message), hostname=host, port=int(port))
        return Response(
            {"success": "Request sent successfully"}, status=status.HTTP_200_OK
        )


class LightPropertiesMQTT(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    # Function to publish a message to indicate the robot to start capturing grid data
    def post(self, request, *args, **kwargs):
        topic = os.environ.get("MQTT_PUB_LIGHT_TOPIC")
        host = os.environ.get("MQTT_HOST")
        port = os.environ.get("MQTT_PORT")

        state = request.data.get("state", None)
        dim = request.data.get("dim", None)

        message = {"state": state, "dim": dim}
        publish.single(topic, json.dumps(message), hostname=host, port=int(port))

        return Response(
            {"success": "Data sent successfully"}, status=status.HTTP_200_OK
        )
