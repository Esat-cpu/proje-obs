from django.db import transaction
from django.db.models import Count, Avg

from apps.users.models import Ogrenci, Akademisyen
from apps.courses.models import DonemDersi
from apps.enrollments.models import DersKaydi, DersKayitDonemi


def _error(message):
    return {"success": False, "message": message, "data": None}


class EnrollmentService:
    """Ders kayıt işlemleri"""

    @staticmethod
    @transaction.atomic
    def ders_kaydi_yap(ogrenci_id, donem_dersi_id):

        try:
            ogrenci = Ogrenci.objects.get(id=ogrenci_id)
            donem_dersi = DonemDersi.objects.select_for_update().get(id=donem_dersi_id)
        except (Ogrenci.DoesNotExist, DonemDersi.DoesNotExist):
            return _error("Öğrenci veya ders bulunamadı")

        kayit_donemi = DersKayitDonemi.get_aktif_donem()
        if not kayit_donemi:
            return _error("Ders kayıt dönemi kapalı")

        if donem_dersi.yil != kayit_donemi.yil or donem_dersi.donem != kayit_donemi.donem:
            return _error("Bu ders bu döneme ait değil")

        if not donem_dersi.is_active():
            return _error("Ders aktif değil")

        if ogrenci.sinif < donem_dersi.ders.min_sinif:
            return _error("Sınıf yetersiz")

        if donem_dersi.is_full():
            return _error("Kontenjan dolu")

        if DersKaydi.objects.filter(
            ogrenci=ogrenci,
            donem_dersi=donem_dersi
        ).exists():
            return _error("Zaten kayıtlı")

        kayit = DersKaydi.objects.create(
            ogrenci=ogrenci,
            donem_dersi=donem_dersi,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE
        )

        return {
            "success": True,
            "message": "Kayıt oluşturuldu",
            "data": {"id": kayit.id}
        }

    @staticmethod
    @transaction.atomic
    def ders_kaydi_onayla(ders_kaydi_id):

        try:
            kayit = DersKaydi.objects.select_for_update().get(id=ders_kaydi_id)
        except DersKaydi.DoesNotExist:
            return _error("Kayıt bulunamadı")

        if kayit.onay_durumu == DersKaydi.Durum.ONAYLANDI:
            return _error("Zaten onaylı")

        if kayit.donem_dersi.is_full():
            return _error("Kontenjan dolu")

        kayit.onay_durumu = DersKaydi.Durum.ONAYLANDI
        kayit.save()

        return {
            "success": True,
            "message": "Onaylandı",
            "data": {"id": kayit.id}
        }

    @staticmethod
    def ders_kaydi_iptal(ogrenci_id, ders_kaydi_id):

        try:
            kayit = DersKaydi.objects.get(
                id=ders_kaydi_id,
                ogrenci_id=ogrenci_id
            )
        except DersKaydi.DoesNotExist:
            return _error("Kayıt bulunamadı")

        if kayit.onay_durumu == DersKaydi.Durum.ONAYLANDI:
            return _error("Onaylı kayıt silinemez")

        kayit.delete()

        return {"success": True, "message": "İptal edildi", "data": None}


class GradeService:
    """Not işlemleri"""

    @staticmethod
    @transaction.atomic
    def not_gir(ders_kaydi_id, vize, final, akademisyen_id=None):

        try:
            kayit = DersKaydi.objects.get(id=ders_kaydi_id)
        except DersKaydi.DoesNotExist:
            return _error("Ders kaydı bulunamadı")

        if kayit.onay_durumu != DersKaydi.Durum.ONAYLANDI:
            return _error("Onaysız kayda not girilemez")

        if akademisyen_id:
            try:
                akademisyen = Akademisyen.objects.get(id=akademisyen_id)
                if akademisyen.id != kayit.donem_dersi.akademisyen_id:
                    return _error("Bu dersin hocası değilsiniz")
            except Akademisyen.DoesNotExist:
                return _error("Akademisyen bulunamadı")

        kayit.vize_notu = vize
        kayit.final_notu = final
        kayit.save()

        return {
            "success": True,
            "message": "Notlar girildi",
            "data": {
                "ortalama": kayit.ortalama,
                "harf": kayit.harf_notu
            }
        }

    @staticmethod
    @transaction.atomic
    def not_guncelle(ders_kaydi_id, akademisyen_id, vize=None, final=None):

        try:
            kayit = DersKaydi.objects.select_for_update().get(id=ders_kaydi_id)
        except DersKaydi.DoesNotExist:
            return _error("Kayıt bulunamadı")

        try:
            akademisyen = Akademisyen.objects.get(id=akademisyen_id)
        except Akademisyen.DoesNotExist:
            return _error("Akademisyen bulunamadı")

        if akademisyen.id != kayit.donem_dersi.akademisyen_id:
            return _error("Bu dersin notlarını güncelleme yetkiniz yok")

        # not güncelleme
        if vize is not None:
            kayit.vize_notu = vize

        if final is not None:
            kayit.final_notu = final

        kayit.save()

        return {
            "success": True,
            "message": "Güncellendi",
            "data": {
                "ortalama": kayit.ortalama,
                "harf": kayit.harf_notu
            }
        }

    @staticmethod
    def sinif_not_istatistikleri(donem_dersi_id):

        kayitlar = DersKaydi.objects.filter(
            donem_dersi_id=donem_dersi_id,
            onay_durumu=DersKaydi.Durum.ONAYLANDI
        )

        if not kayitlar.exists():
            return _error("Kayıt yok")

        data = kayitlar.aggregate(
            toplam=Count("id"),
            vize_ort=Avg("vize_notu"),
            final_ort=Avg("final_notu")
        )

        return {
            "success": True,
            "message": "İstatistikler",
            "data": data
        }

    @staticmethod
    def donem_dersi_ogrencileri(donem_dersi_id):

        ogrenciler = DersKaydi.objects.filter(
            donem_dersi_id=donem_dersi_id,
            onay_durumu=DersKaydi.Durum.ONAYLANDI
        )

        return {
            "success": True,
            "message": "Öğrenciler listelendi",
            "data": list(ogrenciler.values(
                "id",
                "ogrenci__ogr_no",
                "ogrenci__user__ad",
                "ogrenci__user__soyad",
                "vize_notu",
                "final_notu",
                "harf_notu"
            ))
        }