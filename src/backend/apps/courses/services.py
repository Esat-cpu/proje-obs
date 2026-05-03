from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from apps.courses.models import Ders, DonemDersi


def dersleri_listele(sinif=None):
    qs = Ders.objects.all()
    if sinif is not None:
        qs = qs.filter(min_sinif__lte=sinif)
    return qs


def ders_getir(ders_id):
    return get_object_or_404(Ders, pk=ders_id)


def ders_olustur(ders_kodu, ad, kredi, min_sinif):
    ders = Ders(ders_kodu=ders_kodu, ad=ad, kredi=kredi, min_sinif=min_sinif)
    ders.full_clean()
    ders.save()
    return ders


def ders_guncelle(ders_id, **guncelleme_verisi):
    ders = ders_getir(ders_id)
    for alan, deger in guncelleme_verisi.items():
        setattr(ders, alan, deger)
    ders.full_clean()
    ders.save()
    return ders


def ders_sil(ders_id):
    ders = ders_getir(ders_id)
    ders.delete()


def donem_derslerini_listele(akademisyen=None, yil=None, donem=None, sadece_aktif=False):
    qs = DonemDersi.objects.select_related("ders", "akademisyen__user")
    if akademisyen is not None:
        qs = qs.filter(akademisyen=akademisyen)
    if yil is not None:
        qs = qs.filter(yil=yil)
    if donem is not None:
        qs = qs.filter(donem=donem)
    if sadece_aktif:
        qs = qs.filter(aktiflik_durumu=True)
    return qs


def akademisyen_derslerini_getir(akademisyen):
    return donem_derslerini_listele(akademisyen=akademisyen)


def donem_dersi_getir(donem_dersi_id):
    return get_object_or_404(DonemDersi, pk=donem_dersi_id)


def donem_dersi_olustur(ders, akademisyen, yil, donem, kontenjan):
    donem_dersi = DonemDersi(
        ders=ders,
        akademisyen=akademisyen,
        yil=yil,
        donem=donem,
        kontenjan=kontenjan,
        aktiflik_durumu=False,
    )
    donem_dersi.full_clean()
    donem_dersi.save()
    return donem_dersi


def donem_dersi_guncelle(donem_dersi_id, **guncelleme_verisi):
    donem_dersi = donem_dersi_getir(donem_dersi_id)
    for alan, deger in guncelleme_verisi.items():
        setattr(donem_dersi, alan, deger)
    donem_dersi.full_clean()
    donem_dersi.save()
    return donem_dersi


def donem_dersi_aktif_et(donem_dersi_id):
    return donem_dersi_guncelle(donem_dersi_id, aktiflik_durumu=True)


def donem_dersi_pasif_et(donem_dersi_id):
    return donem_dersi_guncelle(donem_dersi_id, aktiflik_durumu=False)


def donem_dersi_sil(donem_dersi_id):
    donem_dersi = donem_dersi_getir(donem_dersi_id)
    if donem_dersi.aktiflik_durumu:
        raise ValidationError("Aktif dönem dersi silinemez.")
    donem_dersi.delete()


def kontenjan_dolu_mu(donem_dersi):
    from apps.enrollments.models import DersKaydi
    onaylanan_kayit_sayisi = DersKaydi.objects.filter(
        donem_dersi=donem_dersi,
        onay_durumu=True,
    ).count()
    return onaylanan_kayit_sayisi >= donem_dersi.kontenjan