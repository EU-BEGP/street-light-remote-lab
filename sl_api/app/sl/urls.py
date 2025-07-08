# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from django.urls import path
from sl.views import grid_views
from sl.views import light_views
from sl.views import message_views
from sl.views import mqtt_views
from sl.views import robot_views
from sl.views import camera_views

app_name = "sl"

urlpatterns = [
    path(
        "robots/", robot_views.RobotListCreateView.as_view(), name="robot-list-create"
    ),
    path(
        "robots/<int:id>/", robot_views.RobotUpdateView.as_view(), name="robot-update"
    ),
    path(
        "lights/", light_views.LightListCreateView.as_view(), name="light-list-create"
    ),
    path(
        "lights/<int:id>/", light_views.LightUpdateView.as_view(), name="light-update"
    ),
    path(
        "lights/<int:id>/grids/",
        light_views.LightGridsListView.as_view(),
        name="light-grids-list",
    ),
    path("grids/", grid_views.GridsListView.as_view(), name="grid-list"),
    path(
        "grids/<int:id>/",
        grid_views.GridRetrieveUpdateView.as_view(),
        name="grid-update",
    ),
    path(
        "grids/<int:id>/distribution-simulation/",
        grid_views.GridDistributionSimulationView.as_view(),
        name="grid-distribution-simulation",
    ),
    path(
        "grids/uc-parameters/",
        grid_views.UltraConcurrentParametersView.as_view(),
        name="grid-uc-parameters",
    ),
    path(
        "grids/uc-search/",
        grid_views.UltraConcurrentSearchView.as_view(),
        name="grid-uc-search",
    ),
    path(
        "messages/",
        message_views.MessageListCreateView.as_view(),
        name="message-list-create",
    ),
    path(
        "messages/<int:id>/",
        message_views.MessageUpdateView.as_view(),
        name="message-update",
    ),
    path(
        "mqtt/robot/",
        mqtt_views.PublishRobotCommand.as_view(),
        name="mqtt-publish-robot-command",
    ),
    path(
        "mqtt/light/",
        mqtt_views.PublishLightCommand.as_view(),
        name="mqtt-publish-light-command",
    ),
    path(
        "camera/move/",
        camera_views.MoveCameraView.as_view(),
        name="camera-move"
    ),
    path(
        "camera/stop/",
        camera_views.StopCameraView.as_view(),
        name="camera-stop"
    ),
]
