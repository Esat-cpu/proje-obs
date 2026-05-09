from django.urls import path

from apps.courses.views import MevcutDersler

urlpatterns = [
    path("available/", MevcutDersler.as_view(), name="mevcut-dersler"),
]