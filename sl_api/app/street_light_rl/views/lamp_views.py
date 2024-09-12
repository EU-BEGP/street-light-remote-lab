from street_light_rl.models import Lamp, Grid, Experiment
from street_light_rl.serializers import (
    LampSerializer,
    GridSerializer,
    ExperimentSerializer,
)
from street_light_rl.views.utilities import handle_grid_param, handle_date_params
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


## LIST | CREATE Lamp
class LampListCreateView(generics.ListCreateAPIView):
    serializer_class = LampSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Lamp.objects.all().order_by("id")

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


## UPDATE Lamp
class LampUpdateView(generics.UpdateAPIView):
    serializer_class = LampSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Lamp.objects.all()
        lamp_id = self.kwargs.get("id")
        lamp = queryset.get(id=lamp_id)
        return lamp

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data, partial=True)
        if serializer.is_valid():
            # If the serializer is valid, the lamp object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


## Get experiments related to a Lamp
class LampExperimentsListView(generics.ListAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        lamp_id = self.kwargs["id"]
        experiments = Experiment.objects.filter(experiment_grid__lamp=lamp_id)
        return experiments


## Get grids related to a Lamp
class LampGridsListView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        lamp_id = self.kwargs["id"]
        grids = Grid.objects.filter(lamp=lamp_id).prefetch_related("grid_messages")
        return grids

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by("id")

        grid_param = request.query_params.get("grid", None)
        start_date_param = request.query_params.get("start_date", None)
        end_date_param = request.query_params.get("end_date", None)

        if grid_param is not None:
            queryset, error_message = handle_grid_param(self, grid_param, queryset)

            if error_message:
                return Response(error_message, status=status.HTTP_400_BAD_REQUEST)

        if start_date_param is not None:
            queryset, error_message = handle_date_params(
                self, start_date_param, end_date_param, queryset
            )

            if error_message:
                return Response(error_message, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
