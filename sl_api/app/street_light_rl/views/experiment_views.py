from street_light_rl.models import Experiment, Grid
from street_light_rl.serializers import ExperimentSerializer, GridSerializer
from street_light_rl.views.utilities import handle_date_params
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


## LIST | CREATE Experiment
class ExperimentListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Experiment.objects.all().order_by("id")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        owner = request.query_params.get("owner", None)
        start_date_param = request.query_params.get("start_date", None)
        end_date_param = request.query_params.get("end_date", None)

        if owner is not None:
            queryset = queryset.filter(owner=owner)

        if start_date_param is not None:
            queryset, error_message = handle_date_params(
                self, start_date_param, end_date_param, queryset
            )

            if error_message:
                return Response(error_message, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        # Capture owner
        owner = self.request.user

        data = request.data.copy()
        # Add the owner field to the data
        data["owner"] = owner.id

        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


## UPDATE Experiment
class ExperimentUpdateView(generics.UpdateAPIView):
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
        serializer = self.serializer_class(object, data=request.data, partial=True)
        if serializer.is_valid():
            # If the serializer is valid, the experiment object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


## DELETE Experiment
class ExperimentDeleteView(generics.DestroyAPIView):
    serializer_class = ExperimentSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """
        Optionally restrict the returned experiments to the ones owned by the current user.
        """
        user = self.request.user
        return Experiment.objects.filter(owner=user)


class ExperimentGridListView(generics.ListAPIView):
    serializer_class = GridSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        experiment_id = self.kwargs["id"]
        grid = Grid.objects.filter(experiment_id=experiment_id).prefetch_related(
            "grid_messages"
        )
        return grid
