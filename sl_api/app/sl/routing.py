from django.urls import re_path
from . import consumers
import os

env = os.environ.get("ENVIRONMENT")

robot_path = (
    r"sl/api/robot-information/$" if env == "production" else r"sl/robot-information/$"
)

light_path = (
    r"sl/api/light-information/$" if env == "production" else r"sl/light-information/$"
)

websocket_urlpatterns = [
    re_path(robot_path, consumers.RobotInformationConsumer.as_asgi()),
    re_path(light_path, consumers.LightInformationConsumer.as_asgi()),
]
