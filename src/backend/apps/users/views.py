from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Akademisyen, Ogrenci
from apps.users.permissions import IsAkademisyen, IsOgrenci, IsYonetici
from apps.users.serializers import (
    AkademisyenOkuSerializer,
    OgrenciExcelSerializer,
    OgrenciOkuSerializer,
    UserSerializer,
)
from apps.users.services import UsersService

class BenimProfilView(RetrieveUpdateAPIView):
    """
    GET  /users/me/  → oturum açan kullanıcının profil bilgilerini döner
    PUT/PATCH        → ad, soyad, email gibi alanları günceller
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class OgrenciDetayView(APIView):
    """
    GET /users/ogrenciler/<pk>/
    Yönetici veya ilgili öğrencinin kendisi erişebilir.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ogrenci = UsersService.ogrenci_getir(pk)

        if request.user.role == "OGRENCI":
            try:
                if request.user.ogrenci.pk != ogrenci.pk:
                    return Response(
                        {"detail": "Bu kaydı görme yetkiniz yok."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            except Ogrenci.DoesNotExist:
                return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = OgrenciOkuSerializer(ogrenci)
        return Response(serializer.data)


class OgrenciListeView(APIView):
    """
    GET  /users/ogrenciler/   → tüm öğrencileri listeler (Yönetici / Akademisyen)
    POST /users/ogrenciler/   → yeni öğrenci oluşturur (Yönetici)
    """
    permission_classes = [IsYonetici | IsAkademisyen]

    def get(self, request):
        ogrenciler = Ogrenci.objects.select_related("user", "bolum").all()

        bolum_kodu = request.query_params.get("bolum_kodu")
        if bolum_kodu:
            ogrenciler = ogrenciler.filter(bolum__bolum_kodu=bolum_kodu)

        sinif = request.query_params.get("sinif")
        if sinif:
            ogrenciler = ogrenciler.filter(sinif=sinif)

        serializer = OgrenciOkuSerializer(ogrenciler, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != "YONETICI":
            return Response(
                {"detail": "Yalnızca yöneticiler öğrenci oluşturabilir."},
                status=status.HTTP_403_FORBIDDEN,
            )

        ad = request.data.get("ad")
        soyad = request.data.get("soyad")
        bolum_kodu = request.data.get("bolum_kodu")
        sinif = request.data.get("sinif", 1)

        if not all([ad, soyad, bolum_kodu]):
            return Response(
                {"detail": "ad, soyad ve bolum_kodu zorunludur."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ogrenci = UsersService.ogrenci_olustur(
            ad=ad, soyad=soyad, bolum_kodu=bolum_kodu, sinif=sinif
        )
        serializer = OgrenciOkuSerializer(ogrenci)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OgrenciExcelYukleView(APIView):
    """
    POST /users/ogrenciler/excel-yukle/
    Excel dosyasından toplu öğrenci kaydı oluşturur. Yalnızca Yönetici.
    """
    permission_classes = [IsYonetici]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = OgrenciExcelSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        dosya = serializer.validated_data["dosya"]
        sonuc = UsersService.ogrenci_kaydi_excel(dosya)
        return Response(sonuc, status=status.HTTP_200_OK)


class OgrenciGpaGuncelleView(APIView):
    """
    POST /users/ogrenciler/<pk>/gpa-guncelle/
    Öğrencinin GPA değerini onaylı kayıtlara göre yeniden hesaplar.
    Yönetici ve Akademisyen erişebilir.
    """
    permission_classes = [IsYonetici | IsAkademisyen]

    def post(self, request, pk):
        ogrenci = UsersService.ogrenci_getir(pk)
        yeni_gpa = UsersService.gpa_guncelle(ogrenci)
        return Response({"gpa": str(yeni_gpa)}, status=status.HTTP_200_OK)

class AkademisyenDetayView(APIView):
    """
    GET /users/akademisyenler/<pk>/
    Tüm kimlik doğrulamalı kullanıcılar erişebilir.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        akademisyen = UsersService.akademisyen_getir(pk)
        serializer = AkademisyenOkuSerializer(akademisyen)
        return Response(serializer.data)


class AkademisyenListeView(APIView):
    """
    GET /users/akademisyenler/
    Tüm kimlik doğrulamalı kullanıcılar erişebilir.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        akademisyenler = Akademisyen.objects.select_related("user", "bolum").all()

        bolum_kodu = request.query_params.get("bolum_kodu")
        if bolum_kodu:
            akademisyenler = akademisyenler.filter(bolum__bolum_kodu=bolum_kodu)

        serializer = AkademisyenOkuSerializer(akademisyenler, many=True)
        return Response(serializer.data)