from rest_framework import serializers

from apps.departments.models import Bolum


class BolumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bolum
        fields = ["id", "ad", "bolum_kodu"]