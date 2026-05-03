from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.courses.models import Ders, DonemDersi
from apps.courses.services import (
    dersleri_listele,
    ders_getir,
    ders_guncelle,
    ders_olustur,
    ders_sil,
    donem_dersi_aktif_et,
    donem_dersi_olustur,
    donem_dersi_pasif_et,
    donem_dersi_sil,
    kontenjan_dolu_mu,
)
from apps.departments.models import Bolum
from apps.users.models import Akademisyen, User


class TemelTestKurulumu(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")
        self.user = User.objects.create_user(
            username="hoca1",
            password="sifre123",
            ad="Ahmet",
            soyad="Yılmaz",
            role=User.Role.AKADEMISYEN,
        )
        self.akademisyen = Akademisyen.objects.create(
            user=self.user,
            bolum=self.bolum,
            unvan=Akademisyen.Unvan.DR_OGRETIM_UYESI,
        )
        self.ders = Ders.objects.create(
            ders_kodu="BM101",
            ad="Algoritma",
            kredi=3,
            min_sinif=1,
        )


class DersModelTestleri(TemelTestKurulumu):
    def test_str_donus(self):
        self.assertEqual(str(self.ders), "Algoritma (BM101)")

    def test_ders_kodu_benzersiz(self):
        with self.assertRaises(Exception):
            Ders.objects.create(ders_kodu="BM101", ad="Başka Ders", kredi=2, min_sinif=1)

    def test_gecersiz_kredi_siniri(self):
        ders = Ders(ders_kodu="BM999", ad="Test", kredi=11, min_sinif=1)
        with self.assertRaises(ValidationError):
            ders.full_clean()

    def test_gecersiz_min_sinif(self):
        ders = Ders(ders_kodu="BM998", ad="Test", kredi=3, min_sinif=5)
        with self.assertRaises(ValidationError):
            ders.full_clean()


class DonemDersiModelTestleri(TemelTestKurulumu):
    def setUp(self):
        super().setUp()
        self.donem_dersi = DonemDersi.objects.create(
            ders=self.ders,
            akademisyen=self.akademisyen,
            yil=2024,
            donem="GUZ",
            kontenjan=30,
            aktiflik_durumu=False,
        )

    def test_aktif_mi_false(self):
        self.assertFalse(self.donem_dersi.aktif_mi())

    def test_aktif_mi_true(self):
        self.donem_dersi.aktiflik_durumu = True
        self.donem_dersi.save()
        self.assertTrue(self.donem_dersi.aktif_mi())

    def test_str_donus(self):
        self.assertIn("Algoritma", str(self.donem_dersi))
        self.assertIn("2024", str(self.donem_dersi))

    def test_unique_donem_dersi_kisitlamasi(self):
        with self.assertRaises(Exception):
            DonemDersi.objects.create(
                ders=self.ders,
                akademisyen=self.akademisyen,
                yil=2024,
                donem="GUZ",
                kontenjan=20,
            )


class DersServisTestleri(TemelTestKurulumu):
    def test_ders_olustur(self):
        ders = ders_olustur(ders_kodu="BM102", ad="Veri Yapıları", kredi=4, min_sinif=1)
        self.assertEqual(ders.ders_kodu, "BM102")
        self.assertTrue(Ders.objects.filter(ders_kodu="BM102").exists())

    def test_ders_olustur_gecersiz_kredi(self):
        with self.assertRaises(ValidationError):
            ders_olustur(ders_kodu="BM103", ad="Test", kredi=0, min_sinif=1)

    def test_ders_guncelle(self):
        guncellendi = ders_guncelle(self.ders.pk, ad="Algoritma ve Karmaşıklık")
        self.assertEqual(guncellendi.ad, "Algoritma ve Karmaşıklık")

    def test_ders_sil(self):
        yeni_ders = Ders.objects.create(ders_kodu="BM999", ad="Silinecek", kredi=2, min_sinif=1)
        ders_sil(yeni_ders.pk)
        self.assertFalse(Ders.objects.filter(pk=yeni_ders.pk).exists())

    def test_dersleri_listele_tumu(self):
        Ders.objects.create(ders_kodu="BM200", ad="İşletim Sistemleri", kredi=3, min_sinif=2)
        sonuc = dersleri_listele()
        self.assertEqual(sonuc.count(), 2)

    def test_dersleri_listele_sinif_filtresi(self):
        Ders.objects.create(ders_kodu="BM300", ad="Derleyiciler", kredi=3, min_sinif=3)
        sonuc = dersleri_listele(sinif=2)
        for ders in sonuc:
            self.assertLessEqual(ders.min_sinif, 2)

    def test_dersleri_listele_sinif_filtresi_yukari_sinif_disarda(self):
        Ders.objects.create(ders_kodu="BM400", ad="İleri Konular", kredi=3, min_sinif=4)
        sonuc = dersleri_listele(sinif=1)
        kodlar = list(sonuc.values_list("ders_kodu", flat=True))
        self.assertNotIn("BM400", kodlar)


class DonemDersiServisTestleri(TemelTestKurulumu):
    def test_donem_dersi_olustur_pasif_baslar(self):
        donem_dersi = donem_dersi_olustur(
            ders=self.ders,
            akademisyen=self.akademisyen,
            yil=2024,
            donem="GUZ",
            kontenjan=25,
        )
        self.assertFalse(donem_dersi.aktiflik_durumu)

    def test_donem_dersi_aktif_et(self):
        donem_dersi = donem_dersi_olustur(
            ders=self.ders,
            akademisyen=self.akademisyen,
            yil=2024,
            donem="GUZ",
            kontenjan=25,
        )
        guncellendi = donem_dersi_aktif_et(donem_dersi.pk)
        self.assertTrue(guncellendi.aktiflik_durumu)

    def test_donem_dersi_pasif_et(self):
        donem_dersi = DonemDersi.objects.create(
            ders=self.ders,
            akademisyen=self.akademisyen,
            yil=2024,
            donem="BAHAR",
            kontenjan=25,
            aktiflik_durumu=True,
        )
        guncellendi = donem_dersi_pasif_et(donem_dersi.pk)
        self.assertFalse(guncellendi.aktiflik_durumu)

    def test_aktif_donem_dersi_silinemez(self):
        donem_dersi = DonemDersi.objects.create(
            ders=self.ders,
            akademisyen=self.akademisyen,
            yil=2025,
            donem="GUZ",
            kontenjan=10,
            aktiflik_durumu=True,
        )
        with self.assertRaises(ValidationError):
            donem_dersi_sil(donem_dersi.pk)

    def test_pasif_donem_dersi_silinir(self):
        donem_dersi = DonemDersi.objects.create(
            ders=self.ders,
            akademisyen=self.akademisyen,
            yil=2025,
            donem="BAHAR",
            kontenjan=10,
            aktiflik_durumu=False,
        )
        donem_dersi_sil(donem_dersi.pk)
        self.assertFalse(DonemDersi.objects.filter(pk=donem_dersi.pk).exists())


class KontenjanTestleri(TemelTestKurulumu):
    def setUp(self):
        super().setUp()
        self.donem_dersi = DonemDersi.objects.create(
            ders=self.ders,
            akademisyen=self.akademisyen,
            yil=2024,
            donem="GUZ",
            kontenjan=2,
            aktiflik_durumu=True,
        )

    def _ogrenci_olustur(self, no):
        from apps.users.models import Ogrenci
        user = User.objects.create_user(
            username=f"ogr{no}",
            password="sifre",
            ad="Ad",
            soyad="Soyad",
            role=User.Role.OGRENCI,
        )
        return Ogrenci.objects.create(
            user=user,
            ogr_no=f"2024{no:04d}",
            bolum=self.bolum,
            sinif=1,
        )

    def test_kontenjan_dolmamis(self):
        self.assertFalse(kontenjan_dolu_mu(self.donem_dersi))

    def test_kontenjan_dolu(self):
        from apps.enrollments.models import DersKaydi
        ogr1 = self._ogrenci_olustur(1)
        ogr2 = self._ogrenci_olustur(2)
        DersKaydi.objects.create(ogrenci=ogr1, donem_dersi=self.donem_dersi, onay_durumu=True)
        DersKaydi.objects.create(ogrenci=ogr2, donem_dersi=self.donem_dersi, onay_durumu=True)
        self.assertTrue(kontenjan_dolu_mu(self.donem_dersi))

    def test_onaysiz_kayit_kontenjana_sayilmaz(self):
        from apps.enrollments.models import DersKaydi
        ogr1 = self._ogrenci_olustur(3)
        ogr2 = self._ogrenci_olustur(4)
        DersKaydi.objects.create(ogrenci=ogr1, donem_dersi=self.donem_dersi, onay_durumu=False)
        DersKaydi.objects.create(ogrenci=ogr2, donem_dersi=self.donem_dersi, onay_durumu=False)
        self.assertFalse(kontenjan_dolu_mu(self.donem_dersi))