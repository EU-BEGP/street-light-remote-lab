from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sl.models import Grid, Message
from sl.serializers import GridSerializer
import math
import numpy as np


## LIST grid
class GridsListView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Grid.objects.all().order_by("id")


## UPDATE grid
class GridUpdateView(generics.UpdateAPIView):
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
        grid_messages = construct_array_from_queryset(Message.objects.filter(grid=grid))
        expanded_grid = expand_heatmap_value_based(grid_messages)
        return Response(expanded_grid, status=status.HTTP_200_OK)


def construct_array_from_queryset(queryset):
    # Determine the size of the array
    max_x = max(message.x_pos for message in queryset)  # Maximum x-coordinate
    max_y = max(message.y_pos for message in queryset)  # Maximum y-coordinate

    # Create base array
    array = []
    for _ in range(0, max_x + 1):
        inner_array = []
        for _ in range(0, max_y + 1):
            inner_array.append(0)
        array.append(inner_array)

    # Populate the array with intensities from the QuerySet
    for message in queryset:
        x = message.x_pos
        y = message.y_pos
        intensity = message.intensity
        array[x][y] = intensity

    return array


def expand_heatmap_value_based(array):
    # Convert the array to a numpy array
    array = np.array(array, dtype=float)

    # Get the original dimensions
    rows, cols = array.shape

    # Use sqrt of max_value as padding
    max_value = np.max(array)
    padding = int(np.sqrt(max_value))

    # Ensure padding is at least 1
    padding = max(padding, 1)

    # Create a new array with padding
    new_rows = rows + 2 * padding
    new_cols = cols + 2 * padding
    new_array = np.zeros((new_rows, new_cols))

    # Copy the original array into the center of the new array
    new_array[padding : padding + rows, padding : padding + cols] = array

    # Fill the padded regions with a dynamic gradient
    for i in range(padding):
        # Calculate the gradient factor (scales from 1 to 0)
        factor = (padding - i) / padding

        # Fill the top and bottom rows
        for j in range(cols):
            # Get the edge values from the original array
            top_value = array[0, j]
            bottom_value = array[-1, j]

            # Calculate the gradient values
            top_gradient = math.floor(top_value * factor)
            bottom_gradient = math.floor(bottom_value * factor)

            # Fill the top and bottom rows
            new_array[padding - (i + 1), padding + j] = top_gradient
            new_array[-(padding - i), padding + j] = bottom_gradient

        # Fill the left and right columns
        for j in range(rows):
            # Get the edge values from the original array
            left_value = array[j, 0]
            right_value = array[j, -1]

            # Calculate the gradient values
            left_gradient = math.floor(left_value * factor)
            right_gradient = math.floor(right_value * factor)

            # Fill the left and right columns
            new_array[padding + j, padding - (i + 1)] = left_gradient
            new_array[padding + j, -(padding - i)] = right_gradient

        # Fill the diagonal regions (corners)
        for j in range(padding):
            # Get the edge values from the original array
            top_left_value = array[0, 0]  # Top-left corner
            top_right_value = array[0, -1]  # Top-right corner
            bottom_left_value = array[-1, 0]  # Bottom-left corner
            bottom_right_value = array[-1, -1]  # Bottom-right corner

            # Calculate the gradient values
            top_left_gradient = math.floor(top_left_value * factor)
            top_right_gradient = math.floor(top_right_value * factor)
            bottom_left_gradient = math.floor(bottom_left_value * factor)
            bottom_right_gradient = math.floor(bottom_right_value * factor)

            # Fill the diagonal regions
            new_array[padding - (i + 1), padding - (j + 1)] = top_left_gradient
            new_array[padding - (i + 1), -(padding - j)] = top_right_gradient
            new_array[-(padding - i), padding - (j + 1)] = bottom_left_gradient
            new_array[-(padding - i), -(padding - j)] = bottom_right_gradient

    return new_array
