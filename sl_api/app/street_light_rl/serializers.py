from rest_framework import serializers
from .models import Robot, Experiment, Message


class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Robot
        fields = "__all__"


class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = "__all__"


class BatchedMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("x_pos", "y_pos", "intensity", "timestamp")
