from django.urls import path

from apps.users.views import AkademisyenProfilView, MeView, OgrenciProfilView

app_name = "users"

urlpatterns = [
    # GET /api/me/
    path("me/", MeView.as_view(), name="me"),

    # GET /api/student/profile/
    path("student/profile/", OgrenciProfilView.as_view(), name="ogrenci-profil"),

    # GET /api/academician/profile/
    path("academician/profile/", AkademisyenProfilView.as_view(), name="akademisyen-profil"),
]
