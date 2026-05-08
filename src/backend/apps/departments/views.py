from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.departments.serializers import BolumSerializer
from apps.departments.services import DepartmentsService


class BolumListesiView(APIView):
    """
    GET  /api/departments/        → Tüm bölümleri listele
    POST /api/departments/        → Yeni bölüm oluştur
    """

    def get(self, request):
        bolumler = DepartmentsService.bolum_listesi_getir()
        serializer = BolumSerializer(bolumler, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BolumSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BolumDetayView(APIView):
    """
    GET    /api/departments/<id>/  → Bölüm detayı
    PUT    /api/departments/<id>/  → Bölüm güncelle
    DELETE /api/departments/<id>/  → Bölüm sil
    """

    def get(self, request, bolum_id):
        bolum = DepartmentsService.bolum_getir(bolum_id)
        serializer = BolumSerializer(bolum)
        return Response(serializer.data)

    def put(self, request, bolum_id):
        bolum = DepartmentsService.bolum_getir(bolum_id)
        serializer = BolumSerializer(bolum, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, bolum_id):
        bolum = DepartmentsService.bolum_getir(bolum_id)
        bolum.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BolumKoduDetayView(APIView):
    """
    GET /api/departments/kod/<bolum_kodu>/  → Bölüm kodu ile getir
    """

    def get(self, request, bolum_kodu):
        bolum = DepartmentsService.bolum_kodu_ile_getir(bolum_kodu)
        serializer = BolumSerializer(bolum)
        return Response(serializer.data)