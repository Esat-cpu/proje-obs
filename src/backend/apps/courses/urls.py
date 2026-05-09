from django.urls import path

from apps.courses.views import AkademisyenDersListeView, MevcutDersler

urlpatterns = [
    # GET /api/courses/available/
    path("courses/available/", MevcutDersler.as_view(), name="mevcut-dersler"),

    # GET /api/academician/courses/
    path("academician/courses/", AkademisyenDersListeView.as_view(), name="akademisyen-ders-liste"),
]
