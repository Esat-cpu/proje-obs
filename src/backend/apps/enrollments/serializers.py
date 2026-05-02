from rest_framework import serializers

from .models import DersKaydi

from users.serializers import OgrenciSerializer
from courses.serializers import DonemDersiSerializer


class DersKaydiSerializer(serializers.ModelSerializer):
    ogrenci = OgrenciSerializer(read_only=True)
    donem_dersi = DonemDersiSerializer(read_only=True)

    ortalama = serializers.ReadOnlyField()
    harf_notu = serializers.ReadOnlyField()

    class Meta:
        model = DersKaydi
        fields = [
            "id",
            "ogrenci",
            "donem_dersi",
            "vize_notu",
            "final_notu",
            "harf_notu",
            "onay_durumu",
            "ortalama",
        ]

class DersKaydiCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DersKaydi
        fields = ["donem_dersi"]

class DersKaydiUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DersKaydi
        fields = ["vize_notu", "final_notu", "onay_durumu"]
