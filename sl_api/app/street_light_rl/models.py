from django.conf import settings
from django.db import models


class Robot(models.Model):
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=250, default="", blank=True)


class Lamp(models.Model):
    code = models.CharField(max_length=50, unique=True)
    dim_level = models.FloatField(default=0.0)
    state = models.BooleanField(default=False)
    robot = models.OneToOneField(
        Robot,
        related_name="lamp_robot",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class Experiment(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owner_experiments",
        on_delete=models.CASCADE,
    )


class Grid(models.Model):
    code = models.UUIDField(unique=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    complete = models.BooleanField(default=False)
    lamp = models.ForeignKey(Lamp, related_name="lamp_grids", on_delete=models.CASCADE)
    experiment = models.OneToOneField(
        Experiment,
        related_name="experiment_grid",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class Message(models.Model):
    x_pos = models.IntegerField(default=0)
    y_pos = models.IntegerField(default=0)
    intensity = models.FloatField(default=0.0)
    is_last = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    grid = models.ForeignKey(
        Grid, related_name="grid_messages", on_delete=models.CASCADE
    )
