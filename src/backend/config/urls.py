from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.authentication.urls")),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.courses.urls")),
    path("api/", include("apps.enrollments.urls")),
    path("api/", include("apps.departments.urls")),
]
