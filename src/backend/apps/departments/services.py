from django.db import transaction
from apps.departments.models import Bolum
from apps.users.models import Ogrenci, Akademisyen


def _error(message):
    return {"success": False, "message": message, "data": None}


class DepartmentService:
    """Bölüm yönetimi servisleri"""

    @staticmethod
    @transaction.atomic
    def bolum_olustur(ad, bolum_kodu):

        if not ad or len(ad) < 3:
            return _error("Bölüm adı en az 3 karakter")

        if not bolum_kodu or len(bolum_kodu) < 2:
            return _error("Bölüm kodu en az 2 karakter")

        if Bolum.objects.filter(bolum_kodu=bolum_kodu).exists():
            return _error("Bölüm kodu zaten var")

        if Bolum.objects.filter(ad=ad).exists():
            return _error("Bölüm adı zaten var")

        bolum = Bolum.objects.create(
            ad=ad,
            bolum_kodu=bolum_kodu
        )

        return {
            "success": True,
            "message": "Bölüm oluşturuldu",
            "data": {"id": bolum.id}
        }

    @staticmethod
    def get_bolumler():

        bolumler = Bolum.objects.all().order_by("ad")

        return {
            "success": True,
            "message": f"{bolumler.count()} bölüm",
            "data": list(bolumler.values("id", "ad", "bolum_kodu"))
        }

    @staticmethod
    @transaction.atomic
    def bolum_sil(bolum_id):

        try:
            bolum = Bolum.objects.get(id=bolum_id)
        except:
            return _error("Bölüm bulunamadı")

        if Ogrenci.objects.filter(bolum=bolum).exists():
            return _error("Bölüme bağlı öğrenciler var")

        if Akademisyen.objects.filter(bolum=bolum).exists():
            return _error("Bölüme bağlı akademisyenler var")

        bolum.delete()

        return {
            "success": True,
            "message": "Bölüm silindi",
            "data": {"id": bolum_id}
        }