from rest_framework import serializers

from apps.users.models import Akademisyen, Ogrenci, User, Yonetici


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


class OgrenciYazSerializer(serializers.Serializer):
    ad = serializers.CharField(max_length=100)
    soyad = serializers.CharField(max_length=100)
    bolum_kodu = serializers.CharField(max_length=20)
    sinif = serializers.IntegerField(min_value=1, max_value=8, default=1)
    sifre = serializers.CharField(required=False, write_only=True)


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


class AkademisyenYazSerializer(serializers.Serializer):
    ad = serializers.CharField(max_length=100)
    soyad = serializers.CharField(max_length=100)
    bolum_kodu = serializers.CharField(max_length=20)
    unvan = serializers.ChoiceField(choices=Akademisyen.Unvan.choices)
    sifre = serializers.CharField(required=False, write_only=True)


class YoneticiSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Yonetici
        fields = ["id", "user"]