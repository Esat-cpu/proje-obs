from django.urls import path

from apps.departments.views import BolumListView

app_name = "departments"

urlpatterns = [
    # GET /api/departments/
    path("departments/", BolumListView.as_view(), name="bolum-liste"),
]
