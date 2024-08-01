from rest_framework import generics
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import Robot, Experiment, Grid
from .serializers import (
    RobotSerializer,
    ExperimentSerializer,
    GridSerializer,
)


class RobotListView(generics.ListAPIView):
    serializer_class = RobotSerializer
    # authentication_classes = (TokenAuthentication,)
    # permission_classes = (IsAuthenticated,)
    queryset = Robot.objects.all()


class RobotExperimentsView(generics.ListAPIView):
    serializer_class = ExperimentSerializer
    # authentication_classes = (TokenAuthentication,)
    # permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        robot_id = self.kwargs["robot_id"]
        experiments = Experiment.objects.filter(robot_id=robot_id)
        return experiments


class ExperimentListView(generics.ListAPIView):
    serializer_class = ExperimentSerializer
    # authentication_classes = (TokenAuthentication,)
    # permission_classes = (IsAuthenticated,)
    queryset = Experiment.objects.all()


class RobotGridsView(generics.ListAPIView):
    serializer_class = GridSerializer
    # authentication_classes = (TokenAuthentication,)
    # permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        robot_id = self.kwargs["robot_id"]
        grids = Grid.objects.filter(robot_id=robot_id).prefetch_related("grid_messages")
        return grids

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by("id")

        grid_param = request.query_params.get("grid", None)

        if grid_param:
            serializer_data = _handle_grid_param(self, grid_param, queryset)
        else:
            serializer_data = self.get_serializer(queryset, many=True).data

        return Response(serializer_data)


class ExperimentGridsView(generics.ListAPIView):
    serializer_class = GridSerializer
    # authentication_classes = (TokenAuthentication,)
    # permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        experiment_id = self.kwargs["id"]
        grids = Grid.objects.filter(experiment_id=experiment_id).prefetch_related(
            "grid_messages"
        )
        return grids

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by("id")

        grid_param = request.query_params.get("grid", None)

        if grid_param:
            serializer_data = _handle_grid_param(self, grid_param, queryset)
        else:
            serializer_data = self.get_serializer(queryset, many=True).data

        return Response(serializer_data)


def _handle_grid_param(self, grid_param, queryset):
    grid = None
    if grid_param == "last":
        grid = queryset.last()
    elif grid_param == "first":
        grid = queryset.first()

    if grid is not None:
        serializer = self.get_serializer(grid)
        return serializer.data
