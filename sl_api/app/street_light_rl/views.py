from .models import Robot, Experiment, Message
from .serializers import (
    RobotSerializer,
    ExperimentSerializer,
    BatchedMessageSerializer,
)
from datetime import datetime # my import
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
        messages = Message.objects.filter(experiment_id=experiment_id).order_by('id')
        return messages

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        batches = return_batches(queryset)
        batch_param = request.query_params.get("batch", None)
        start_date_param = request.query_params.get("start", None) # URL should be written as start=YYYY-MM-DD&end=YYYY-MM-DD
        end_date_param = request.query_params.get("end", None)


        if len(batches) == 0:
            return Response("Experiment ID is either invalid or experiment has no messages. Please check and try again.", status=404)

        if (start_date_param or end_date_param) and batch_param is None:
            if end_date_param and (start_date_param is None): # case if only end date
                return Response("You must enter the start and end date, or just the start date.", status=400)

            if start_date_param and (end_date_param is None): # case only start param
                try:
                    if '-' in start_date_param:
                        date_format = '%Y-%m-%d' # ex: 2024-07-23 (case if usrer writes date with '-')
                        start_date_obj = datetime.strptime(start_date_param, date_format).date() # creating date object
                    elif '/' in start_date_param:
                        date_format = '%Y/%m/%d' # ex: 2024/07/23 (case if user writes date with '/')
                        start_date_obj = datetime.strptime(start_date_param, date_format).date()

                    current_date_obj = datetime.now().date() # getting current date
                    batches_at_date = []
                    curr_batch = []

                    for message in queryset:
                        curr_message_date = message.timestamp.date()
                        if start_date_obj <= curr_message_date <= current_date_obj: # comparing date objects
                            # if message is on or between start date and current date, append
                            curr_batch.append(message)
                            if message.is_last:
                                batches_at_date.append(curr_batch)
                                curr_batch = []

                    serialized_batches = [
                                    self.serializer_class(batch, many=True).data for batch in batches_at_date
                                ]
                    return Response(serialized_batches)
                except ValueError:
                    return Response("The date you entered must be in this format: YYYY-MM-DD. The date can also be in this format: YYYY/MM/DD. It must contain no whitespaces or other characters.", status=400)

            if start_date_param == end_date_param: # case start and end params are equal
                try:
                    if '-' in start_date_param:
                        date_format = '%Y-%m-%d'
                        start_date_obj = datetime.strptime(start_date_param, date_format).date()
                    elif '/' in start_date_param:
                        date_format = '%Y/%m/%d'
                        start_date_obj = datetime.strptime(start_date_param, date_format).date()

                    batches_at_date = []
                    curr_batch = []

                    for message in queryset:
                        curr_message_date = message.timestamp.date()
                        if start_date_obj == curr_message_date: # if message date is equal to start and end date, append
                            curr_batch.append(message)
                            if message.is_last: # if message is last, append list (batch) to batches_at_date and reset
                                batches_at_date.append(curr_batch)
                                curr_batch = []
                    serialized_batches = [
                                    self.serializer_class(batch, many=True).data for batch in batches_at_date
                                ]
                    return Response(serialized_batches)

                except ValueError:
                    return Response("The date you entered must be in this format: YYYY-MM-DD. The date can also be in this format: YYYY/MM/DD. It must contain no whitespaces or other characters.", status=400)

            elif start_date_param != end_date_param and (end_date_param is not None):
                try:
                    if '-' in start_date_param:
                        date_format = '%Y-%m-%d'
                        start_date_obj = datetime.strptime(start_date_param, date_format).date()
                        end_date_obj = datetime.strptime(end_date_param, date_format).date()
                    elif '/' in start_date_param:
                        date_format = '%Y/%m/%d'
                        start_date_obj = datetime.strptime(start_date_param, date_format).date()
                        end_date_obj = datetime.strptime(end_date_param, date_format).date()

                    batches_at_date = []
                    curr_batch = []

                    for message in queryset:
                        curr_message_date = message.timestamp.date()
                        if start_date_obj <= curr_message_date <= end_date_obj:
                            curr_batch.append(message)
                            if message.is_last:
                                batches_at_date.append(curr_batch)
                                curr_batch = []
                    serialized_batches = [
                                    self.serializer_class(batch, many=True).data for batch in batches_at_date
                                ]
                    return Response(serialized_batches)
                except ValueError:
                    return Response("The date you entered must be in this format: YYYY-MM-DD. The date can also be in this format: YYYY/MM/DD. It must contain no whitespaces or other characters.", status=400)

        if (batch_param) and (start_date_param == None) and (end_date_param == None):
            if batch_param == "last":
                batch = batches[-1] # getting last batch
                if batch is not None:
                    serialized_batch = (
                        self.serializer_class(batch, many=True).data if batch else []
                    )
                    return Response(serialized_batch)
            elif batch_param == "first":
                batch = batches[0] # getting first batch
                if batch is not None:
                    serialized_batch = (
                        self.serializer_class(batch, many=True).data if batch else []
                    )
                    return Response(serialized_batch)

            try:
                batch_param = int(batch_param)
                if batch_param > len(batches) or batch_param < 0: # handles index out of range case
                    batches = []
                    serialized_batches = [
                            self.serializer_class(batch, many=True).data for batch in batches
                    ]
                    return Response(serialized_batches)

                elif (0 < batch_param) and (batch_param <=len(batches)):
                    # if batch_param int is within range of the batches list, return that batch
                    batch = batches[int(batch_param)-1]
                    if batch is not None:
                        serialized_batch = (
                            self.serializer_class(batch, many=True).data if batch else []
                        )
                        return Response(serialized_batch)
                    else:
                            batch = None
            except ValueError:
                return Response("You must input a valid batch number. Only 'first' and 'last' are acceptable strings. There must be no whitespaces.", status=400)


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
