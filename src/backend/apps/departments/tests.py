from django.core.exceptions import ValidationError
from django.http import Http404
from django.test import TestCase

from apps.departments.models import Bolum
from apps.departments.serializers import BolumSerializer
from apps.departments.services import DepartmentsService


class BolumModelTestleri(TestCase):
    def test_str_donus(self):
        bolum = Bolum(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")
        self.assertEqual(str(bolum), "Bilgisayar Mühendisliği")

    def test_bolum_kodu_benzersiz(self):
        Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")
        with self.assertRaises(Exception):
            Bolum.objects.create(ad="Başka Bölüm", bolum_kodu="BM")

    def test_bolum_olusturuldu(self):
        bolum = Bolum.objects.create(ad="Elektrik Elektronik", bolum_kodu="EE")
        self.assertIsNotNone(bolum.pk)


class DepartmentsServiceTestleri(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")

    def test_bolum_listesi_getir(self):
        Bolum.objects.create(ad="Elektrik Elektronik", bolum_kodu="EE")
        liste = DepartmentsService.bolum_listesi_getir()
        self.assertEqual(liste.count(), 2)

    def test_bolum_listesi_bolum_kodu_sirali(self):
        Bolum.objects.create(ad="Makine Mühendisliği", bolum_kodu="MM")
        Bolum.objects.create(ad="Elektrik Elektronik", bolum_kodu="EE")
        liste = list(DepartmentsService.bolum_listesi_getir())
        kodlar = [b.bolum_kodu for b in liste]
        self.assertEqual(kodlar, sorted(kodlar))

    def test_bolum_getir(self):
        bulunan = DepartmentsService.bolum_getir(self.bolum.pk)
        self.assertEqual(bulunan.pk, self.bolum.pk)

    def test_bolum_getir_olmayan_hata(self):
        with self.assertRaises(Http404):
            DepartmentsService.bolum_getir(99999)

    def test_bolum_kodu_ile_getir(self):
        bulunan = DepartmentsService.bolum_kodu_ile_getir("BM")
        self.assertEqual(bulunan.pk, self.bolum.pk)

    def test_bolum_kodu_ile_getir_olmayan_hata(self):
        with self.assertRaises(Http404):
            DepartmentsService.bolum_kodu_ile_getir("YANLISKOD")


class BolumListViewTestleri(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        from apps.users.models import User
        self.client = APIClient()
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")
        self.user = User.objects.create_user(
            username="testuser", password="x", ad="Test", soyad="User", role=User.Role.OGRENCI,
        )

    def test_kimlik_dogrulanmamis_erisemez(self):
        response = self.client.get("/api/departments/")
        self.assertEqual(response.status_code, 401)

    def test_kimlik_dogrulanmis_liste_getirir(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/departments/")
        self.assertEqual(response.status_code, 200)

    def test_bolumler_listede_mevcut(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/departments/")
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["bolum_kodu"], "BM")

    def test_birden_fazla_bolum_listelenir(self):
        Bolum.objects.create(ad="Elektrik Elektronik", bolum_kodu="EE")
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/departments/")
        self.assertEqual(len(response.data), 2)


class BolumSerializerTestleri(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")

    def test_alanlar_mevcut(self):
        serializer = BolumSerializer(self.bolum)
        self.assertIn("id", serializer.data)
        self.assertIn("ad", serializer.data)
        self.assertIn("bolum_kodu", serializer.data)

    def test_degerler_dogru(self):
        serializer = BolumSerializer(self.bolum)
        self.assertEqual(serializer.data["ad"], "Bilgisayar Mühendisliği")
        self.assertEqual(serializer.data["bolum_kodu"], "BM")
        self.assertEqual(serializer.data["id"], self.bolum.pk)

    def test_liste_serialize(self):
        Bolum.objects.create(ad="Elektrik Elektronik", bolum_kodu="EE")
        bolumler = Bolum.objects.all()
        serializer = BolumSerializer(bolumler, many=True)
        self.assertEqual(len(serializer.data), 2)
