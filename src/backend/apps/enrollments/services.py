from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.courses.models import DonemDersi
from apps.enrollments.models import DersKaydi, DersKayitDonemi

MAX_DERS_SAYISI = 8
MAX_KREDI = 30


def aktif_kayit_donemi_getir():
    simdi = timezone.now()
    return DersKayitDonemi.objects.filter(
        baslangic__lte=simdi,
        bitis__gte=simdi,
    ).first()


def kayit_donemi_aktif_mi():
    return aktif_kayit_donemi_getir() is not None


def kayit_donemi_olustur(yil, donem, baslangic, bitis):
    if baslangic >= bitis:
        raise ValidationError("Başlangıç tarihi bitiş tarihinden önce olmalıdır.")
    kayit_donemi = DersKayitDonemi(yil=yil, donem=donem, baslangic=baslangic, bitis=bitis)
    kayit_donemi.full_clean()
    kayit_donemi.save()
    return kayit_donemi


def kayit_donemi_guncelle(kayit_donemi_id, **guncelleme_verisi):
    kayit_donemi = get_object_or_404(DersKayitDonemi, pk=kayit_donemi_id)
    for alan, deger in guncelleme_verisi.items():
        setattr(kayit_donemi, alan, deger)
    kayit_donemi.full_clean()
    kayit_donemi.save()
    return kayit_donemi


@transaction.atomic
def ders_kaydi_olustur(ogrenci, donem_dersi_id):
    if not kayit_donemi_aktif_mi():
        raise ValidationError("Ders kayıt dönemi aktif değil.")

    donem_dersi = get_object_or_404(DonemDersi, pk=donem_dersi_id)

    if not donem_dersi.aktiflik_durumu:
        raise ValidationError("Bu dönem dersi aktif değil.")

    if donem_dersi.ders.min_sinif > ogrenci.sinif:
        raise ValidationError("Bu dersi almak için sınıf seviyeniz yetersiz.")

    if DersKaydi.objects.filter(ogrenci=ogrenci, donem_dersi=donem_dersi).exists():
        raise ValidationError("Bu derse zaten kayıtlısınız.")

    from apps.courses.services import kontenjan_dolu_mu
    if kontenjan_dolu_mu(donem_dersi):
        raise ValidationError("Bu dersin kontenjanı dolmuştur.")

    mevcut_kayitlar = DersKaydi.objects.filter(
        ogrenci=ogrenci,
        donem_dersi__yil=donem_dersi.yil,
        donem_dersi__donem=donem_dersi.donem,
    ).select_related("donem_dersi__ders")

    if mevcut_kayitlar.count() >= MAX_DERS_SAYISI:
        raise ValidationError(f"Bir dönemde en fazla {MAX_DERS_SAYISI} ders alabilirsiniz.")

    mevcut_kredi = sum(k.donem_dersi.ders.kredi for k in mevcut_kayitlar)
    if mevcut_kredi + donem_dersi.ders.kredi > MAX_KREDI:
        raise ValidationError(f"Kredi limitini ({MAX_KREDI}) aşıyorsunuz.")

    kayit = DersKaydi(ogrenci=ogrenci, donem_dersi=donem_dersi, onay_durumu=False)
    kayit.save()
    return kayit


def bekleyen_kayitlari_listele(akademisyen):
    return DersKaydi.objects.filter(
        donem_dersi__akademisyen=akademisyen,
        onay_durumu=False,
    ).select_related("ogrenci__user", "donem_dersi__ders")


def ders_kaydi_onayla(kayit_id, akademisyen):
    kayit = get_object_or_404(DersKaydi, pk=kayit_id)
    if kayit.donem_dersi.akademisyen != akademisyen:
        raise PermissionDenied("Bu kayıt size ait değil.")
    kayit.onay_durumu = True
    kayit.save(update_fields=["onay_durumu"])
    return kayit


def ders_kaydi_reddet(kayit_id, akademisyen):
    kayit = get_object_or_404(DersKaydi, pk=kayit_id)
    if kayit.donem_dersi.akademisyen != akademisyen:
        raise PermissionDenied("Bu kayıt size ait değil.")
    kayit.delete()


def donem_dersi_ogrenci_listesi(donem_dersi_id, akademisyen):
    donem_dersi = get_object_or_404(
        DonemDersi, pk=donem_dersi_id, akademisyen=akademisyen
    )
    return DersKaydi.objects.filter(
        donem_dersi=donem_dersi,
    ).select_related("ogrenci__user")


@transaction.atomic
def not_gir_guncelle(kayit_id, vize_notu, final_notu, akademisyen):
    kayit = get_object_or_404(DersKaydi, pk=kayit_id)
    if kayit.donem_dersi.akademisyen != akademisyen:
        raise PermissionDenied("Bu kayıt size ait değil.")
    if not kayit.onay_durumu:
        raise ValidationError("Onaylanmamış kayıda not girilemez.")
    kayit.vize_notu = vize_notu
    kayit.final_notu = final_notu
    kayit.save()

    from apps.users.services import gpa_guncelle
    gpa_guncelle(kayit.ogrenci)
    return kayit


def ogrenci_derslerini_listele(ogrenci, yil=None, donem=None):
    qs = DersKaydi.objects.filter(ogrenci=ogrenci).select_related(
        "donem_dersi__ders", "donem_dersi__akademisyen__user"
    )
    if yil:
        qs = qs.filter(donem_dersi__yil=yil)
    if donem:
        qs = qs.filter(donem_dersi__donem=donem)
    return qs


def transkript_getir(ogrenci):
    return DersKaydi.objects.filter(
        ogrenci=ogrenci,
        onay_durumu=True,
    ).select_related(
        "donem_dersi__ders",
        "donem_dersi__akademisyen__user",
    ).order_by("donem_dersi__yil", "donem_dersi__donem")