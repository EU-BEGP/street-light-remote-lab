from django.contrib import admin
from .models import Robot, Light, Experiment, Message, Grid


class LightAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
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
