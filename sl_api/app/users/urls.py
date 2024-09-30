from django.urls import path
from users import views

app_name = "users"

urlpatterns = [
    path("signup/", views.CreateUserView.as_view(), name="create"),
    path("token/", views.CreateTokenView.as_view(), name="token"),
    path("me/", views.ManageUserView.as_view(), name="me"),
    path(
        "activate-account/",
        views.ActivateUserAccount.as_view(),
        name="activate-account",
    ),
    path(
        "request-code/",
        views.RequestVerificationCode.as_view(),
        name="request-code",
    ),
]
