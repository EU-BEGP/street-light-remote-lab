# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from django.conf import settings
from django.db import models


class Light(models.Model):
    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(
        max_length=10,
        choices=(
            ("DC", "Direct Current"),
            ("AC", "Alternating Current"),
            ("AC_INV", "Alternating Current with Inverter"),
        ),
    )
    pwm = models.FloatField(default=0.0)
    time_interval = models.FloatField(default=0.0)

    # DC-specific fields
    dc_voltage = models.FloatField(default=0.0, null=True, blank=True)
    dc_current = models.FloatField(default=0.0, null=True, blank=True)
    dc_power = models.FloatField(default=0.0, null=True, blank=True)
    dc_energy_consumption = models.FloatField(default=0.0, null=True, blank=True)
    dc_energy_charge = models.FloatField(default=0.0, null=True, blank=True)
    dc_level = models.FloatField(default=0.0, null=True, blank=True)

    # AC-specific fields
    ac_voltage = models.FloatField(default=0.0, null=True, blank=True)
    ac_current = models.FloatField(default=0.0, null=True, blank=True)
    ac_power = models.FloatField(default=0.0, null=True, blank=True)
    ac_energy = models.FloatField(default=0.0, null=True, blank=True)
    ac_frequency = models.FloatField(default=0.0, null=True, blank=True)
    ac_factor = models.FloatField(default=0.0)


class Robot(models.Model):
    code = models.CharField(max_length=50, unique=True)
    light = models.OneToOneField(
        Light,
        related_name="light_robot",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class Grid(models.Model):
    code = models.UUIDField(unique=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
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
