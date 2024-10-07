from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"street-lights/messages/$", consumers.MessageConsumer.as_asgi()),
    re_path(
        r"street-lights/light-information/$",
        consumers.LightInformationConsumer.as_asgi(),
    ),
]
