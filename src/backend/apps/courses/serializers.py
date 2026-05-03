from rest_framework import serializers

from apps.courses.models import Ders, DonemDersi


class DersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ders
        fields = ["id", "ders_kodu", "ad", "kredi", "min_sinif"]


class DonemDersiOkuSerializer(serializers.ModelSerializer):
    ders = DersSerializer(read_only=True)
    akademisyen_ad = serializers.SerializerMethodField()

    class Meta:
        model = DonemDersi
        fields = ["id", "ders", "akademisyen_ad", "yil", "donem", "kontenjan", "aktiflik_durumu"]

    def get_akademisyen_ad(self, obj):
        return str(obj.akademisyen)


class DonemDersiYazSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonemDersi
        fields = ["id", "ders", "akademisyen", "yil", "donem", "kontenjan"]

    def validate(self, veriler):
        ders = veriler.get("ders")
        akademisyen = veriler.get("akademisyen")
        if ders and akademisyen and ders.min_sinif and akademisyen.bolum != ders.bolum if hasattr(ders, "bolum") else False:
            raise serializers.ValidationError("Akademisyen bu dersi veremez.")
        return veriler