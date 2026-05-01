from django.db import transaction, IntegrityError

from apps.users.models import User, Ogrenci, Akademisyen, Yonetici
from apps.departments.models import Bolum


class UserService:

    @staticmethod
    @transaction.atomic
    def ogrenci_olustur(username, email, ad, soyad, bolum_id, ogr_no, password):

        try:
            bolum = Bolum.objects.get(id=bolum_id)
        except Bolum.DoesNotExist:
            return {"success": False, "message": "Bölüm bulunamadı"}

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                ad=ad,
                soyad=soyad,
                role=User.Role.OGRENCI
            )
        except IntegrityError:
            return {"success": False, "message": "Bu kullanıcı adı zaten kullanılıyor"}

        if Ogrenci.objects.filter(ogr_no=ogr_no).exists():
            return {"success": False, "message": "Bu öğrenci numarası zaten kullanılıyor"}

        Ogrenci.objects.create(
            user=user,
            ogr_no=ogr_no,
            bolum=bolum
        )

        return {
            "success": True,
            "message": "Öğrenci başarıyla oluşturuldu",
            "user_id": user.id
        }

    @staticmethod
    @transaction.atomic
    def akademisyen_olustur(username, email, ad, soyad, bolum_id, unvan, password):

        try:
            bolum = Bolum.objects.get(id=bolum_id)
        except Bolum.DoesNotExist:
            return {"success": False, "message": "Bölüm bulunamadı"}

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                ad=ad,
                soyad=soyad,
                role=User.Role.AKADEMISYEN
            )
        except IntegrityError:
            return {"success": False, "message": "Bu kullanıcı adı zaten kullanılıyor"}

        Akademisyen.objects.create(
            user=user,
            bolum=bolum,
            unvan=unvan
        )

        return {
            "success": True,
            "message": "Akademisyen başarıyla oluşturuldu",
            "user_id": user.id
        }

    @staticmethod
    @transaction.atomic
    def yonetici_olustur(username, email, ad, soyad, password):

        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                ad=ad,
                soyad=soyad,
                role=User.Role.YONETICI
            )
        except IntegrityError:
            return {"success": False, "message": "Bu kullanıcı adı zaten kullanılıyor"}

        Yonetici.objects.create(user=user)

        return {
            "success": True,
            "message": "Yönetici başarıyla oluşturuldu",
            "user_id": user.id
        }

    @staticmethod
    def user_guncelle(user_id, **kwargs):

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return {"success": False, "message": "Kullanıcı bulunamadı"}

        allowed_fields = ["email", "ad", "soyad"]

        for field, value in kwargs.items():
            if field not in allowed_fields:
                return {
                    "success": False,
                    "message": f"Geçersiz alan: {field}"
                }
            setattr(user, field, value)

        user.save()

        return {
            "success": True,
            "message": "Kullanıcı bilgileri başarıyla güncellendi"
        }