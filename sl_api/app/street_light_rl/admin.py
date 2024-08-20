from django.contrib import admin
from .models import Robot, Experiment, Message, Grid


class RobotAdmin(admin.ModelAdmin):
    ordering = ["robot_id"]
    list_display = ["robot_id", "description"]


class ExperimentAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = ["id", "name", "description", "owner", "robot", "registration_date"]


class GridAdmin(admin.ModelAdmin):
    ordering = ["id"]
    list_display = [
        "id",
        "grid_id",
        "width",
        "height",
        "robot",
        "experiment",
        "timestamp",
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
        "timestamp",
    ]


admin.site.register(Robot, RobotAdmin)
admin.site.register(Experiment, ExperimentAdmin)
admin.site.register(Grid, GridAdmin)
admin.site.register(Message, MessageAdmin)
