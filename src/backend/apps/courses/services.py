from django.db import transaction
from apps.courses.models import Ders, DonemDersi
from apps.users.models import Akademisyen


def _error(message):
    return {"success": False, "message": message, "data": None}


class CourseService:
    """Ders yönetimi servisleri"""

    # ==========================
    # DERS 
    # ==========================

    @staticmethod
    def ders_olustur(ders_kodu, ad, kredi, min_sinif):

        if Ders.objects.filter(ders_kodu=ders_kodu).exists():
            return _error("Ders kodu zaten var")

        ders = Ders.objects.create(
            ders_kodu=ders_kodu,
            ad=ad,
            kredi=kredi,
            min_sinif=min_sinif
        )

        return {
            "success": True,
            "message": "Ders oluşturuldu",
            "data": {"id": ders.id}
        }


    # ==========================
    # DONEM DERSI 
    # ==========================

    @staticmethod
    @transaction.atomic
    def donem_dersi_olustur(ders_id, akademisyen_id, yil, donem, kontenjan):

        if kontenjan < 0:
            return _error("Kontenjan hatalı")

        try:
            ders = Ders.objects.get(id=ders_id)
            akademisyen = Akademisyen.objects.get(id=akademisyen_id)
        except (Ders.DoesNotExist, Akademisyen.DoesNotExist):
            return _error("Ders veya akademisyen bulunamadı")

        if DonemDersi.objects.filter(
            ders=ders,
            akademisyen=akademisyen,
            yil=yil,
            donem=donem
        ).exists():
            return _error("Ders zaten açılmış")

        donem_dersi = DonemDersi.objects.create(
            ders=ders,
            akademisyen=akademisyen,
            yil=yil,
            donem=donem,
            kontenjan=kontenjan,
            aktiflik_durumu=True
        )

        return {
            "success": True,
            "message": "Dönem dersi oluşturuldu",
            "data": {"id": donem_dersi.id}
        }

    @staticmethod
    def get_aktif_dersler(yil, donem):

        dersler = DonemDersi.objects.filter(
            yil=yil,
            donem=donem,
            aktiflik_durumu=True
        ).select_related("ders", "akademisyen__user")

        return {
            "success": True,
            "message": f"{dersler.count()} ders",
            "data": list(dersler.values(
                "id",
                "ders__ad",
                "ders__ders_kodu",
                "akademisyen__user__ad",
                "akademisyen__user__soyad",
                "kontenjan"
            ))
        }

    @staticmethod
    def donem_dersi_kapat(donem_dersi_id):

        try:
            ders = DonemDersi.objects.get(id=donem_dersi_id)
        except:
            return _error("Ders bulunamadı")

        if not ders.aktiflik_durumu:
            return _error("Ders zaten kapalı")
    
        ders.aktiflik_durumu = False
        ders.save()

        return {
            "success": True,
            "message": "Ders kapatıldı",
            "data": {"id": ders.id}
        }