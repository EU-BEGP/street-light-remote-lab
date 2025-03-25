# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from sl.models import Experiment, Grid
from sl.serializers import (
    ExperimentWriteSerializer,
    ExperimentReadSerializer,
    GridSerializer,
)
from sl.views.utilities import handle_date_params
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound


## LIST | CREATE Experiment
class ExperimentListCreateView(generics.ListCreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Experiment.objects.all().order_by("id")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ExperimentReadSerializer

        return ExperimentWriteSerializer

    def get_queryset(self):
        user = self.request.user
        return Experiment.objects.filter(owner=user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        start_date_param = request.query_params.get("start_date", None)
        end_date_param = request.query_params.get("end_date", None)

        if start_date_param is not None:
            queryset, error_message = handle_date_params(
                self, start_date_param, end_date_param, queryset
            )

            if error_message:
                return Response(error_message, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        user = self.request.user
        data = request.data.copy()
        data["owner"] = user.id

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


## UPDATE Experiment
class ExperimentRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ExperimentReadSerializer

        return ExperimentWriteSerializer

    def get_object(self):
        user = self.request.user
        experiment_id = self.kwargs.get("id")

        if not experiment_id:
            raise NotFound(detail="Experiment ID is required")

        # Filter the queryset by the current user
        queryset = Experiment.objects.filter(owner=user)

        try:
            experiment = queryset.get(id=experiment_id)
        except Experiment.DoesNotExist:
            # If the object does not exist, raise a NotFound exception
            raise NotFound(detail="Experiment not found")

        return experiment

    def patch(self, request, *args, **kwargs):
        experiment = self.get_object()
        serializer = self.get_serializer(experiment, data=request.data, partial=True)
        if serializer.is_valid():
            # If the serializer is valid, the experiment object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


## DELETE Experiment
class ExperimentDeleteView(generics.DestroyAPIView):
    serializer_class = ExperimentWriteSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return Experiment.objects.filter(owner=user)


class ExperimentGridListView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        experiment_id = self.kwargs["id"]
        return Grid.objects.filter(experiment_id=experiment_id).prefetch_related(
            "grid_messages"
        )

    def list(self, request, *args, **kwargs):
        experiment_id = self.kwargs["id"]
        user = self.request.user

        try:
            experiment = Experiment.objects.get(id=experiment_id)
        except Experiment.DoesNotExist:
            return Response(
                {"error": "Experiment not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if experiment.owner != user:
            return Response(
                {"error": "You are not the owner of this experiment"},
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
