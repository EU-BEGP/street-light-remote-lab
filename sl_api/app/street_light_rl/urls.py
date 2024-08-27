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
        path( # Returns all grids in the database.
        "grids/",
        views.GridsView.as_view(),
        name="grids",
    ),
        path(
        "messages/", # Returns all messages in the database.
        views.MessagesView.as_view(),
        name="messages",
    ),
        path( # Updates an existing message object.
        "message/<int:id>/",
        views.UpdateMessage.as_view(),
        name="message",
    ),
        path( # Updates an existing grid object.
        "grid/<int:grid_id>/",
        views.UpdateGrid.as_view(),
        name="grid",
    ),
        path( # Updates an existing experiment object.
        "experiment/<int:id>/",
        views.UpdateExperiment.as_view(),
        name="experiment",
    ),
        path( # Updates an existing robot object.
        "robot/<str:robot_id>/",
        views.UpdateRobot.as_view(),
        name="robot",
    ),
]
