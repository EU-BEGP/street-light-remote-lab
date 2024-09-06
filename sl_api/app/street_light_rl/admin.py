from django.contrib import admin
from .models import Robot, Lamp, Experiment, Message, Grid


class RobotAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "code", "description"]

class LampAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "code", "dim_level", "state", "robot"]

class ExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "owner", "created_at"]


class GridAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "code",
        "width",
        "height",
        "lamp",
        "experiment",
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
admin.site.register(Lamp, LampAdmin)
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(Grid, GridAdmin)
admin.site.register(Message, MessageAdmin)
