from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.courses.models import DonemDersi
from apps.enrollments.models import DersKaydi, DersKayitDonemi

MAX_DERS_SAYISI = 8
MAX_KREDI = 30


class EnrollmentService:

    @staticmethod
    def aktif_kayit_donemi_getir():
        simdi = timezone.now()
        return DersKayitDonemi.objects.filter(
            baslangic__lte=simdi,
            bitis__gte=simdi,
        ).first()

    @staticmethod
    def kayit_donemi_aktif_mi():
        return EnrollmentService.aktif_kayit_donemi_getir() is not None

    @staticmethod
    @transaction.atomic
    def ders_kaydi_olustur(ogrenci, donem_dersi_id):
        if not EnrollmentService.kayit_donemi_aktif_mi():
            raise ValidationError("Ders kayıt dönemi aktif değil.")

        donem_dersi = get_object_or_404(DonemDersi, pk=donem_dersi_id)

        if not donem_dersi.aktiflik_durumu:
            raise ValidationError("Bu dönem dersi aktif değil.")

        if donem_dersi.ders.min_sinif > ogrenci.sinif:
            raise ValidationError("Bu dersi almak için sınıf seviyeniz yetersiz.")

        if DersKaydi.objects.filter(ogrenci=ogrenci, donem_dersi=donem_dersi).exists():
            raise ValidationError("Bu derse zaten kayıtlısınız.")

        from apps.courses.services import CoursesService
        if CoursesService.kontenjan_dolu_mu(donem_dersi):
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

        kayit = DersKaydi(ogrenci=ogrenci, donem_dersi=donem_dersi, onay_durumu=DersKaydi.Durum.BEKLEMEDE)
        kayit.save()
        return kayit

    @staticmethod
    def bekleyen_kayitlari_listele(akademisyen):
        return DersKaydi.objects.filter(
            donem_dersi__akademisyen=akademisyen,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        ).select_related("ogrenci__user", "donem_dersi__ders")

    @staticmethod
    def ders_kaydi_onayla(kayit_id, akademisyen):
        kayit = get_object_or_404(DersKaydi, pk=kayit_id)
        if kayit.donem_dersi.akademisyen != akademisyen:
            raise PermissionDenied("Bu kayıt size ait değil.")
        kayit.onay_durumu = DersKaydi.Durum.ONAYLANDI
        kayit.save(update_fields=["onay_durumu"])
        return kayit

    @staticmethod
    def ders_kaydi_reddet(kayit_id, akademisyen):
        kayit = get_object_or_404(DersKaydi, pk=kayit_id)
        if kayit.donem_dersi.akademisyen != akademisyen:
            raise PermissionDenied("Bu kayıt size ait değil.")
        kayit.onay_durumu = DersKaydi.Durum.REDDEDILDI
        kayit.save(update_fields=["onay_durumu"])

    @staticmethod
    def donem_dersi_ogrenci_listesi(donem_dersi_id, akademisyen):
        donem_dersi = get_object_or_404(
            DonemDersi, pk=donem_dersi_id, akademisyen=akademisyen
        )
        return DersKaydi.objects.filter(
            donem_dersi=donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        ).select_related("ogrenci__user")

    @staticmethod
    def ogrenci_derslerini_listele(ogrenci, yil=None, donem=None):
        qs = DersKaydi.objects.filter(ogrenci=ogrenci).select_related(
            "donem_dersi__ders", "donem_dersi__akademisyen__user"
        )
        if yil:
            qs = qs.filter(donem_dersi__yil=yil)
        if donem:
            qs = qs.filter(donem_dersi__donem=donem)
        return qs

    @staticmethod
    def transkript_getir(ogrenci):
        return DersKaydi.objects.filter(
            ogrenci=ogrenci,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        ).select_related(
            "donem_dersi__ders",
            "donem_dersi__akademisyen__user",
        ).order_by("donem_dersi__yil", "donem_dersi__donem")


class GradeService:

    @staticmethod
    @transaction.atomic
    def not_gir_guncelle(kayit_id, vize_notu, final_notu, akademisyen):
        kayit = get_object_or_404(DersKaydi, pk=kayit_id)
        if kayit.donem_dersi.akademisyen != akademisyen:
            raise PermissionDenied("Bu kayıt size ait değil.")
        if not kayit.aktif:
            raise ValidationError("Onaylanmamış kayıda not girilemez.")
        kayit.vize_notu = vize_notu
        kayit.final_notu = final_notu
        kayit.save()

        from apps.users.services import UsersService
        UsersService.gpa_guncelle(kayit.ogrenci)
        return kayit
