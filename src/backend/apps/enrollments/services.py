from django.db import transaction
from django.db import models

from apps.users.models import Ogrenci
from apps.courses.models import DonemDersi
from apps.enrollments.models import DersKaydi


class EnrollmentService:

    @staticmethod
    @transaction.atomic
    def ders_kaydi_yap(ogrenci_id, donem_dersi_id):

        try:
            ogrenci = Ogrenci.objects.get(id=ogrenci_id)
            donem_dersi = DonemDersi.objects.select_for_update().get(id=donem_dersi_id)
        except Ogrenci.DoesNotExist:
            return {"success": False, "message": "Öğrenci bulunamadı"}
        except DonemDersi.DoesNotExist:
            return {"success": False, "message": "Ders bulunamadı"}

        if ogrenci.sinif < donem_dersi.ders.min_sinif:
            return {"success": False, "message": "Sınıfınız bu ders için uygun değil"}

        if DersKaydi.objects.filter(
            ogrenci=ogrenci,
            donem_dersi=donem_dersi
        ).exists():
            return {"success": False, "message": "Zaten kayıtlısınız"}

        if donem_dersi.is_full():
            return {"success": False, "message": "Kontenjan dolu"}

        DersKaydi.objects.create(
            ogrenci=ogrenci,
            donem_dersi=donem_dersi,
            onay_durumu=False
        )

        return {"success": True, "message": "Ders kaydı oluşturuldu"}
    
    
    @staticmethod
    @transaction.atomic
    def ders_kaydi_onayla(ders_kaydi_id):

        try:
            kayit = DersKaydi.objects.select_for_update().get(id=ders_kaydi_id)
        except DersKaydi.DoesNotExist:
            return {"success": False, "message": "Kayıt bulunamadı"}

        if kayit.onay_durumu:
            return {"success": False, "message": "Zaten onaylı"}

        # kontenjan kontrolü (güvenlik)
        if kayit.donem_dersi.is_full():
            return {"success": False, "message": "Kontenjan dolu"}

        kayit.onay_durumu = True
        kayit.save()

        return {
            "success": True,
            "message": "Kayıt onaylandı"
        }

    @staticmethod
    def ders_kaydi_iptal(ogrenci_id, ders_kaydi_id):

        try:
            kayit = DersKaydi.objects.get(
                id=ders_kaydi_id,
                ogrenci_id=ogrenci_id
            )
        except DersKaydi.DoesNotExist:
            return {"success": False, "message": "Kayıt bulunamadı"}

        if kayit.onay_durumu:
            return {"success": False, "message": "Onaylı kayıt silinemez"}

        kayit.delete()

        return {"success": True, "message": "Kayıt iptal edildi"}


class GradeService:

    @staticmethod
    @transaction.atomic
    def not_gir(ders_kaydi_id, vize, final):

        if not (0 <= vize <= 100 and 0 <= final <= 100):
            return {"success": False, "message": "Notlar 0-100 arası olmalı"}

        try:
            kayit = DersKaydi.objects.get(id=ders_kaydi_id)
        except DersKaydi.DoesNotExist:
            return {"success": False, "message": "Kayıt bulunamadı"}

        kayit.vize_notu = vize
        kayit.final_notu = final
        kayit.save()

        return {
            "success": True,
            "message": "Not girildi"
        }
