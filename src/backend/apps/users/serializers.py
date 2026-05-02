from rest_framework import serializers
from .models import User, Ogrenci, Akademisyen
from departments.serializers import BolumSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "ad", "soyad", "role"]
        read_only_fields = fields

class OgrenciSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bolum = BolumSerializer(read_only=True)

    class Meta:
        model = Ogrenci
        fields = ["id", "user", "ogr_no", "bolum", "sinif", "gpa"]

class AkademisyenSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bolum = BolumSerializer(read_only=True)

    class Meta:
        model = Akademisyen
        fields = ["id", "user", "bolum", "unvan"]
