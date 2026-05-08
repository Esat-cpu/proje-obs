from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.serializers import DersSerializer, DonemDersiOkuSerializer
from apps.courses.services import CoursesService


class DersListesi(APIView):
    def get(self, request):
        sinif = request.query_params.get("sinif")
        if sinif is not None:
            try:
                sinif = int(sinif)
            except ValueError:
                return Response({"hata": "sinif parametresi sayı olmalıdır."}, status=status.HTTP_400_BAD_REQUEST)
        dersler = CoursesService.dersleri_listele(sinif=sinif)
        serializer = DersSerializer(dersler, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DersDetay(APIView):
    def get(self, request, ders_id):
        ders = CoursesService.ders_getir(ders_id)
        serializer = DersSerializer(ders)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DonemDersiListesi(APIView):
    def get(self, request):
        yil = request.query_params.get("yil")
        donem = request.query_params.get("donem")
        sadece_aktif = request.query_params.get("sadece_aktif", "false").lower() == "true"

        if yil is not None:
            try:
                yil = int(yil)
            except ValueError:
                return Response({"hata": "yil parametresi sayı olmalıdır."}, status=status.HTTP_400_BAD_REQUEST)

        donem_dersleri = CoursesService.donem_derslerini_listele(
            yil=yil,
            donem=donem,
            sadece_aktif=sadece_aktif,
        )
        serializer = DonemDersiOkuSerializer(donem_dersleri, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DonemDersiDetay(APIView):
    def get(self, request, donem_dersi_id):
        donem_dersi = CoursesService.donem_dersi_getir(donem_dersi_id)
        serializer = DonemDersiOkuSerializer(donem_dersi)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DonemDersiKontenjanDurumu(APIView):
    def get(self, request, donem_dersi_id):
        donem_dersi = CoursesService.donem_dersi_getir(donem_dersi_id)
        dolu_mu = CoursesService.kontenjan_dolu_mu(donem_dersi)
        return Response({"kontenjan_dolu": dolu_mu}, status=status.HTTP_200_OK)