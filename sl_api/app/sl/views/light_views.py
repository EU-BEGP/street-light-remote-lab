# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from sl.models import Light, Grid
from sl.serializers import (
    LightSerializer,
    GridSerializer,
)
from sl.views.utilities import handle_grid_param, handle_date_params
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


## LIST | CREATE Light
class LightListCreateView(generics.ListCreateAPIView):
    serializer_class = LightSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Light.objects.all().order_by("id")

    def create(self, request, *args, **kwargs):
        # Gets data from POST request in json format.
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            # Checks if data can be correctly serialized and contains necessary fields.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


## UPDATE Light
class LightUpdateView(generics.UpdateAPIView):
    serializer_class = LightSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Light.objects.all()
        light_id = self.kwargs.get("id")
        light = queryset.get(id=light_id)
        return light

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data, partial=True)
        if serializer.is_valid():
            # If the serializer is valid, the light object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


## Get grids related to a Light
class LightGridsListView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        light_id = self.kwargs["id"]
        grids = Grid.objects.filter(light=light_id).prefetch_related("grid_messages")
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
