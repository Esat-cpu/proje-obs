from django.core.exceptions import ValidationError
from django.http import Http404
from django.test import TestCase

from apps.departments.models import Bolum
from apps.departments.services import (
    bolum_getir,
    bolum_guncelle,
    bolum_kodu_ile_getir,
    bolum_listesi_getir,
    bolum_olustur,
    bolum_sil,
)


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


class BolumServisTestleri(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")

    def test_bolum_olustur(self):
        yeni = bolum_olustur(ad="Makine Mühendisliği", bolum_kodu="MM")
        self.assertIsNotNone(yeni.pk)
        self.assertTrue(Bolum.objects.filter(bolum_kodu="MM").exists())

    def test_bolum_olustur_duplicate_kodu_hata(self):
        with self.assertRaises(Exception):
            bolum_olustur(ad="Başka", bolum_kodu="BM")

    def test_bolum_getir(self):
        bulunan = bolum_getir(self.bolum.pk)
        self.assertEqual(bulunan.pk, self.bolum.pk)

    def test_bolum_getir_olmayan_hata(self):
        with self.assertRaises(Http404):
            bolum_getir(99999)

    def test_bolum_kodu_ile_getir(self):
        bulunan = bolum_kodu_ile_getir("BM")
        self.assertEqual(bulunan.pk, self.bolum.pk)

    def test_bolum_kodu_ile_getir_olmayan_hata(self):
        with self.assertRaises(Http404):
            bolum_kodu_ile_getir("YANLISKOD")

    def test_bolum_listesi_getir(self):
        Bolum.objects.create(ad="Elektrik Elektronik", bolum_kodu="EE")
        liste = bolum_listesi_getir()
        self.assertEqual(liste.count(), 2)

    def test_bolum_listesi_bolum_kodu_sirali(self):
        Bolum.objects.create(ad="Makine Mühendisliği", bolum_kodu="MM")
        Bolum.objects.create(ad="Elektrik Elektronik", bolum_kodu="EE")
        liste = list(bolum_listesi_getir())
        kodlar = [b.bolum_kodu for b in liste]
        self.assertEqual(kodlar, sorted(kodlar))

    def test_bolum_guncelle_ad(self):
        guncellendi = bolum_guncelle(self.bolum.pk, ad="Yeni Ad")
        self.assertEqual(guncellendi.ad, "Yeni Ad")

    def test_bolum_guncelle_kod(self):
        guncellendi = bolum_guncelle(self.bolum.pk, bolum_kodu="YK")
        self.assertEqual(guncellendi.bolum_kodu, "YK")

    def test_bolum_guncelle_olmayan_hata(self):
        with self.assertRaises(Http404):
            bolum_guncelle(99999, ad="Test")

    def test_bolum_sil(self):
        silinecek = Bolum.objects.create(ad="Silinecek", bolum_kodu="SL")
        bolum_sil(silinecek.pk)
        self.assertFalse(Bolum.objects.filter(pk=silinecek.pk).exists())

    def test_bolum_sil_olmayan_hata(self):
        with self.assertRaises(Http404):
            bolum_sil(99999)


class BolumSilBagliKayitTestleri(TestCase):
    def setUp(self):
        from apps.users.models import Akademisyen, Ogrenci, User
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")

        ogr_user = User.objects.create_user(
            username="ogr1", password="x",
            ad="Ali", soyad="Veli",
            role=User.Role.OGRENCI,
        )
        self.ogrenci = Ogrenci.objects.create(
            user=ogr_user, ogr_no="20240001",
            bolum=self.bolum, sinif=1,
        )

        akd_user = User.objects.create_user(
            username="hoca1", password="x",
            ad="Ahmet", soyad="Yılmaz",
            role=User.Role.AKADEMISYEN,
        )
        self.akademisyen = Akademisyen.objects.create(
            user=akd_user, bolum=self.bolum,
            unvan=Akademisyen.Unvan.DR_OGRETIM_UYESI,
        )

    def test_bagli_ogrenci_olan_bolum_silinemiyor(self):
        with self.assertRaises(ValidationError):
            bolum_sil(self.bolum.pk)

    def test_bagli_akademisyen_olan_bolum_silinemiyor(self):
        self.ogrenci.delete()
        self.ogrenci.user.delete()
        with self.assertRaises(ValidationError):
            bolum_sil(self.bolum.pk)

    def test_iliski_olmayan_bolum_siliniyor(self):
        bos_bolum = Bolum.objects.create(ad="Boş Bölüm", bolum_kodu="BB")
        bolum_sil(bos_bolum.pk)
        self.assertFalse(Bolum.objects.filter(pk=bos_bolum.pk).exists())