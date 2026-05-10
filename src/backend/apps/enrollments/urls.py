from django.urls import path

from apps.enrollments.views import (
    AkademisyenDersOgrencileriView,
    AkademisyenKayitIstekleriView,
    AkademisyenKayitIstekDetayView,
    AkademisyenNotGirView,
    OgrenciDersKayitView,
    OgrenciDersListeView,
    OgrenciTranskriptView,
    OgrenciTranskriptPDFView,
)

app_name = "enrollments"

urlpatterns = [

    # ── Öğrenci ───────────────────────────────────────────────────────────────
    # GET  /api/student/courses/
    path("student/courses/", OgrenciDersListeView.as_view(), name="ogrenci-ders-liste"),

    # GET  /api/student/transcript/
    path("student/transcript/", OgrenciTranskriptView.as_view(), name="ogrenci-transkript"),

    # GET /api/student/transcript/pdf/
    path('student/transcript/pdf/', OgrenciTranskriptPDFView.as_view(), name='ogrenci-transkript-pdf'),

    # POST /api/student/enrollments/
    path("student/enrollments/", OgrenciDersKayitView.as_view(), name="ogrenci-ders-kayit"),

    # ── Akademisyen ───────────────────────────────────────────────────────────
    # GET   /api/academician/enrollment-requests/
    path("academician/enrollment-requests/", AkademisyenKayitIstekleriView.as_view(), name="akademisyen-kayit-istekleri"),

    # PATCH /api/academician/enrollment-requests/{id}/
    path("academician/enrollment-requests/<int:pk>/", AkademisyenKayitIstekDetayView.as_view(), name="akademisyen-kayit-istek-detay"),

    # GET   /api/academician/courses/{id}/students/
    path("academician/courses/<int:pk>/students/", AkademisyenDersOgrencileriView.as_view(), name="akademisyen-ders-ogrenciler"),

    # PATCH /api/academician/grades/{id}/
    path("academician/grades/<int:pk>/", AkademisyenNotGirView.as_view(), name="akademisyen-not-gir"),
]
