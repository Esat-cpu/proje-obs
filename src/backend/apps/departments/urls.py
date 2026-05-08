from django.urls import path

from apps.departments.views import BolumDetayView, BolumKoduDetayView, BolumListesiView

urlpatterns = [
    path("", BolumListesiView.as_view(), name="bolum-listesi"),
    path("<int:bolum_id>/", BolumDetayView.as_view(), name="bolum-detay"),
    path("kod/<str:bolum_kodu>/", BolumKoduDetayView.as_view(), name="bolum-kodu-detay"),
]