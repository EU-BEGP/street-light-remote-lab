from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r"sl/robot-information/$",
        consumers.RobotInformationConsumer.as_asgi(),
    ),
    re_path(
        r"sl/light-information/$",
        consumers.LightInformationConsumer.as_asgi(),
    ),
]
