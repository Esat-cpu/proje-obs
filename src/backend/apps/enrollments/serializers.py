from rest_framework import serializers

from apps.enrollments.models import DersKaydi, DersKayitDonemi


class DersKayitDonemiSerializer(serializers.ModelSerializer):
    aktif = serializers.SerializerMethodField()
    max_kredi = serializers.SerializerMethodField()

    class Meta:
        model = DersKayitDonemi
        fields = ["yil", "donem", "baslangic", "bitis", "aktif", "max_kredi"]

    def get_aktif(self, obj):
        return obj.aktif_mi()

    def get_max_kredi(self, obj):
        from apps.enrollments.services import MAX_KREDI
        return MAX_KREDI


class DersKaydiOkuSerializer(serializers.ModelSerializer):
    ogrenci_ad = serializers.CharField(source="ogrenci.user.tam_ad", read_only=True)
    ogrenci_no = serializers.CharField(source="ogrenci.ogr_no", read_only=True)
    ders_ad = serializers.CharField(source="donem_dersi.ders.ad", read_only=True)
    ders_kodu = serializers.CharField(source="donem_dersi.ders.ders_kodu", read_only=True)
    kredi = serializers.IntegerField(source="donem_dersi.ders.kredi", read_only=True)
    yil = serializers.IntegerField(source="donem_dersi.yil", read_only=True)
    donem = serializers.CharField(source="donem_dersi.donem", read_only=True)
    akademisyen_ad = serializers.CharField(source="donem_dersi.akademisyen", read_only=True)
    ortalama = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    onay_durumu = serializers.ChoiceField(choices=DersKaydi.Durum.choices, read_only=True)

    class Meta:
        model = DersKaydi
        fields = [
            "id",
            "ogrenci_ad", "ogrenci_no",
            "ders_ad", "ders_kodu", "kredi",
            "yil", "donem", "akademisyen_ad",
            "vize_notu", "final_notu", "ortalama", "harf_notu",
            "onay_durumu",
        ]


class DersKaydiOlusturSerializer(serializers.Serializer):
    donem_dersi_id = serializers.IntegerField()


class NotGuncellemeSerializer(serializers.Serializer):
    vize_notu = serializers.IntegerField(min_value=0, max_value=100)
    final_notu = serializers.IntegerField(min_value=0, max_value=100)


class TranskriptKaydiSerializer(serializers.ModelSerializer):
    ders_ad = serializers.CharField(source="donem_dersi.ders.ad", read_only=True)
    ders_kodu = serializers.CharField(source="donem_dersi.ders.ders_kodu", read_only=True)
    kredi = serializers.IntegerField(source="donem_dersi.ders.kredi", read_only=True)
    yil = serializers.IntegerField(source="donem_dersi.yil", read_only=True)
    donem = serializers.CharField(source="donem_dersi.donem", read_only=True)
    ortalama = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = DersKaydi
        fields = [
            "id",
            "ders_ad", "ders_kodu", "kredi",
            "yil", "donem",
            "vize_notu", "final_notu", "ortalama", "harf_notu",
        ]


class DonemOzetiSerializer(serializers.Serializer):
    yil = serializers.IntegerField()
    donem = serializers.CharField()
    dersler = TranskriptKaydiSerializer(many=True)


class TranskriptSerializer(serializers.Serializer):
    ogrenci_no = serializers.CharField()
    ogrenci_ad = serializers.CharField()
    bolum = serializers.CharField()
    sinif = serializers.IntegerField()
    gpa = serializers.DecimalField(max_digits=3, decimal_places=2)
    kayitlar = DonemOzetiSerializer(many=True)
