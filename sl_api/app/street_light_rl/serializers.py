from rest_framework import serializers
from .models import Robot, Lamp, Experiment, Message, Grid


class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Robot
        fields = "__all__"


class LampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lamp
        fields = "__all__"


class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = "__all__"


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"


class GridSerializer(serializers.ModelSerializer):
    grid_messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Grid
        fields = "__all__"
