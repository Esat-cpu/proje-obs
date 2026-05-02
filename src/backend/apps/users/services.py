from django.db import transaction
from django.contrib.auth import get_user_model

from apps.users.models import Ogrenci, Akademisyen, Yonetici
from apps.departments.models import Bolum

User = get_user_model()


class UserService:

    @staticmethod
    def _validate_base(username, email, ad, soyad, password):
        if not username or len(username) < 3:
            return "Username en az 3 karakter olmalı"

        if not email or "@" not in email:
            return "Geçerli email girin"

        if not ad or not soyad:
            return "Ad ve soyad zorunlu"

        if not password or len(password) < 6:
            return "Şifre en az 6 karakter olmalı"

        return None

    @staticmethod
    @transaction.atomic
    def ogrenci_olustur(username, email, ad, soyad, bolum_id, ogr_no, password):

        err = UserService._validate_base(username, email, ad, soyad, password)
        if err:
            return {"success": False, "message": err}

        if User.objects.filter(username=username).exists():
            return {"success": False, "message": "Username kullanılıyor"}

        if Ogrenci.objects.filter(ogr_no=ogr_no).exists():
            return {"success": False, "message": "Öğrenci no kullanılıyor"}

        try:
            bolum = Bolum.objects.get(id=bolum_id)
        except Bolum.DoesNotExist:
            return {"success": False, "message": "Bölüm bulunamadı"}

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            ad=ad,
            soyad=soyad,
            role=User.Role.OGRENCI
        )

        ogrenci = Ogrenci.objects.create(
            user=user,
            ogr_no=ogr_no,
            bolum=bolum
        )

        return {
            "success": True,
            "message": "Öğrenci oluşturuldu",
            "data": {"user_id": user.id, "ogrenci_id": ogrenci.id}
        }

    @staticmethod
    @transaction.atomic
    def akademisyen_olustur(username, email, ad, soyad, bolum_id, unvan, password):

        err = UserService._validate_base(username, email, ad, soyad, password)
        if err:
            return {"success": False, "message": err}

        if User.objects.filter(username=username).exists():
            return {"success": False, "message": "Username kullanılıyor"}

        try:
            bolum = Bolum.objects.get(id=bolum_id)
        except Bolum.DoesNotExist:
            return {"success": False, "message": "Bölüm bulunamadı"}

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            ad=ad,
            soyad=soyad,
            role=User.Role.AKADEMISYEN
        )

        akademisyen = Akademisyen.objects.create(
            user=user,
            bolum=bolum,
            unvan=unvan
        )

        return {
            "success": True,
            "message": "Akademisyen oluşturuldu",
            "data": {"user_id": user.id, "akademisyen_id": akademisyen.id}
        }

    @staticmethod
    @transaction.atomic
    def yonetici_olustur(username, email, ad, soyad, password):

        err = UserService._validate_base(username, email, ad, soyad, password)
        if err:
            return {"success": False, "message": err}

        if User.objects.filter(username=username).exists():
            return {"success": False, "message": "Username kullanılıyor"}

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            ad=ad,
            soyad=soyad
        )

        user.role = User.Role.YONETICI
        user.save()

        yonetici = Yonetici.objects.create(user=user)

        return {
            "success": True,
            "message": "Yönetici oluşturuldu",
            "data": {"user_id": user.id, "yonetici_id": yonetici.id}
        }

    @staticmethod
    def user_guncelle(user_id, **kwargs):

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return {"success": False, "message": "Kullanıcı bulunamadı"}

        allowed = ["email", "ad", "soyad"]

        for k in kwargs:
            if k not in allowed:
                return {"success": False, "message": f"{k} güncellenemez"}

        for k, v in kwargs.items():
            setattr(user, k, v)

        user.save()

        return {"success": True, "message": "Güncellendi"}