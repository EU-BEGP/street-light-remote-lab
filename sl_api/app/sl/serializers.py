# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from rest_framework import serializers
from .models import Robot, Light, Message, Grid


class LightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Light
        fields = "__all__"


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
            "light",
            "grid_messages",
        ]
