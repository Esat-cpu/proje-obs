from django.db import transaction

from apps.courses.models import Ders, DonemDersi


class CourseService:

    # ======================
    # DERS
    # ======================
    @staticmethod
    def ders_olustur(ders_kodu, ad, kredi, min_sinif):
        if Ders.objects.filter(ders_kodu=ders_kodu).exists():
            return {"success": False, "message": "Bu ders kodu zaten kullanılıyor"}

        ders = Ders.objects.create(
            ders_kodu=ders_kodu,
            ad=ad,
            kredi=kredi,
            min_sinif=min_sinif
        )

        return {
            "success": True,
            "message": "Ders başarıyla oluşturuldu",
            "ders_id": ders.id
        }

    # ======================
    # DÖNEM DERSİ
    # ======================
    @staticmethod
    @transaction.atomic
    def donem_dersi_olustur(ders_id, akademisyen_id, yil, donem, kontenjan):

        if DonemDersi.objects.filter(
            ders_id=ders_id,
            akademisyen_id=akademisyen_id,
            yil=yil,
            donem=donem
        ).exists():
            return {"success": False, "message": "Bu ders zaten bu dönemde açılmış"}

        donem_dersi = DonemDersi.objects.create(
            ders_id=ders_id,
            akademisyen_id=akademisyen_id,
            yil=yil,
            donem=donem,
            kontenjan=kontenjan,
            aktiflik_durumu=True
        )

        return {
            "success": True,
            "message": "Ders döneme başarıyla açıldı",
            "donem_dersi_id": donem_dersi.id
        }

    @staticmethod
    def get_aktif_dersler(yil, donem):
        return DonemDersi.objects.filter(
            yil=yil,
            donem=donem,
            aktiflik_durumu=True
        ).select_related("ders", "akademisyen__user")

    @staticmethod
    def donem_dersi_kapat(donem_dersi_id):
        updated = DonemDersi.objects.filter(id=donem_dersi_id).update(
            aktiflik_durumu=False
        )

        if not updated:
            return {"success": False, "message": "Dönem dersi bulunamadı"}

        return {
            "success": True,
            "message": "Ders başarıyla kapatıldı"
        }