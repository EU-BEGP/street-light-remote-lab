from street_light_rl.views import robot_views
from street_light_rl.views import lamp_views
from street_light_rl.views import experiment_views
from street_light_rl.views import grid_views
from street_light_rl.views import message_views
from street_light_rl.views import mqtt_views
from django.urls import path

app_name = "street_light_rl"

urlpatterns = [
    path(
        "robots/", robot_views.RobotListCreateView.as_view(), name="robot-list-create"
    ),
    path(
        "robots/<int:id>/", robot_views.RobotUpdateView.as_view(), name="robot-update"
    ),
    path("lamps/", lamp_views.LampListCreateView.as_view(), name="lamp-list-create"),
    path("lamps/<int:id>/", lamp_views.LampUpdateView.as_view(), name="lamp-update"),
    path(
        "lamps/<int:id>/experiments/",
        lamp_views.LampExperimentsListView.as_view(),
        name="lamp-experiments-list",
    ),
    path(
        "lamps/<int:id>/grids/",
        lamp_views.LampGridsListView.as_view(),
        name="lamp-grids-list",
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
        "experiments/<int:id>/grid/",
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
    path("mqtt/grid/", mqtt_views.GetGridMQTT.as_view(), name="mqtt-get-grid"),
    path(
        "mqtt/light-properties/",
        mqtt_views.SetLightPropertiesMQTT.as_view(),
        name="mqtt-set-light-properties",
    ),
]
