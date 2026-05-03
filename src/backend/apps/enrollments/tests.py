from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.courses.models import Ders, DonemDersi
from apps.departments.models import Bolum
from apps.enrollments.models import DersKaydi, DersKayitDonemi
from apps.enrollments.services import (
    aktif_kayit_donemi_getir,
    bekleyen_kayitlari_listele,
    ders_kaydi_olustur,
    ders_kaydi_onayla,
    ders_kaydi_reddet,
    donem_dersi_ogrenci_listesi,
    kayit_donemi_aktif_mi,
    kayit_donemi_guncelle,
    kayit_donemi_olustur,
    not_gir_guncelle,
    ogrenci_derslerini_listele,
    transkript_getir,
)
from apps.users.models import Akademisyen, Ogrenci, User


class TemelTestKurulumu(TestCase):
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

        akd_user2 = User.objects.create_user(
            username="hoca2", password="x",
            ad="Mehmet", soyad="Demir",
            role=User.Role.AKADEMISYEN,
        )
        self.akademisyen2 = Akademisyen.objects.create(
            user=akd_user2, bolum=self.bolum,
            unvan=Akademisyen.Unvan.PROF_DR,
        )

        ogr_user = User.objects.create_user(
            username="ogr1", password="x",
            ad="Ali", soyad="Veli",
            role=User.Role.OGRENCI,
        )
        self.ogrenci = Ogrenci.objects.create(
            user=ogr_user, ogr_no="20240001",
            bolum=self.bolum, sinif=1,
        )

        self.ders = Ders.objects.create(
            ders_kodu="BM101", ad="Algoritma", kredi=3, min_sinif=1
        )
        self.donem_dersi = DonemDersi.objects.create(
            ders=self.ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )

        simdi = timezone.now()
        self.aktif_donem = DersKayitDonemi.objects.create(
            yil=2024, donem="GUZ",
            baslangic=simdi - timedelta(days=1),
            bitis=simdi + timedelta(days=7),
        )


class DersKaydiModelTestleri(TemelTestKurulumu):
    def test_ortalama_dogru_hesaplandi(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            vize_notu=80,
            final_notu=90,
        )
        beklenen = round(80 * Decimal("0.4") + 90 * Decimal("0.6"), 2)
        self.assertEqual(kayit.ortalama, beklenen)

    def test_ortalama_vize_eksik_none(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            vize_notu=None,
            final_notu=90,
        )
        self.assertIsNone(kayit.ortalama)

    def test_ortalama_final_eksik_none(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            vize_notu=80,
            final_notu=None,
        )
        self.assertIsNone(kayit.ortalama)

    def test_ortalama_ikisi_eksik_none(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            vize_notu=None,
            final_notu=None,
        )
        self.assertIsNone(kayit.ortalama)

    def test_harf_notu_aa(self):
        kayit = DersKaydi(vize_notu=95, final_notu=95, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "AA")

    def test_harf_notu_ba(self):
        kayit = DersKaydi(vize_notu=85, final_notu=85, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "BA")

    def test_harf_notu_bb(self):
        kayit = DersKaydi(vize_notu=80, final_notu=80, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "BB")

    def test_harf_notu_cb(self):
        kayit = DersKaydi(vize_notu=70, final_notu=70, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "CB")

    def test_harf_notu_cc(self):
        kayit = DersKaydi(vize_notu=60, final_notu=60, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "CC")

    def test_harf_notu_dc(self):
        kayit = DersKaydi(vize_notu=55, final_notu=55, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "DC")

    def test_harf_notu_dd(self):
        kayit = DersKaydi(vize_notu=50, final_notu=50, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "DD")

    def test_harf_notu_ff(self):
        kayit = DersKaydi(vize_notu=30, final_notu=30, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "FF")

    def test_harf_notu_eksik_notta_none(self):
        kayit = DersKaydi(vize_notu=None, final_notu=None, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertIsNone(kayit._harf_notu_hesapla())

    def test_save_harf_notu_otomatik_atandi(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            vize_notu=80,
            final_notu=90,
            onay_durumu=True,
        )
        self.assertIsNotNone(kayit.harf_notu)

    def test_save_notlar_eksikken_harf_notu_none(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            onay_durumu=True,
        )
        self.assertIsNone(kayit.harf_notu)


class DersKayitDonemiModelTestleri(TemelTestKurulumu):
    def test_aktif_mi_aktif_donem(self):
        self.assertTrue(self.aktif_donem.aktif_mi())

    def test_aktif_mi_suresi_dolmus_donem(self):
        gecmis_donem = DersKayitDonemi.objects.create(
            yil=2023, donem="GUZ",
            baslangic=timezone.now() - timedelta(days=10),
            bitis=timezone.now() - timedelta(days=3),
        )
        self.assertFalse(gecmis_donem.aktif_mi())

    def test_aktif_mi_gelecek_donem(self):
        gelecek_donem = DersKayitDonemi.objects.create(
            yil=2025, donem="BAHAR",
            baslangic=timezone.now() + timedelta(days=3),
            bitis=timezone.now() + timedelta(days=10),
        )
        self.assertFalse(gelecek_donem.aktif_mi())


class KayitDonemiServisTestleri(TemelTestKurulumu):
    def test_aktif_donem_getiriliyor(self):
        donem = aktif_kayit_donemi_getir()
        self.assertIsNotNone(donem)
        self.assertEqual(donem.pk, self.aktif_donem.pk)

    def test_aktif_donem_yokken_none(self):
        self.aktif_donem.delete()
        donem = aktif_kayit_donemi_getir()
        self.assertIsNone(donem)

    def test_kayit_donemi_aktif_mi_true(self):
        self.assertTrue(kayit_donemi_aktif_mi())

    def test_kayit_donemi_aktif_mi_false(self):
        self.aktif_donem.delete()
        self.assertFalse(kayit_donemi_aktif_mi())

    def test_kayit_donemi_olustur(self):
        donem = kayit_donemi_olustur(
            yil=2025, donem="BAHAR",
            baslangic=timezone.now() + timedelta(days=10),
            bitis=timezone.now() + timedelta(days=20),
        )
        self.assertIsNotNone(donem.pk)

    def test_gecersiz_tarih_araliginda_hata(self):
        simdi = timezone.now()
        with self.assertRaises(ValidationError):
            kayit_donemi_olustur(
                yil=2025, donem="GUZ",
                baslangic=simdi + timedelta(days=5),
                bitis=simdi + timedelta(days=1),
            )

    def test_kayit_donemi_guncellendi(self):
        yeni_bitis = timezone.now() + timedelta(days=14)
        guncellendi = kayit_donemi_guncelle(self.aktif_donem.pk, bitis=yeni_bitis)
        self.assertEqual(guncellendi.bitis, yeni_bitis)


class DersKaydiOlusturTestleri(TemelTestKurulumu):
    def test_aktif_donemde_kayit_olustu(self):
        kayit = ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)
        self.assertIsNotNone(kayit.pk)
        self.assertFalse(kayit.onay_durumu)

    def test_kapali_donemde_hata(self):
        self.aktif_donem.delete()
        with self.assertRaises(ValidationError):
            ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_pasif_donem_dersine_kayit_hatasi(self):
        self.donem_dersi.aktiflik_durumu = False
        self.donem_dersi.save()
        with self.assertRaises(ValidationError):
            ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_sinif_seviyesi_yetersiz_hata(self):
        ust_sinif_ders = Ders.objects.create(
            ders_kodu="BM301", ad="İleri Konular", kredi=3, min_sinif=3
        )
        ust_sinif_dd = DonemDersi.objects.create(
            ders=ust_sinif_ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )
        with self.assertRaises(ValidationError):
            ders_kaydi_olustur(self.ogrenci, ust_sinif_dd.pk)

    def test_ayni_derse_tekrar_kayit_hatasi(self):
        ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)
        with self.assertRaises(ValidationError):
            ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_kontenjan_dolu_hata(self):
        self.donem_dersi.kontenjan = 1
        self.donem_dersi.save()
        ogr_user2 = User.objects.create_user(
            username="ogr2", password="x", ad="B", soyad="C", role=User.Role.OGRENCI
        )
        ogr2 = Ogrenci.objects.create(
            user=ogr_user2, ogr_no="20240002", bolum=self.bolum, sinif=1
        )
        DersKaydi.objects.create(
            ogrenci=ogr2, donem_dersi=self.donem_dersi, onay_durumu=True
        )
        with self.assertRaises(ValidationError):
            ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_ders_sayisi_limiti_asilinca_hata(self):
        from apps.enrollments.services import MAX_DERS_SAYISI
        for i in range(MAX_DERS_SAYISI):
            ders = Ders.objects.create(ders_kodu=f"BM{200+i}", ad=f"Ders{i}", kredi=1, min_sinif=1)
            dd = DonemDersi.objects.create(
                ders=ders, akademisyen=self.akademisyen,
                yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
            )
            DersKaydi.objects.create(ogrenci=self.ogrenci, donem_dersi=dd, onay_durumu=False)
        with self.assertRaises(ValidationError):
            ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_kredi_limiti_asilinca_hata(self):
        from apps.enrollments.services import MAX_KREDI
        buyuk_kredi_ders = Ders.objects.create(
            ders_kodu="BM999", ad="Ağır Ders", kredi=MAX_KREDI, min_sinif=1
        )
        buyuk_dd = DonemDersi.objects.create(
            ders=buyuk_kredi_ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )
        DersKaydi.objects.create(ogrenci=self.ogrenci, donem_dersi=buyuk_dd, onay_durumu=False)
        with self.assertRaises(ValidationError):
            ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)


class DersKaydiOnayTestleri(TemelTestKurulumu):
    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            onay_durumu=False,
        )

    def test_ders_kaydi_onayla(self):
        ders_kaydi_onayla(self.kayit.pk, self.akademisyen)
        self.kayit.refresh_from_db()
        self.assertTrue(self.kayit.onay_durumu)

    def test_yetkisiz_akademisyen_onayla_hata(self):
        with self.assertRaises(PermissionDenied):
            ders_kaydi_onayla(self.kayit.pk, self.akademisyen2)

    def test_ders_kaydi_reddet_siler(self):
        kayit_id = self.kayit.pk
        ders_kaydi_reddet(kayit_id, self.akademisyen)
        self.assertFalse(DersKaydi.objects.filter(pk=kayit_id).exists())

    def test_yetkisiz_akademisyen_reddet_hata(self):
        with self.assertRaises(PermissionDenied):
            ders_kaydi_reddet(self.kayit.pk, self.akademisyen2)

    def test_bekleyen_kayitlar_listelendi(self):
        bekleyenler = bekleyen_kayitlari_listele(self.akademisyen)
        self.assertEqual(bekleyenler.count(), 1)

    def test_onaylanan_kayit_bekleyenlerde_gorunmez(self):
        self.kayit.onay_durumu = True
        self.kayit.save()
        bekleyenler = bekleyen_kayitlari_listele(self.akademisyen)
        self.assertEqual(bekleyenler.count(), 0)

    def test_baska_akademisyenin_bekleyenleri_gorunmez(self):
        bekleyenler = bekleyen_kayitlari_listele(self.akademisyen2)
        self.assertEqual(bekleyenler.count(), 0)


class NotGirmeTestleri(TemelTestKurulumu):
    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            onay_durumu=True,
        )

    def test_not_girildi(self):
        guncellendi = not_gir_guncelle(self.kayit.pk, 70, 80, self.akademisyen)
        self.assertEqual(guncellendi.vize_notu, 70)
        self.assertEqual(guncellendi.final_notu, 80)

    def test_ortalama_otomatik_hesaplandi(self):
        guncellendi = not_gir_guncelle(self.kayit.pk, 70, 80, self.akademisyen)
        beklenen = round(70 * Decimal("0.4") + 80 * Decimal("0.6"), 2)
        self.assertEqual(guncellendi.ortalama, beklenen)

    def test_harf_notu_otomatik_atandi(self):
        guncellendi = not_gir_guncelle(self.kayit.pk, 80, 90, self.akademisyen)
        self.assertIsNotNone(guncellendi.harf_notu)

    def test_onaysiz_kayida_not_girme_hatasi(self):
        onaysiz = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=DonemDersi.objects.create(
                ders=Ders.objects.create(ders_kodu="BM200", ad="Test", kredi=2, min_sinif=1),
                akademisyen=self.akademisyen,
                yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
            ),
            onay_durumu=False,
        )
        with self.assertRaises(ValidationError):
            not_gir_guncelle(onaysiz.pk, 70, 80, self.akademisyen)

    def test_yetkisiz_akademisyen_not_girme_hatasi(self):
        with self.assertRaises(PermissionDenied):
            not_gir_guncelle(self.kayit.pk, 70, 80, self.akademisyen2)

    def test_not_sonrasi_gpa_guncellendi(self):
        not_gir_guncelle(self.kayit.pk, 90, 95, self.akademisyen)
        self.ogrenci.refresh_from_db()
        self.assertGreater(self.ogrenci.gpa, Decimal("0.00"))


class TranskriptTestleri(TemelTestKurulumu):
    def setUp(self):
        super().setUp()
        self.onaylı_kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=90,
            onay_durumu=True,
        )
        ders2 = Ders.objects.create(ders_kodu="BM102", ad="Veri Yapıları", kredi=4, min_sinif=1)
        dd2 = DonemDersi.objects.create(
            ders=ders2, akademisyen=self.akademisyen,
            yil=2024, donem="BAHAR", kontenjan=30, aktiflik_durumu=True,
        )
        self.onaysiz_kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=dd2,
            vize_notu=70, final_notu=75,
            onay_durumu=False,
        )

    def test_transkript_sadece_onaylilari_doner(self):
        kayitlar = transkript_getir(self.ogrenci)
        self.assertEqual(kayitlar.count(), 1)
        self.assertEqual(kayitlar.first().pk, self.onaylı_kayit.pk)

    def test_transkript_onaysiz_gorunmez(self):
        kayitlar = transkript_getir(self.ogrenci)
        pk_listesi = list(kayitlar.values_list("pk", flat=True))
        self.assertNotIn(self.onaysiz_kayit.pk, pk_listesi)

    def test_ogrenci_dersleri_listelendi(self):
        kayitlar = ogrenci_derslerini_listele(self.ogrenci)
        self.assertEqual(kayitlar.count(), 2)

    def test_ogrenci_dersleri_yil_filtresi(self):
        kayitlar = ogrenci_derslerini_listele(self.ogrenci, yil=2024, donem="GUZ")
        self.assertEqual(kayitlar.count(), 1)

    def test_donem_dersi_ogrenci_listesi(self):
        liste = donem_dersi_ogrenci_listesi(self.donem_dersi.pk, self.akademisyen)
        self.assertEqual(liste.count(), 1)

    def test_yetkisiz_akademisyen_ogrenci_listesi_bos(self):
        from django.http import Http404
        with self.assertRaises(Http404):
            donem_dersi_ogrenci_listesi(self.donem_dersi.pk, self.akademisyen2)