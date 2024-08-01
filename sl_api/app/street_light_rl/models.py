from django.db import models
from django.conf import settings


class Robot(models.Model):
    robot_id = models.CharField(primary_key=True, max_length=50, unique=True)
    description = models.CharField(max_length=250, default="", blank=True)


class Experiment(models.Model):
    name = models.CharField(max_length=255)
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
    timestamp = models.DateTimeField(auto_now_add=True)
    robot = models.ForeignKey(
        Robot,
        related_name="robot_grids",
        on_delete=models.CASCADE
    )
    experiment = models.ForeignKey(
        Experiment,
        related_name="experiment_grids",
        on_delete=models.CASCADE
    )
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)


class Message(models.Model):
    x_pos = models.IntegerField()
    y_pos = models.IntegerField()
    intensity = models.FloatField()
    is_last = models.BooleanField(default=False)
    robot = models.ForeignKey(
        Robot,
        related_name="robot_messages",
        on_delete=models.CASCADE
    )
    grid = models.ForeignKey(
        Grid,
        related_name="grid_messages",
        on_delete=models.CASCADE
    )