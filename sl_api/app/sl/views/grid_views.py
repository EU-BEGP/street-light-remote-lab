# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sl.models import Grid, Message
from sl.serializers import GridSerializer
from utils.tools import create_matrix_from_grid, smart_gaussian_extrapolate


## LIST grid
class GridsListView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Grid.objects.all().order_by("id")


## RETRIEVE UPDATE grid
class GridRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Grid.objects.all()
        grid_id = self.kwargs.get("id")
        grid = queryset.get(id=grid_id)
        return grid

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data, partial=True)
        if serializer.is_valid():
            # If the serializer is valid, the grid object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)


class ExpansionGridView(generics.RetrieveAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        grid_id = self.kwargs.get("id")
        grid = Grid.objects.get(id=grid_id)
        return grid

    def retrieve(self, request, *args, **kwargs):
        grid = self.get_object()
        grid_messages = Message.objects.filter(grid=grid).order_by("id")
        intensity_matrix = create_matrix_from_grid(grid_messages)
        expanded_intensity_matrix = smart_gaussian_extrapolate(intensity_matrix)
        return Response(expanded_intensity_matrix, status=status.HTTP_200_OK)
