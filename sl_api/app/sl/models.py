from django.conf import settings
from django.db import models


class Light(models.Model):
    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(
        max_length=2, choices=(("AC", "Alternating Current"), ("DC", "Direct Current"))
    )
    pwm = models.FloatField(default=0.0)
    voltage = models.FloatField(default=0.0)
    current = models.FloatField(default=0.0)
    time_interval = models.FloatField(default=0.0)
    power = models.FloatField(default=0.0)
    energy = models.FloatField(default=0.0)
    frequency = models.FloatField(default=0.0)
    factor = models.FloatField(default=0.0)
    power_consumption = models.FloatField(default=0.0)
    power_charge = models.FloatField(default=0.0)
    energy_consumption = models.FloatField(default=0.0)
    energy_charge = models.FloatField(default=0.0)


class Robot(models.Model):
    code = models.CharField(max_length=50, unique=True)
    light = models.OneToOneField(
        Light,
        related_name="light_robot",
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
    light = models.ForeignKey(
        Light, related_name="light_experiments", on_delete=models.CASCADE
    )


class Grid(models.Model):
    code = models.UUIDField(unique=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    experiment = models.ForeignKey(
        Experiment,
        related_name="experiment_grids",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    light = models.ForeignKey(
        Light, related_name="light_grids", on_delete=models.CASCADE
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
