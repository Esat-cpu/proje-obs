from rest_framework import serializers

from apps.users.models import Akademisyen, Ogrenci, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "ad", "soyad", "email", "role"]
        read_only_fields = ["role"]


class OgrenciOkuSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bolum_ad = serializers.CharField(source="bolum.ad", read_only=True)
    bolum_kodu = serializers.CharField(source="bolum.bolum_kodu", read_only=True)

    class Meta:
        model = Ogrenci
        fields = ["id", "user", "ogr_no", "bolum_ad", "bolum_kodu", "sinif", "gpa"]


class OgrenciExcelSerializer(serializers.Serializer):
    dosya = serializers.FileField()

    def validate_dosya(self, deger):
        if not deger.name.endswith((".xlsx", ".xls")):
            raise serializers.ValidationError("Yalnızca Excel dosyası yüklenebilir.")
        return deger


class AkademisyenOkuSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bolum_ad = serializers.CharField(source="bolum.ad", read_only=True)
    bolum_kodu = serializers.CharField(source="bolum.bolum_kodu", read_only=True)
    unvan_goster = serializers.CharField(source="get_unvan_display", read_only=True)

    class Meta:
        model = Akademisyen
        fields = ["id", "user", "bolum_ad", "bolum_kodu", "unvan", "unvan_goster"]
