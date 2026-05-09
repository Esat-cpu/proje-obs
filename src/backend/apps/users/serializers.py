from rest_framework import serializers

from apps.departments.serializers import BolumSerializer
from apps.users.models import Akademisyen, Ogrenci, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "ad", "soyad", "email", "role"]
        read_only_fields = ["role"]


class OgrenciOkuSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bolum = BolumSerializer(read_only=True)
    toplam_kredi = serializers.SerializerMethodField()

    class Meta:
        model = Ogrenci
        fields = ["id", "user", "ogr_no", "bolum", "sinif", "gpa", "toplam_kredi"]

    def get_toplam_kredi(self, obj):
        from apps.enrollments.models import DersKaydi
        return sum(
            k.donem_dersi.ders.kredi
            for k in DersKaydi.objects.filter(
                ogrenci=obj,
                onay_durumu=DersKaydi.Durum.ONAYLANDI,
            ).select_related("donem_dersi__ders")
        )


class OgrenciExcelSerializer(serializers.Serializer):
    dosya = serializers.FileField()

    def validate_dosya(self, deger):
        if not deger.name.endswith((".xlsx", ".xls")):
            raise serializers.ValidationError("Yalnızca Excel dosyası yüklenebilir.")
        return deger


class AkademisyenOkuSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bolum = BolumSerializer(read_only=True)
    unvan_goster = serializers.CharField(source="get_unvan_display", read_only=True)
    ders_sayisi = serializers.SerializerMethodField()
    ogrenci_sayisi = serializers.SerializerMethodField()

    class Meta:
        model = Akademisyen
        fields = ["id", "user", "bolum", "unvan", "unvan_goster", "ders_sayisi", "ogrenci_sayisi"]

    def get_ders_sayisi(self, obj):
        from apps.courses.models import DonemDersi
        return DonemDersi.objects.filter(akademisyen=obj, aktiflik_durumu=True).count()

    def get_ogrenci_sayisi(self, obj):
        from apps.enrollments.models import DersKaydi
        return DersKaydi.objects.filter(
            donem_dersi__akademisyen=obj,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        ).values("ogrenci").distinct().count()
