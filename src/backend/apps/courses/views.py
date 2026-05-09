from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.serializers import DonemDersiOkuSerializer
from apps.courses.services import CoursesService


class MevcutDersler(APIView):
    """
    GET /api/courses/available/
    Öğrencinin bölümüne ve sınıfına uygun, seçebileceği açık dönem derslerini döndürür.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            ogrenci = request.user.ogrenci
        except AttributeError:
            return Response(
                {"hata": "Bu endpoint yalnızca öğrenciler içindir."},
                status=status.HTTP_403_FORBIDDEN,
            )

        donem_dersleri = CoursesService.donem_derslerini_listele(
            sadece_aktif=True,
        ).filter(
            ders__min_sinif__lte=ogrenci.sinif,
            ders__bolum=ogrenci.bolum,
        )

        serializer = DonemDersiOkuSerializer(donem_dersleri, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)