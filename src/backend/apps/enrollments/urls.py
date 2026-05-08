from django.urls import path

from apps.enrollments.views import (
    OgrenciDersKayitListesiView,
    OgrenciTranskriptView,
    AkademisyenBekleyenKayitlarView,
    DersKaydiOnayRedView,
    DonemDersiOgrenciListesiView,
    NotGuncellemeView,
)

urlpatterns = [
    # Öğrenci endpoint'leri
    path("ogrenci/", OgrenciDersKayitListesiView.as_view(), name="ogrenci-kayit-listesi"),
    path("ogrenci/transkript/", OgrenciTranskriptView.as_view(), name="ogrenci-transkript"),

    # Akademisyen endpoint'leri
    path("akademisyen/bekleyen/", AkademisyenBekleyenKayitlarView.as_view(), name="bekleyen-kayitlar"),
    path("akademisyen/<int:kayit_id>/<str:action>/", DersKaydiOnayRedView.as_view(), name="kayit-onay-red"),
    path("akademisyen/donem-dersi/<int:donem_dersi_id>/ogrenciler/", DonemDersiOgrenciListesiView.as_view(), name="donem-dersi-ogrenciler"),
    path("akademisyen/kayit/<int:kayit_id>/not/", NotGuncellemeView.as_view(), name="not-guncelle"),
]