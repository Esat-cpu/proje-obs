from django.urls import path

from apps.users.views import (
    AkademisyenDetayView,
    AkademisyenListeView,
    BenimProfilView,
    OgrenciDetayView,
    OgrenciExcelYukleView,
    OgrenciGpaGuncelleView,
    OgrenciListeView,
)

app_name = "users"

urlpatterns = [
    # Profil
    path("me/", BenimProfilView.as_view(), name="benim-profilim"),

    # Öğrenci
    path("ogrenciler/", OgrenciListeView.as_view(), name="ogrenci-liste"),
    path("ogrenciler/excel-yukle/", OgrenciExcelYukleView.as_view(), name="ogrenci-excel-yukle"),
    path("ogrenciler/<int:pk>/", OgrenciDetayView.as_view(), name="ogrenci-detay"),
    path("ogrenciler/<int:pk>/gpa-guncelle/", OgrenciGpaGuncelleView.as_view(), name="ogrenci-gpa-guncelle"),

    # Akademisyen
    path("akademisyenler/", AkademisyenListeView.as_view(), name="akademisyen-liste"),
    path("akademisyenler/<int:pk>/", AkademisyenDetayView.as_view(), name="akademisyen-detay"),
]