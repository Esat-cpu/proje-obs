from django.core.exceptions import ValidationError
from django.http import Http404
from django.test import TestCase

from apps.courses.models import Ders, DonemDersi
from apps.courses.serializers import DersSerializer, DonemDersiOkuSerializer
from apps.courses.services import CoursesService
from apps.departments.models import Bolum
from apps.users.models import Akademisyen, User


class TemelKurulum(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")
        akd_user = User.objects.create_user(
            username="hoca1", password="x",
            ad="Ahmet", soyad="Yılmaz",
            role=User.Role.AKADEMISYEN,
        )
        self.akademisyen = Akademisyen.objects.create(
            user=akd_user, bolum=self.bolum,
            unvan=Akademisyen.Unvan.DR_OGRETIM_UYESI,
        )
        self.ders = Ders.objects.create(
            ders_kodu="BM101", ad="Algoritma", kredi=3, min_sinif=1, bolum=self.bolum
        )
        self.donem_dersi = DonemDersi.objects.create(
            ders=self.ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )


class DersModelTestleri(TemelKurulum):
    def test_str_donus(self):
        self.assertEqual(str(self.ders), "Algoritma (BM101)")

    def test_ders_kodu_benzersiz(self):
        with self.assertRaises(Exception):
            Ders.objects.create(ders_kodu="BM101", ad="Başka", kredi=2, min_sinif=1, bolum=self.bolum)

    def test_gecersiz_kredi_siniri_ust(self):
        ders = Ders(ders_kodu="BM999", ad="Test", kredi=11, min_sinif=1, bolum=self.bolum)
        with self.assertRaises(ValidationError):
            ders.full_clean()

    def test_gecersiz_kredi_siniri_alt(self):
        ders = Ders(ders_kodu="BM998", ad="Test", kredi=0, min_sinif=1, bolum=self.bolum)
        with self.assertRaises(ValidationError):
            ders.full_clean()

    def test_gecersiz_min_sinif(self):
        ders = Ders(ders_kodu="BM997", ad="Test", kredi=3, min_sinif=5, bolum=self.bolum)
        with self.assertRaises(ValidationError):
            ders.full_clean()

    def test_bolum_iliski(self):
        self.assertEqual(self.ders.bolum, self.bolum)


class DonemDersiModelTestleri(TemelKurulum):
    def test_str_donus(self):
        self.assertIn("Algoritma", str(self.donem_dersi))
        self.assertIn("2024", str(self.donem_dersi))

    def test_aktif_mi_true(self):
        self.assertTrue(self.donem_dersi.aktif_mi())

    def test_aktif_mi_false(self):
        self.donem_dersi.aktiflik_durumu = False
        self.donem_dersi.save()
        self.assertFalse(self.donem_dersi.aktif_mi())

    def test_unique_kisitlama(self):
        with self.assertRaises(Exception):
            DonemDersi.objects.create(
                ders=self.ders, akademisyen=self.akademisyen,
                yil=2024, donem="GUZ", kontenjan=20,
            )

    def test_varsayilan_pasif_baslar(self):
        ders2 = Ders.objects.create(ders_kodu="BM102", ad="Veri Yapıları", kredi=3, min_sinif=1, bolum=self.bolum)
        dd = DonemDersi.objects.create(
            ders=ders2, akademisyen=self.akademisyen,
            yil=2024, donem="BAHAR", kontenjan=20,
        )
        self.assertFalse(dd.aktiflik_durumu)


class CoursesServiceTestleri(TemelKurulum):
    def test_dersleri_listele_tumu(self):
        Ders.objects.create(ders_kodu="BM200", ad="İşletim Sistemleri", kredi=3, min_sinif=2, bolum=self.bolum)
        sonuc = CoursesService.dersleri_listele()
        self.assertEqual(sonuc.count(), 2)

    def test_dersleri_listele_sinif_filtresi(self):
        Ders.objects.create(ders_kodu="BM300", ad="Derleyiciler", kredi=3, min_sinif=3, bolum=self.bolum)
        sonuc = CoursesService.dersleri_listele(sinif=2)
        for ders in sonuc:
            self.assertLessEqual(ders.min_sinif, 2)

    def test_dersleri_listele_ust_sinif_disarda(self):
        Ders.objects.create(ders_kodu="BM400", ad="İleri Konular", kredi=3, min_sinif=4, bolum=self.bolum)
        sonuc = CoursesService.dersleri_listele(sinif=1)
        kodlar = list(sonuc.values_list("ders_kodu", flat=True))
        self.assertNotIn("BM400", kodlar)

    def test_ders_getir(self):
        bulunan = CoursesService.ders_getir(self.ders.pk)
        self.assertEqual(bulunan.pk, self.ders.pk)

    def test_ders_getir_olmayan_hata(self):
        with self.assertRaises(Http404):
            CoursesService.ders_getir(99999)

    def test_donem_derslerini_listele_akademisyen_filtresi(self):
        sonuc = CoursesService.donem_derslerini_listele(akademisyen=self.akademisyen)
        self.assertEqual(sonuc.count(), 1)

    def test_donem_derslerini_listele_sadece_aktif(self):
        ders2 = Ders.objects.create(ders_kodu="BM102", ad="Test", kredi=2, min_sinif=1, bolum=self.bolum)
        DonemDersi.objects.create(
            ders=ders2, akademisyen=self.akademisyen,
            yil=2024, donem="BAHAR", kontenjan=20, aktiflik_durumu=False,
        )
        sonuc = CoursesService.donem_derslerini_listele(sadece_aktif=True)
        for dd in sonuc:
            self.assertTrue(dd.aktiflik_durumu)

    def test_akademisyen_derslerini_getir(self):
        sonuc = CoursesService.akademisyen_derslerini_getir(self.akademisyen)
        self.assertEqual(sonuc.count(), 1)
        self.assertEqual(sonuc.first().akademisyen, self.akademisyen)

    def test_donem_dersi_getir(self):
        bulunan = CoursesService.donem_dersi_getir(self.donem_dersi.pk)
        self.assertEqual(bulunan.pk, self.donem_dersi.pk)

    def test_donem_dersi_getir_olmayan_hata(self):
        with self.assertRaises(Http404):
            CoursesService.donem_dersi_getir(99999)


class KontenjanTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        self.donem_dersi.kontenjan = 2
        self.donem_dersi.save()

    def _ogrenci_olustur(self, no):
        from apps.users.models import Ogrenci
        user = User.objects.create_user(
            username=f"ogr{no}", password="x",
            ad="Ad", soyad="Soyad", role=User.Role.OGRENCI,
        )
        return Ogrenci.objects.create(
            user=user, ogr_no=f"2024{no:04d}", bolum=self.bolum, sinif=1,
        )

    def test_kontenjan_dolmamis(self):
        self.assertFalse(CoursesService.kontenjan_dolu_mu(self.donem_dersi))

    def test_kontenjan_dolu(self):
        from apps.enrollments.models import DersKaydi
        ogr1 = self._ogrenci_olustur(1)
        ogr2 = self._ogrenci_olustur(2)
        DersKaydi.objects.create(ogrenci=ogr1, donem_dersi=self.donem_dersi, onay_durumu=DersKaydi.Durum.ONAYLANDI)
        DersKaydi.objects.create(ogrenci=ogr2, donem_dersi=self.donem_dersi, onay_durumu=DersKaydi.Durum.ONAYLANDI)
        self.assertTrue(CoursesService.kontenjan_dolu_mu(self.donem_dersi))

    def test_beklemede_kayit_kontenjana_sayilmaz(self):
        from apps.enrollments.models import DersKaydi
        ogr1 = self._ogrenci_olustur(3)
        ogr2 = self._ogrenci_olustur(4)
        DersKaydi.objects.create(ogrenci=ogr1, donem_dersi=self.donem_dersi, onay_durumu=DersKaydi.Durum.BEKLEMEDE)
        DersKaydi.objects.create(ogrenci=ogr2, donem_dersi=self.donem_dersi, onay_durumu=DersKaydi.Durum.BEKLEMEDE)
        self.assertFalse(CoursesService.kontenjan_dolu_mu(self.donem_dersi))

    def test_reddedildi_kayit_kontenjana_sayilmaz(self):
        from apps.enrollments.models import DersKaydi
        ogr1 = self._ogrenci_olustur(5)
        ogr2 = self._ogrenci_olustur(6)
        DersKaydi.objects.create(ogrenci=ogr1, donem_dersi=self.donem_dersi, onay_durumu=DersKaydi.Durum.REDDEDILDI)
        DersKaydi.objects.create(ogrenci=ogr2, donem_dersi=self.donem_dersi, onay_durumu=DersKaydi.Durum.REDDEDILDI)
        self.assertFalse(CoursesService.kontenjan_dolu_mu(self.donem_dersi))


class DersSerializerTestleri(TemelKurulum):
    def test_alanlar_mevcut(self):
        serializer = DersSerializer(self.ders)
        self.assertIn("bolum", serializer.data)
        self.assertIn("ders_kodu", serializer.data)
        self.assertIn("kredi", serializer.data)
        self.assertIn("min_sinif", serializer.data)

    def test_degerler_dogru(self):
        serializer = DersSerializer(self.ders)
        self.assertEqual(serializer.data["ders_kodu"], "BM101")
        self.assertEqual(serializer.data["kredi"], 3)
        self.assertEqual(serializer.data["bolum"], self.bolum.pk)


class DonemDersiOkuSerializerTestleri(TemelKurulum):
    def test_akademisyen_ad_alani(self):
        serializer = DonemDersiOkuSerializer(self.donem_dersi)
        self.assertIn("akademisyen_ad", serializer.data)
        self.assertEqual(serializer.data["akademisyen_ad"], str(self.akademisyen))

    def test_ders_nested(self):
        serializer = DonemDersiOkuSerializer(self.donem_dersi)
        self.assertIsInstance(serializer.data["ders"], dict)
        self.assertEqual(serializer.data["ders"]["ders_kodu"], "BM101")

    def test_aktiflik_durumu_alani(self):
        serializer = DonemDersiOkuSerializer(self.donem_dersi)
        self.assertIn("aktiflik_durumu", serializer.data)
