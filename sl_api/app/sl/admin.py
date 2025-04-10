# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from django.contrib import admin
from .models import Robot, Light, Message, Grid


class LightAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "code",
        "type",
        "pwm",
        "time_interval",
        "dc_voltage",
        "dc_current",
        "dc_power",
        "dc_energy_consumption",
        "dc_energy_charge",
        "dc_level",
        "ac_voltage",
        "ac_current",
        "ac_power",
        "ac_energy",
        "ac_frequency",
        "ac_factor",
    ]


class RobotAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "code", "light"]


class GridAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "code",
        "width",
        "height",
        "complete",
        "light",
        "created_at",
    ]


class MessageAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "x_pos",
        "y_pos",
        "intensity",
        "is_last",
        "grid",
        "created_at",
    ]


admin.site.register(Robot, RobotAdmin)
admin.site.register(Light, LightAdmin)
admin.site.register(Grid, GridAdmin)
admin.site.register(Message, MessageAdmin)
