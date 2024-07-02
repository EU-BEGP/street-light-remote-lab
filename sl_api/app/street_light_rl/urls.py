from django.urls import path
from . import views

app_name = "street_light_rl"

urlpatterns = [
    path("robots/", views.RobotListView.as_view(), name="robot-list"),
    path(
        "robots/<str:robot_id>/messages/",
        views.RobotMessagesView.as_view(),
        name="robot-messages",
    ),
    path(
        "robots/<str:robot_id>/experiments/",
        views.RobotExperimentsView.as_view(),
        name="robot-experiments",
    ),
    path(
        "experiments/<int:id>/messages/",
        views.ExperimentMessagesView.as_view(),
        name="experiment-messages",
    ),
]
