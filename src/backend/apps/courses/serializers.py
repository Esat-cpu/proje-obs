from rest_framework import serializers

from apps.courses.models import Ders, DonemDersi
from apps.departments.serializers import BolumSerializer


class DersSerializer(serializers.ModelSerializer):
    bolum = BolumSerializer(read_only=True)

    class Meta:
        model = Ders
        fields = ["id", "ders_kodu", "ad", "kredi", "min_sinif", "bolum"]


class DonemDersiOkuSerializer(serializers.ModelSerializer):
    ders = DersSerializer(read_only=True)
    akademisyen_ad = serializers.SerializerMethodField()
    ogrenci_sayisi = serializers.SerializerMethodField()

    class Meta:
        model = DonemDersi
        fields = ["id", "ders", "akademisyen_ad", "yil", "donem", "kontenjan", "ogrenci_sayisi", "aktiflik_durumu"]

    def get_akademisyen_ad(self, obj):
        return str(obj.akademisyen)

    def get_ogrenci_sayisi(self, obj):
        from apps.enrollments.models import DersKaydi
        return DersKaydi.objects.filter(
            donem_dersi=obj,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        ).count()
