from django.urls import path

from apps.courses.views import (
    DersDetay,
    DersListesi,
    DonemDersiDetay,
    DonemDersiKontenjanDurumu,
    DonemDersiListesi,
)

urlpatterns = [
    path("dersler/",                                        DersListesi.as_view(),               name="ders-listesi"),
    path("dersler/<int:ders_id>/",                          DersDetay.as_view(),                 name="ders-detay"),
    path("donem-dersleri/",                                 DonemDersiListesi.as_view(),          name="donem-dersi-listesi"),
    path("donem-dersleri/<int:donem_dersi_id>/",            DonemDersiDetay.as_view(),            name="donem-dersi-detay"),
    path("donem-dersleri/<int:donem_dersi_id>/kontenjan/",  DonemDersiKontenjanDurumu.as_view(),  name="donem-dersi-kontenjan"),
]