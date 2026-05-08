from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.enrollments.serializers import (
    DersKaydiOkuSerializer,
    DersKaydiOlusturSerializer,
    NotGuncellemeSerializer,
    TranskriptSerializer,
    TranskriptKaydiSerializer,
)
from apps.enrollments.services import EnrollmentService, GradeService


class OgrenciDersKayitListesiView(APIView):
    """
    GET  /api/enrollments/ogrenci/           → Öğrencinin kayıtlı derslerini listele
    POST /api/enrollments/ogrenci/           → Derse kayıt ol
    """

    def get(self, request):
        ogrenci = request.user.ogrenci
        yil = request.query_params.get("yil")
        donem = request.query_params.get("donem")
        kayitlar = EnrollmentService.ogrenci_derslerini_listele(ogrenci, yil=yil, donem=donem)
        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DersKaydiOlusturSerializer(data=request.data)
        if serializer.is_valid():
            try:
                kayit = EnrollmentService.ders_kaydi_olustur(
                    ogrenci=request.user.ogrenci,
                    donem_dersi_id=serializer.validated_data["donem_dersi_id"],
                )
                return Response(DersKaydiOkuSerializer(kayit).data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OgrenciTranskriptView(APIView):
    """
    GET /api/enrollments/ogrenci/transkript/  → Öğrencinin transkriptini getir
    """

    def get(self, request):
        ogrenci = request.user.ogrenci
        kayitlar = EnrollmentService.transkript_getir(ogrenci)
        data = {
            "ogrenci_no": ogrenci.ogr_no,
            "ogrenci_ad": ogrenci.user.tam_ad,
            "bolum": str(ogrenci.bolum),
            "sinif": ogrenci.sinif,
            "gpa": ogrenci.gpa,
            "kayitlar": TranskriptKaydiSerializer(kayitlar, many=True).data,
        }
        serializer = TranskriptSerializer(data)
        return Response(serializer.data)


class AkademisyenBekleyenKayitlarView(APIView):
    """
    GET /api/enrollments/akademisyen/bekleyen/  → Bekleyen kayıtları listele
    """

    def get(self, request):
        akademisyen = request.user.akademisyen
        kayitlar = EnrollmentService.bekleyen_kayitlari_listele(akademisyen)
        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


class DersKaydiOnayRedView(APIView):
    """
    POST /api/enrollments/akademisyen/<kayit_id>/onayla/  → Kaydı onayla
    POST /api/enrollments/akademisyen/<kayit_id>/reddet/  → Kaydı reddet
    """

    def post(self, request, kayit_id, action):
        akademisyen = request.user.akademisyen
        try:
            if action == "onayla":
                kayit = EnrollmentService.ders_kaydi_onayla(kayit_id, akademisyen)
                return Response(DersKaydiOkuSerializer(kayit).data)
            elif action == "reddet":
                EnrollmentService.ders_kaydi_reddet(kayit_id, akademisyen)
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"detail": "Geçersiz işlem."}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)


class DonemDersiOgrenciListesiView(APIView):
    """
    GET /api/enrollments/akademisyen/donem-dersi/<donem_dersi_id>/ogrenciler/
    → Dönem dersine kayıtlı öğrencileri listele
    """

    def get(self, request, donem_dersi_id):
        akademisyen = request.user.akademisyen
        kayitlar = EnrollmentService.donem_dersi_ogrenci_listesi(donem_dersi_id, akademisyen)
        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


class NotGuncellemeView(APIView):
    """
    PUT /api/enrollments/akademisyen/kayit/<kayit_id>/not/  → Not gir/güncelle
    """

    def put(self, request, kayit_id):
        serializer = NotGuncellemeSerializer(data=request.data)
        if serializer.is_valid():
            try:
                kayit = GradeService.not_gir_guncelle(
                    kayit_id=kayit_id,
                    vize_notu=serializer.validated_data["vize_notu"],
                    final_notu=serializer.validated_data["final_notu"],
                    akademisyen=request.user.akademisyen,
                )
                return Response(DersKaydiOkuSerializer(kayit).data)
            except (PermissionDenied, ValidationError) as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)