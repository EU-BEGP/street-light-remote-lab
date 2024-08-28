from rest_framework import serializers
from .models import Robot, Experiment, Message, Grid


class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Robot
        fields = "__all__"


class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = "__all__"


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("x_pos", "y_pos", "grid", "intensity", "timestamp")


class GridSerializer(serializers.ModelSerializer):
    grid_messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Grid
        fields = "__all__"
