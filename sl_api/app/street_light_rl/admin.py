from django.contrib import admin
from .models import Robot, Experiment, Message, Grid


class RobotAdmin(admin.ModelAdmin):
    ordering = ["robot_id"]
    list_display = ["robot_id", "description"]


class ExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "description", "robot", "owner", "registration_date"]


class MessageAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "x_pos",
        "y_pos",
        "intensity",
        "is_last",
        "robot"
    ]

class GridAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "timestamp",
        "robot",
        "experiment",
        "width",
        "height"
    ]

admin.site.register(Robot, RobotAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(Grid, GridAdmin)
