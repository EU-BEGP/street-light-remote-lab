from django.conf import settings
from django.db import models


class Robot(models.Model):
    robot_id = models.CharField(primary_key=True, max_length=50, unique=True)
    description = models.CharField(max_length=250, default="", blank=True)


class Experiment(models.Model):
    name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owner_experiments",
        on_delete=models.CASCADE,
    )
    robot = models.ForeignKey(
        Robot, related_name="robot_experiments", on_delete=models.CASCADE
    )


class Grid(models.Model):
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    robot = models.ForeignKey(
        Robot, related_name="robot_grids", on_delete=models.CASCADE
    )
    experiment = models.ForeignKey(
        Experiment, related_name="experiment_grids", on_delete=models.CASCADE
    )


class Message(models.Model):
    x_pos = models.IntegerField()
    y_pos = models.IntegerField()
    intensity = models.FloatField()
    is_last = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    grid = models.ForeignKey(
        Grid, related_name="grid_messages", on_delete=models.CASCADE
    )
