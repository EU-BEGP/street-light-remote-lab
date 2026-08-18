# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

import os

from django.core.management.base import BaseCommand, CommandError
from sl.models import Light, Robot
from users.models import User

SUPERUSER_EMAIL = os.environ.get("DEMO_SUPERUSER_EMAIL")
SUPERUSER_PASSWORD = os.environ.get("DEMO_SUPERUSER_PASSWORD")

MONITORING_LIGHT_CODES = ["light_01", "light_02", "light_03", "light_04", "light_05"]
CONTROLLED_LIGHT_CODE = "light_06"
ROBOT_CODE = "robot_01"


class Command(BaseCommand):
    help = "Seeds the demo superuser, lights and robot used by the local test setup"

    def handle(self, *args, **options):
        if not SUPERUSER_EMAIL or not SUPERUSER_PASSWORD:
            raise CommandError(
                "DEMO_SUPERUSER_EMAIL and DEMO_SUPERUSER_PASSWORD must be set in the environment"
            )

        if User.objects.filter(email=SUPERUSER_EMAIL).exists():
            self.stdout.write(f"Superuser {SUPERUSER_EMAIL} already exists")
        else:
            user = User.objects.create_superuser(SUPERUSER_EMAIL, SUPERUSER_PASSWORD)
            user.name = "Admin"
            user.last_name = "User"
            user.save()
            self.stdout.write(f"Created superuser {SUPERUSER_EMAIL}")

        for code in MONITORING_LIGHT_CODES:
            _, created = Light.objects.get_or_create(code=code, defaults={"type": "DC"})
            self.stdout.write(f"Light {code}: {'created' if created else 'already exists'}")

        controlled_light, created = Light.objects.get_or_create(
            code=CONTROLLED_LIGHT_CODE, defaults={"type": "DC"}
        )
        self.stdout.write(
            f"Light {CONTROLLED_LIGHT_CODE}: {'created' if created else 'already exists'}"
        )

        _, created = Robot.objects.get_or_create(
            code=ROBOT_CODE, defaults={"light": controlled_light}
        )
        self.stdout.write(f"Robot {ROBOT_CODE}: {'created' if created else 'already exists'}")
