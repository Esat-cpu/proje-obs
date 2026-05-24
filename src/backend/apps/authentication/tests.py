from django.test import TestCase

from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from apps.departments.models import Bolum
from apps.users.models import Ogrenci, User

from .serializers import CustomTokenObtainPairSerializer


# -----------------------------------------------------------------------
# SERIALIZER TESTLERI
# -----------------------------------------------------------------------

class CustomTokenObtainPairSerializerTest(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")
        self.ogrenci_user = User.objects.create_user(
            username="ali.veli", password="test123",
            ad="Ali", soyad="Veli", role=User.Role.OGRENCI,
        )
        self.ogrenci = Ogrenci.objects.create(
            user=self.ogrenci_user, ogr_no="20240001", bolum=self.bolum,
        )
        self.akademisyen = User.objects.create_user(
            username="hoca.bir", password="test456",
            ad="Hoca", soyad="Bir", role=User.Role.AKADEMISYEN,
        )

    def test_username_ile_giris_basarili(self):
        data = {"username": "hoca.bir", "password": "test456"}
        serializer = CustomTokenObtainPairSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertIn("access", serializer.validated_data)
        self.assertIn("refresh", serializer.validated_data)

    def test_ogrenci_no_ile_giris_basarili(self):
        data = {"username": "20240001", "password": "test123"}
        serializer = CustomTokenObtainPairSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertIn("access", serializer.validated_data)

    def test_ogrenci_kullanici_adi_ile_giremez(self):
        """Öğrenci kendi username'i ile giriş yapamaz, sadece ogr_no ile girer"""
        data = {"username": "ali.veli", "password": "test123"}
        serializer = CustomTokenObtainPairSerializer(data=data)
        with self.assertRaises(AuthenticationFailed):
            serializer.is_valid()

    def test_gecersiz_kimlik_hata(self):
        data = {"username": "hoca.bir", "password": "wrongpass"}
        serializer = CustomTokenObtainPairSerializer(data=data)
        with self.assertRaises(AuthenticationFailed):
            serializer.is_valid()

    def test_olmayan_kullanici_hata(self):
        data = {"username": "olmayan", "password": "test123"}
        serializer = CustomTokenObtainPairSerializer(data=data)
        with self.assertRaises(AuthenticationFailed):
            serializer.is_valid()

    def test_token_role_claim_icerir(self):
        data = {"username": "hoca.bir", "password": "test456"}
        serializer = CustomTokenObtainPairSerializer(data=data)
        serializer.is_valid()
        access = serializer.validated_data["access"]
        from rest_framework_simplejwt.tokens import AccessToken
        token = AccessToken(access)
        self.assertEqual(token["role"], User.Role.AKADEMISYEN)


# -----------------------------------------------------------------------
# VIEW TESTLERI
# -----------------------------------------------------------------------

class LogoutViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")
        self.user = User.objects.create_user(
            username="testuser", password="test123",
            ad="Test", soyad="User", role=User.Role.AKADEMISYEN,
        )
        token_resp = self.client.post("/api/auth/token/", {
            "username": "testuser", "password": "test123",
        })
        self.refresh_token = token_resp.data["refresh"]
        self.access_token = token_resp.data["access"]

    def test_basarili_logout(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.post("/api/auth/logout/", {
            "refresh": self.refresh_token,
        })
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        self.assertEqual(response.data["detail"], "Logout successful")

    def test_kimlik_dogrulanmamis_logout(self):
        response = self.client.post("/api/auth/logout/", {
            "refresh": self.refresh_token,
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_gecersiz_refresh_ile_logout(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.post("/api/auth/logout/", {
            "refresh": "gecersiztoken",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_eksik_refresh_ile_logout(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.post("/api/auth/logout/", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_sonrasi_token_karalistede(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        self.client.post("/api/auth/logout/", {"refresh": self.refresh_token})
        response = self.client.post("/api/auth/token/refresh/", {
            "refresh": self.refresh_token,
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
