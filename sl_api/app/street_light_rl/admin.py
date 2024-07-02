from django.contrib import admin
from .models import Robot, Experiment, Message


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
        "experiment",
        "robot",
        "timestamp",
    ]


admin.site.register(Robot, RobotAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Experiment, ExperimentAdmin)
