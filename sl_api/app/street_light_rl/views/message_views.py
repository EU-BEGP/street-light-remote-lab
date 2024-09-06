from street_light_rl.models import Message
from street_light_rl.serializers import MessageSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


## LIST | CREATE message
class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Message.objects.all().order_by("id")

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


## UPDATE message
class MessageUpdateView(generics.UpdateAPIView):
    serializer_class = MessageSerializer
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        queryset = Message.objects.all()
        message_id = self.kwargs.get("id")
        message = queryset.get(id=message_id)
        return message

    def patch(self, request, *args, **kwargs):
        object = self.get_object()
        serializer = self.serializer_class(object, data=request.data, partial=True)
        if serializer.is_valid():
            # If the serializer is valid, the message object is updated.
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # If the serializer is not valid, the serializer errors are returned.
            return Response(serializer.errors)
