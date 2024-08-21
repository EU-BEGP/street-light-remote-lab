from django.urls import path
from . import views

app_name = "street_light_rl"

urlpatterns = [
    path("robots/", views.RobotListView.as_view(), name="robot-list"),
    path(
        "robots/<str:robot_id>/experiments/",
        views.RobotExperimentsView.as_view(),
        name="robot-experiments",
    ),
    path("experiments/", views.ExperimentListView.as_view(), name="experiment-list"),
    path(
        "robots/<str:robot_id>/grids/",
        views.RobotGridsView.as_view(),
        name="robot-grids",
    ),
    path(
        "experiments/<int:id>/grids/",
        views.ExperimentGridsView.as_view(),
        name="experiment-grids",
    ),
    path("request-grid/", views.RequestGridMQTT.as_view(), name="request-grid"),
    path(
        "light-properties/",
        views.LightPropertiesMQTT.as_view(),
        name="light-properties",
    ),
]
