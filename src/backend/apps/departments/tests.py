from django.core.exceptions import ValidationError
from django.http import Http404
from django.test import TestCase

from apps.departments.models import Bolum
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
