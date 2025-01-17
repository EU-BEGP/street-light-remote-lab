from rest_framework import serializers
from .models import Robot, Light, Experiment, Message, Grid


class LightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Light
        fields = [
            "id",
            "code",
            "type",
            "pwm",
            "voltage",
            "current",
            "time_interval",
            "power",
            "energy",
            "frequency",
            "factor",
            "power_consumption",
            "power_charge",
            "energy_consumption",
            "energy_charge",
        ]


class ReducedLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Light
        fields = [
            "id",
            "code",
            "type",
        ]


class RobotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Robot
        fields = ["id", "code", "light"]


class ExperimentReadSerializer(serializers.ModelSerializer):
    light = ReducedLightSerializer()

    class Meta:
        model = Experiment
        fields = ["id", "name", "created_at", "owner", "light"]


class ExperimentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = ["id", "name", "created_at", "owner", "light"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "x_pos", "y_pos", "intensity", "is_last", "created_at", "grid"]


class GridSerializer(serializers.ModelSerializer):
    grid_messages = MessageSerializer(many=True, read_only=True)
    light = ReducedLightSerializer()

    class Meta:
        model = Grid
        fields = [
            "id",
            "code",
            "width",
            "height",
            "complete",
            "created_at",
            "experiment",
            "light",
            "grid_messages",
        ]
