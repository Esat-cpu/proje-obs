from rest_framework import serializers
from .models import Ders, DonemDersi

from users.serializers import AkademisyenSerializer


class DersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ders
        fields = ["id", "ders_kodu", "ad", "kredi", "min_sinif"]


class DonemDersiSerializer(serializers.ModelSerializer):
    ders = DersSerializer(read_only=True)
    akademisyen = AkademisyenSerializer(read_only=True)

    class Meta:
        model = DonemDersi
        fields = ["id", "ders", "akademisyen", "yil", "donem", "kontenjan", "aktiflik_durumu"]
