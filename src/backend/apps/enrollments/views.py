from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.enrollments.models import DersKaydi
from apps.enrollments.serializers import (
    DersKaydiOkuSerializer,
    DersKaydiOlusturSerializer,
    NotGuncellemeSerializer,
    TranskriptKaydiSerializer,
    TranskriptSerializer,
)
from apps.enrollments.services import EnrollmentService, GradeService
from apps.users.permissions import IsAkademisyen, IsOgrenci


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — kendi derslerini listele
#  GET /api/student/courses/
# ─────────────────────────────────────────────────────────────────────────────

class OgrenciDersListeView(APIView):
    """
    GET /api/student/courses/
    Oturum açan öğrencinin kayıtlı olduğu dersleri döner.
    Query params:
        yil   → ?yil=2024
        donem → ?donem=GUZ
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        ogrenci = request.user.ogrenci
        yil = request.query_params.get("yil")
        donem = request.query_params.get("donem")

        kayitlar = EnrollmentService.ogrenci_derslerini_listele(
            ogrenci=ogrenci,
            yil=yil,
            donem=donem,
        )
        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — transkript
#  GET /api/student/transcript/
# ─────────────────────────────────────────────────────────────────────────────

class OgrenciTranskriptView(APIView):
    """
    GET /api/student/transcript/
    Oturum açan öğrencinin onaylı derslerinden oluşan transkriptini döner.
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        ogrenci = request.user.ogrenci
        kayitlar = EnrollmentService.transkript_getir(ogrenci)

        data = {
            "ogrenci_no": ogrenci.ogr_no,
            "ogrenci_ad": ogrenci.user.tam_ad(),
            "bolum": ogrenci.bolum.ad,
            "sinif": ogrenci.sinif,
            "gpa": ogrenci.gpa,
            "kayitlar": TranskriptKaydiSerializer(kayitlar, many=True).data,
        }
        serializer = TranskriptSerializer(data)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — derse kayıt ol
#  POST /api/student/enrollments/
# ─────────────────────────────────────────────────────────────────────────────

class OgrenciDersKayitView(APIView):
    """
    POST /api/student/enrollments/
    Oturum açan öğrenciyi belirtilen döneme dersine kaydeder.
    Body: { "donem_dersi_id": <int> }
    """
    permission_classes = [IsOgrenci]

    def post(self, request):
        serializer = DersKaydiOlusturSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ogrenci = request.user.ogrenci

        try:
            kayit = EnrollmentService.ders_kaydi_olustur(
                ogrenci=ogrenci,
                donem_dersi_id=serializer.validated_data["donem_dersi_id"],
            )
        except ValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            DersKaydiOkuSerializer(kayit).data,
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — bekleyen kayıt isteklerini listele
#  GET /api/academician/enrollment-requests/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenKayitIstekleriView(APIView):
    """
    GET /api/academician/enrollment-requests/
    Akademisyenin derslerine ait bekleyen kayıt isteklerini döner.
    """
    permission_classes = [IsAkademisyen]

    def get(self, request):
        akademisyen = request.user.akademisyen
        kayitlar = EnrollmentService.bekleyen_kayitlari_listele(akademisyen)
        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — kayıt isteğini onayla / reddet
#  PATCH /api/academician/enrollment-requests/{id}/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenKayitIstekDetayView(APIView):
    """
    PATCH /api/academician/enrollment-requests/{id}/
    Kayıt isteğini onaylar veya reddeder.
    Body: { "durum": "onaylandi" } veya { "durum": "reddedildi" }
    """
    permission_classes = [IsAkademisyen]

    def patch(self, request, pk):
        akademisyen = request.user.akademisyen
        durum = request.data.get("durum")

        if durum not in [DersKaydi.Durum.ONAYLANDI, DersKaydi.Durum.REDDEDILDI]:
            return Response(
                {"detail": "Geçerli durum: 'onaylandi' veya 'reddedildi'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if durum == DersKaydi.Durum.ONAYLANDI:
                kayit = EnrollmentService.ders_kaydi_onayla(pk, akademisyen)
                return Response(DersKaydiOkuSerializer(kayit).data)
            else:
                EnrollmentService.ders_kaydi_reddet(pk, akademisyen)
                return Response({"detail": "Kayıt reddedildi."})
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — dersteki öğrenci listesi
#  GET /api/academician/courses/{id}/students/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenDersOgrencileriView(APIView):
    """
    GET /api/academician/courses/{id}/students/
    Akademisyenin belirtilen döneme dersine kayıtlı öğrencileri döner.
    """
    permission_classes = [IsAkademisyen]

    def get(self, request, pk):
        akademisyen = request.user.akademisyen

        try:
            kayitlar = EnrollmentService.donem_dersi_ogrenci_listesi(pk, akademisyen)
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)

        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — not gir / güncelle
#  PATCH /api/academician/grades/{id}/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenNotGirView(APIView):
    """
    PATCH /api/academician/grades/{id}/
    Onaylı kayda vize ve final notu girer, harf notunu ve GPA'yı otomatik günceller.
    Body: { "vize_notu": <int>, "final_notu": <int> }
    """
    permission_classes = [IsAkademisyen]

    def patch(self, request, pk):
        serializer = NotGuncellemeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        akademisyen = request.user.akademisyen

        try:
            kayit = GradeService.not_gir_guncelle(
                kayit_id=pk,
                vize_notu=serializer.validated_data["vize_notu"],
                final_notu=serializer.validated_data["final_notu"],
                akademisyen=akademisyen,
            )
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(DersKaydiOkuSerializer(kayit).data)