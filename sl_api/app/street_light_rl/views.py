from .models import Robot, Experiment, Message
from .serializers import (
    RobotSerializer,
    ExperimentSerializer,
    BatchedMessageSerializer,
)
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


class RobotListView(generics.ListAPIView):
    serializer_class = RobotSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Robot.objects.all()


class RobotMessagesView(generics.ListAPIView):
    serializer_class = BatchedMessageSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        robot_id = self.kwargs["robot_id"]
        messages = Message.objects.filter(robot_id=robot_id)
        return messages

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        batch_param = request.query_params.get("batch", None)
        batches = return_batches(queryset)

        if batch_param:
            if batch_param == "last":
                batch = batches[-1]
            elif batch_param == "first":
                batch = batches[0]
            else:
                batch = None

            if batch is not None:
                serialized_batch = (
                    self.serializer_class(batch, many=True).data if batch else []
                )
                return Response(serialized_batch)

        serialized_batches = [
            self.serializer_class(batch, many=True).data for batch in batches
        ]
        return Response(serialized_batches)


class RobotExperimentsView(generics.ListAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        robot_id = self.kwargs["robot_id"]
        experiments = Experiment.objects.filter(robot_id=robot_id)
        return experiments


class ExperimentMessagesView(generics.ListAPIView):
    serializer_class = BatchedMessageSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        experiment_id = self.kwargs["id"]
        messages = Message.objects.filter(experiment_id=experiment_id)
        return messages

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        batch_param = request.query_params.get("batch", None)
        batches = return_batches(queryset)

        if batch_param:
            if batch_param == "last":
                batch = batches[-1]
            elif batch_param == "first":
                batch = batches[0]
            else:
                batch = None

            if batch is not None:
                serialized_batch = (
                    self.serializer_class(batch, many=True).data if batch else []
                )
                return Response(serialized_batch)

        serialized_batches = [
            self.serializer_class(batch, many=True).data for batch in batches
        ]
        return Response(serialized_batches)


def return_batches(queryset):
    batches = []

    current_batch = []
    for message in queryset:
        current_batch.append(message)
        if message.is_last:
            batches.append(current_batch)
            current_batch = []

    if current_batch:
        batches.append(current_batch)

    return batches
