from sl.views import robot_views
from sl.views import light_views
from sl.views import experiment_views
from sl.views import grid_views
from sl.views import message_views
from sl.views import mqtt_views
from django.urls import path

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
        "lights/<int:id>/experiments/",
        light_views.LightExperimentsListView.as_view(),
        name="light-experiments-list",
    ),
    path(
        "lights/<int:id>/grids/",
        light_views.LightGridsListView.as_view(),
        name="light-grids-list",
    ),
    path(
        "experiments/",
        experiment_views.ExperimentListCreateView.as_view(),
        name="experiment-list-create",
    ),
    path(
        "experiments/<int:id>/",
        experiment_views.ExperimentRetrieveUpdateView.as_view(),
        name="experiment-update",
    ),
    path(
        "experiments/<int:pk>/delete/",
        experiment_views.ExperimentDeleteView.as_view(),
        name="experiment-delete",
    ),
    path(
        "experiments/<int:id>/grids/",
        experiment_views.ExperimentGridListView.as_view(),
        name="experiment-grids-list",
    ),
    path("grids/", grid_views.GridsListView.as_view(), name="grid-list"),
    path("grids/<int:id>/", grid_views.GridUpdateView.as_view(), name="grid-update"),
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
]
