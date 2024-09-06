from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("users/", include("users.urls")),
    path("street-lights/", include("street_light_rl.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
] + static("/static/", document_root=settings.STATIC_ROOT)
