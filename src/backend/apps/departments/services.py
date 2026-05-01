from django.db import transaction
from apps.departments.models import Bolum


class DepartmentService:

    @staticmethod
    @transaction.atomic
    def bolum_olustur(ad, bolum_kodu):
        if Bolum.objects.filter(bolum_kodu=bolum_kodu).exists():
            return {
                "success": False,
                "message": "Bu bölüm kodu zaten kullanılıyor"
            }

        bolum = Bolum.objects.create(
            ad=ad,
            bolum_kodu=bolum_kodu
        )

        return {
            "success": True,
            "message": "Bölüm başarıyla oluşturuldu",
            "bolum_id": bolum.id
        }

    @staticmethod
    def get_bolumler():
        return Bolum.objects.all().order_by("ad")

    @staticmethod
    @transaction.atomic
    def bolum_sil(bolum_id):
        try:
            bolum = Bolum.objects.get(id=bolum_id)
        except Bolum.DoesNotExist:
            return {
                "success": False,
                "message": "Bölüm bulunamadı"
            }

        # güvenlik kontrolü (kritik)
        if bolum.ders_set.exists() or bolum.ogrenci_set.exists():
            return {
                "success": False,
                "message": "Bu bölüme bağlı kayıtlar olduğu için silinemez"
            }

        bolum.delete()

        return {
            "success": True,
            "message": "Bölüm başarıyla silindi"
        }