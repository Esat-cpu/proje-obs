from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from apps.departments.models import Bolum


def bolum_listesi_getir():
    return Bolum.objects.all().order_by("bolum_kodu")


def bolum_getir(bolum_id):
    return get_object_or_404(Bolum, pk=bolum_id)


def bolum_kodu_ile_getir(bolum_kodu):
    return get_object_or_404(Bolum, bolum_kodu=bolum_kodu)


def bolum_olustur(ad, bolum_kodu):
    bolum = Bolum(ad=ad, bolum_kodu=bolum_kodu)
    bolum.full_clean()
    bolum.save()
    return bolum


def bolum_guncelle(bolum_id, **guncelleme_verisi):
    bolum = bolum_getir(bolum_id)
    for alan, deger in guncelleme_verisi.items():
        setattr(bolum, alan, deger)
    bolum.full_clean()
    bolum.save()
    return bolum


def bolum_sil(bolum_id):
    bolum = bolum_getir(bolum_id)
    bagli_ogrenci = bolum.ogrenci_set.exists()
    bagli_akademisyen = bolum.akademisyen_set.exists()
    if bagli_ogrenci or bagli_akademisyen:
        raise ValidationError("Bu bölüme bağlı öğrenci veya akademisyen bulunmaktadır.")
    bolum.delete()