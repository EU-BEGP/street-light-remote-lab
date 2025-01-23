from django.contrib import admin
from .models import Robot, Light, Experiment, Message, Grid


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
        "frequency",
        "factor",
    ]


class RobotAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "code", "light"]


class ExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "owner", "light", "created_at"]


class GridAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "code",
        "width",
        "height",
        "complete",
        "experiment",
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
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(Grid, GridAdmin)
admin.site.register(Message, MessageAdmin)
