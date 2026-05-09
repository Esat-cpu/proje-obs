from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.serializers import DonemDersiOkuSerializer
from apps.courses.services import CoursesService
from apps.users.permissions import IsAkademisyen, IsOgrenci


class MevcutDersler(APIView):
    """
    GET /api/courses/available/
    Öğrencinin bölümüne ve sınıfına uygun, seçebileceği açık dönem derslerini döndürür.
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        ogrenci = request.user.ogrenci
        donem_dersleri = CoursesService.donem_derslerini_listele(
            sadece_aktif=True,
        ).filter(
            ders__min_sinif__lte=ogrenci.sinif,
            ders__bolum=ogrenci.bolum,
        )
        serializer = DonemDersiOkuSerializer(donem_dersleri, many=True)
        return Response(serializer.data)


class AkademisyenDersListeView(APIView):
    """
    GET /api/academician/courses/
    Akademisyenin aktif dönem derslerini listeler.
    """
    permission_classes = [IsAkademisyen]

    def get(self, request):
        akademisyen = request.user.akademisyen
        donem_dersleri = CoursesService.donem_derslerini_listele(
            akademisyen=akademisyen,
            sadece_aktif=True,
        )
        serializer = DonemDersiOkuSerializer(donem_dersleri, many=True)
        return Response(serializer.data)
