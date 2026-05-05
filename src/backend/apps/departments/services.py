from django.shortcuts import get_object_or_404

from apps.departments.models import Bolum


class DepartmentsService:

    @staticmethod
    def bolum_listesi_getir():
        return Bolum.objects.all().order_by("bolum_kodu")

    @staticmethod
    def bolum_getir(bolum_id):
        return get_object_or_404(Bolum, pk=bolum_id)

    @staticmethod
    def bolum_kodu_ile_getir(bolum_kodu):
        return get_object_or_404(Bolum, bolum_kodu=bolum_kodu)
