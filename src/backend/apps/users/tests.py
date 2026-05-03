import io
from decimal import Decimal

from django.test import TestCase

from apps.departments.models import Bolum
from apps.users.models import Akademisyen, Ogrenci, User, Yonetici
from apps.users.serializers import (
    AkademisyenOkuSerializer,
    OgrenciExcelSerializer,
    OgrenciOkuSerializer,
    UserSerializer,
)
from apps.users.services import UsersService


class TemelKurulum(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")


# -----------------------------------------------------------------------
# MODEL TESTLERİ
# -----------------------------------------------------------------------

class UserModelTestleri(TestCase):
    def test_tam_ad_donus(self):
        user = User(ad="Ali", soyad="Veli", username="ali.veli", role=User.Role.OGRENCI)
        self.assertEqual(user.tam_ad(), "Ali Veli")

    def test_str_donus(self):
        user = User(ad="Ali", soyad="Veli", username="ali.veli", role=User.Role.OGRENCI)
        self.assertIn("ali.veli", str(user))
        self.assertIn("OGRENCI", str(user))


class OgrenciModelTestleri(TemelKurulum):
    def test_str_donus(self):
        user = User.objects.create_user(
            username="ogr1", password="x", ad="Ali", soyad="Veli", role=User.Role.OGRENCI,
        )
        ogrenci = Ogrenci.objects.create(user=user, ogr_no="20240001", bolum=self.bolum, sinif=1)
        self.assertIn("20240001", str(ogrenci))

    def test_varsayilan_gpa_sifir(self):
        user = User.objects.create_user(
            username="ogr2", password="x", ad="Ali", soyad="Veli", role=User.Role.OGRENCI,
        )
        ogrenci = Ogrenci.objects.create(user=user, ogr_no="20240002", bolum=self.bolum, sinif=1)
        self.assertEqual(ogrenci.gpa, Decimal("0.00"))


class AkademisyenModelTestleri(TemelKurulum):
    def test_str_unvan_ile(self):
        user = User.objects.create_user(
            username="hoca1", password="x", ad="Ahmet", soyad="Yılmaz", role=User.Role.AKADEMISYEN,
        )
        akd = Akademisyen.objects.create(user=user, bolum=self.bolum, unvan=Akademisyen.Unvan.PROF_DR)
        self.assertIn("Prof. Dr.", str(akd))


# -----------------------------------------------------------------------
# SERVICE TESTLERİ
# -----------------------------------------------------------------------

class OgrenciNoUretTestleri(TemelKurulum):
    def test_ogr_no_uretildi(self):
        no = UsersService.ogr_no_uret()
        self.assertIsNotNone(no)
        self.assertEqual(len(no), 8)

    def test_ogr_no_yil_ile_baslar(self):
        import datetime
        no = UsersService.ogr_no_uret()
        self.assertTrue(no.startswith(str(datetime.datetime.now().year)))

    def test_ogr_no_sirayla_artar(self):
        UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        no1 = UsersService.ogr_no_uret()
        UsersService.ogrenci_olustur(ad="Ayşe", soyad="Kaya", bolum_kodu="BM")
        no2 = UsersService.ogr_no_uret()
        self.assertGreater(int(no2[4:]), int(no1[4:]))

    def test_ogr_no_benzersiz(self):
        no1 = UsersService.ogr_no_uret()
        UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        no2 = UsersService.ogr_no_uret()
        self.assertNotEqual(no1, no2)


class KullaniciAdiUretTestleri(TemelKurulum):
    def test_temel_kullanici_adi(self):
        sonuc = UsersService.kullanici_adi_uret("Ali", "Veli")
        self.assertEqual(sonuc, "ali.veli")

    def test_cakisma_durumunda_sayac_eklenir(self):
        User.objects.create_user(username="ali.veli", password="x", ad="Ali", soyad="Veli", role=User.Role.OGRENCI)
        sonuc = UsersService.kullanici_adi_uret("Ali", "Veli")
        self.assertEqual(sonuc, "ali.veli1")

    def test_birden_fazla_cakisma(self):
        User.objects.create_user(username="ali.veli", password="x", ad="Ali", soyad="Veli", role=User.Role.OGRENCI)
        User.objects.create_user(username="ali.veli1", password="x", ad="Ali", soyad="Veli", role=User.Role.OGRENCI)
        sonuc = UsersService.kullanici_adi_uret("Ali", "Veli")
        self.assertEqual(sonuc, "ali.veli2")

    def test_rol_prefix_eklenir(self):
        sonuc = UsersService.kullanici_adi_uret("Mehmet", "Demir", rol_prefix="akd.")
        self.assertEqual(sonuc, "akd.mehmet.demir")


class OgrenciOlusturTestleri(TemelKurulum):
    def test_ogrenci_olusturuldu(self):
        ogrenci = UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        self.assertIsNotNone(ogrenci.pk)
        self.assertEqual(ogrenci.bolum, self.bolum)

    def test_user_ogrenci_rolune_sahip(self):
        ogrenci = UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        self.assertEqual(ogrenci.user.role, User.Role.OGRENCI)

    def test_ogr_no_otomatik_atandi(self):
        ogrenci = UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        self.assertIsNotNone(ogrenci.ogr_no)
        self.assertTrue(len(ogrenci.ogr_no) > 0)

    def test_varsayilan_sinif_bir(self):
        ogrenci = UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        self.assertEqual(ogrenci.sinif, 1)

    def test_sinif_belirtilebilir(self):
        ogrenci = UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM", sinif=3)
        self.assertEqual(ogrenci.sinif, 3)

    def test_gecersiz_bolum_kodu_hata(self):
        from django.http import Http404
        with self.assertRaises(Http404):
            UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="YANLIS")

    def test_iki_ogrencinin_ogr_no_farkli(self):
        ogr1 = UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        ogr2 = UsersService.ogrenci_olustur(ad="Ayşe", soyad="Kaya", bolum_kodu="BM")
        self.assertNotEqual(ogr1.ogr_no, ogr2.ogr_no)


class GpaGuncelleTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        self.ogrenci = UsersService.ogrenci_olustur(ad="Ali", soyad="Veli", bolum_kodu="BM")
        akd_user = User.objects.create_user(
            username="hoca1", password="x", ad="Hoca", soyad="Bir", role=User.Role.AKADEMISYEN,
        )
        self.akademisyen = Akademisyen.objects.create(
            user=akd_user, bolum=self.bolum, unvan=Akademisyen.Unvan.DR_OGRETIM_UYESI,
        )

    def _kayit_olustur(self, ders_kodu, kredi, vize, final):
        from apps.courses.models import Ders, DonemDersi
        from apps.enrollments.models import DersKaydi
        ders = Ders.objects.create(ders_kodu=ders_kodu, ad=ders_kodu, kredi=kredi, min_sinif=1, bolum=self.bolum)
        dd = DonemDersi.objects.create(
            ders=ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )
        return DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=dd,
            vize_notu=vize, final_notu=final,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_gpa_hesaplandi(self):
        self._kayit_olustur("BM101", 3, 80, 90)
        gpa = UsersService.gpa_guncelle(self.ogrenci)
        self.assertGreater(gpa, Decimal("0.00"))

    def test_gpa_sadece_onaylilari_hesaplar(self):
        from apps.courses.models import Ders, DonemDersi
        from apps.enrollments.models import DersKaydi
        ders = Ders.objects.create(ders_kodu="BM102", ad="Test", kredi=3, min_sinif=1, bolum=self.bolum)
        dd = DonemDersi.objects.create(
            ders=ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=dd,
            vize_notu=100, final_notu=100,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )
        gpa = UsersService.gpa_guncelle(self.ogrenci)
        self.assertEqual(gpa, Decimal("0.00"))

    def test_gpa_aa_notu(self):
        self._kayit_olustur("BM103", 3, 95, 95)
        gpa = UsersService.gpa_guncelle(self.ogrenci)
        self.assertEqual(gpa, Decimal("4.00"))

    def test_gpa_ff_notu(self):
        self._kayit_olustur("BM104", 3, 0, 0)
        gpa = UsersService.gpa_guncelle(self.ogrenci)
        self.assertEqual(gpa, Decimal("0.00"))

    def test_gpa_modelde_guncellendi(self):
        self._kayit_olustur("BM105", 3, 80, 90)
        UsersService.gpa_guncelle(self.ogrenci)
        self.ogrenci.refresh_from_db()
        self.assertGreater(self.ogrenci.gpa, Decimal("0.00"))


class OgrenciKaydiExcelTestleri(TemelKurulum):
    def _excel_olustur(self, satirlar):
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(["ad", "soyad", "bolum_kodu"])
        for satir in satirlar:
            ws.append(satir)
        dosya = io.BytesIO()
        wb.save(dosya)
        dosya.seek(0)
        dosya.name = "test.xlsx"
        return dosya

    def test_basarili_kayitlar(self):
        dosya = self._excel_olustur([["Ali", "Veli", "BM"], ["Ayşe", "Kaya", "BM"]])
        sonuc = UsersService.ogrenci_kaydi_excel(dosya)
        self.assertEqual(sonuc["basarili"], 2)
        self.assertEqual(sonuc["hatali"], 0)

    def test_gecersiz_bolum_kodu_hatali(self):
        dosya = self._excel_olustur([["Ali", "Veli", "YANLIS"]])
        sonuc = UsersService.ogrenci_kaydi_excel(dosya)
        self.assertEqual(sonuc["hatali"], 1)
        self.assertEqual(sonuc["basarili"], 0)

    def test_eksik_alan_hatali(self):
        dosya = self._excel_olustur([["Ali", None, "BM"]])
        sonuc = UsersService.ogrenci_kaydi_excel(dosya)
        self.assertEqual(sonuc["hatali"], 1)

    def test_karisik_satirlar(self):
        dosya = self._excel_olustur([
            ["Ali", "Veli", "BM"],
            ["Geçersiz", None, "YANLIS"],
            ["Fatma", "Çelik", "BM"],
        ])
        sonuc = UsersService.ogrenci_kaydi_excel(dosya)
        self.assertEqual(sonuc["basarili"], 2)
        self.assertEqual(sonuc["hatali"], 1)

    def test_hata_detaylari_donuyor(self):
        dosya = self._excel_olustur([["Ali", None, "BM"]])
        sonuc = UsersService.ogrenci_kaydi_excel(dosya)
        self.assertIn("hatalar", sonuc)
        self.assertEqual(len(sonuc["hatalar"]), 1)
        self.assertIn("satir", sonuc["hatalar"][0])

    def test_bos_excel_sifir_kayit(self):
        dosya = self._excel_olustur([])
        sonuc = UsersService.ogrenci_kaydi_excel(dosya)
        self.assertEqual(sonuc["basarili"], 0)
        self.assertEqual(sonuc["hatali"], 0)


# -----------------------------------------------------------------------
# SERİALİZER TESTLERİ
# -----------------------------------------------------------------------

class UserSerializerTestleri(TestCase):
    def test_alanlar_mevcut(self):
        user = User.objects.create_user(
            username="test1", password="x", ad="Ali", soyad="Veli", role=User.Role.OGRENCI,
        )
        serializer = UserSerializer(user)
        for alan in ["id", "username", "ad", "soyad", "email", "role"]:
            self.assertIn(alan, serializer.data)

    def test_role_read_only(self):
        serializer = UserSerializer(data={
            "username": "test2", "ad": "Ali", "soyad": "Veli",
            "email": "a@a.com", "role": User.Role.YONETICI,
        })
        serializer.is_valid()
        self.assertNotIn("role", serializer.validated_data)


class OgrenciOkuSerializerTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        user = User.objects.create_user(
            username="ogr1", password="x", ad="Ali", soyad="Veli", role=User.Role.OGRENCI,
        )
        self.ogrenci = Ogrenci.objects.create(user=user, ogr_no="20240001", bolum=self.bolum, sinif=1)

    def test_alanlar_mevcut(self):
        serializer = OgrenciOkuSerializer(self.ogrenci)
        for alan in ["id", "user", "ogr_no", "bolum", "sinif", "gpa"]:
            self.assertIn(alan, serializer.data)

    def test_bolum_nested(self):
        serializer = OgrenciOkuSerializer(self.ogrenci)
        self.assertIsInstance(serializer.data["bolum"], dict)
        self.assertEqual(serializer.data["bolum"]["ad"], "Bilgisayar Mühendisliği")
        self.assertEqual(serializer.data["bolum"]["bolum_kodu"], "BM")

    def test_user_nested(self):
        serializer = OgrenciOkuSerializer(self.ogrenci)
        self.assertIsInstance(serializer.data["user"], dict)
        self.assertEqual(serializer.data["user"]["ad"], "Ali")


class AkademisyenOkuSerializerTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        user = User.objects.create_user(
            username="hoca1", password="x", ad="Ahmet", soyad="Yılmaz", role=User.Role.AKADEMISYEN,
        )
        self.akademisyen = Akademisyen.objects.create(
            user=user, bolum=self.bolum, unvan=Akademisyen.Unvan.PROF_DR,
        )

    def test_alanlar_mevcut(self):
        serializer = AkademisyenOkuSerializer(self.akademisyen)
        for alan in ["id", "user", "bolum", "unvan", "unvan_goster"]:
            self.assertIn(alan, serializer.data)

    def test_bolum_nested(self):
        serializer = AkademisyenOkuSerializer(self.akademisyen)
        self.assertIsInstance(serializer.data["bolum"], dict)
        self.assertEqual(serializer.data["bolum"]["bolum_kodu"], "BM")

    def test_unvan_goster_dogru(self):
        serializer = AkademisyenOkuSerializer(self.akademisyen)
        self.assertEqual(serializer.data["unvan_goster"], "Prof. Dr.")


class OgrenciExcelSerializerTestleri(TestCase):
    def test_gecerli_xlsx_dosyasi(self):
        import openpyxl
        wb = openpyxl.Workbook()
        dosya = io.BytesIO()
        wb.save(dosya)
        dosya.seek(0)
        dosya.name = "test.xlsx"
        from django.core.files.uploadedfile import InMemoryUploadedFile
        uploaded = InMemoryUploadedFile(dosya, None, "test.xlsx", "application/vnd.ms-excel", dosya.getbuffer().nbytes, None)
        serializer = OgrenciExcelSerializer(data={"dosya": uploaded})
        self.assertTrue(serializer.is_valid())

    def test_gecersiz_dosya_uzantisi(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        dosya = SimpleUploadedFile("test.txt", b"veri", content_type="text/plain")
        serializer = OgrenciExcelSerializer(data={"dosya": dosya})
        self.assertFalse(serializer.is_valid())
