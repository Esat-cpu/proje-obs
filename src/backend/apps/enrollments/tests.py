from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase
from django.utils import timezone

from apps.courses.models import Ders, DonemDersi
from apps.departments.models import Bolum
from apps.enrollments.models import DersKaydi, DersKayitDonemi
from apps.enrollments.serializers import (
    DersKaydiOkuSerializer,
    DersKaydiOlusturSerializer,
    NotGuncellemeSerializer,
    TranskriptKaydiSerializer,
)
from apps.enrollments.services import EnrollmentService, GradeService
from apps.users.models import Akademisyen, Ogrenci, User


class TemelKurulum(TestCase):
    def setUp(self):
        self.bolum = Bolum.objects.create(ad="Bilgisayar Mühendisliği", bolum_kodu="BM")

        akd_user = User.objects.create_user(
            username="hoca1", password="x",
            ad="Ahmet", soyad="Yılmaz", role=User.Role.AKADEMISYEN,
        )
        self.akademisyen = Akademisyen.objects.create(
            user=akd_user, bolum=self.bolum, unvan=Akademisyen.Unvan.DR_OGRETIM_UYESI,
        )

        akd_user2 = User.objects.create_user(
            username="hoca2", password="x",
            ad="Mehmet", soyad="Demir", role=User.Role.AKADEMISYEN,
        )
        self.akademisyen2 = Akademisyen.objects.create(
            user=akd_user2, bolum=self.bolum, unvan=Akademisyen.Unvan.PROF_DR,
        )

        ogr_user = User.objects.create_user(
            username="ogr1", password="x",
            ad="Ali", soyad="Veli", role=User.Role.OGRENCI,
        )
        self.ogrenci = Ogrenci.objects.create(
            user=ogr_user, ogr_no="20240001", bolum=self.bolum, sinif=1,
        )

        self.ders = Ders.objects.create(
            ders_kodu="BM101", ad="Algoritma", kredi=3, min_sinif=1, bolum=self.bolum,
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


# -----------------------------------------------------------------------
# MODEL TESTLERİ
# -----------------------------------------------------------------------

class DersKayitDonemiModelTestleri(TemelKurulum):
    def test_aktif_mi_aktif_donem(self):
        self.assertTrue(self.aktif_donem.aktif_mi())

    def test_aktif_mi_suresi_dolmus(self):
        gecmis = DersKayitDonemi.objects.create(
            yil=2023, donem="GUZ",
            baslangic=timezone.now() - timedelta(days=10),
            bitis=timezone.now() - timedelta(days=3),
        )
        self.assertFalse(gecmis.aktif_mi())

    def test_aktif_mi_henuz_baslamadi(self):
        gelecek = DersKayitDonemi.objects.create(
            yil=2025, donem="BAHAR",
            baslangic=timezone.now() + timedelta(days=3),
            bitis=timezone.now() + timedelta(days=10),
        )
        self.assertFalse(gelecek.aktif_mi())

    def test_str_donus(self):
        self.assertIn("2024", str(self.aktif_donem))


class DersKaydiModelTestleri(TemelKurulum):
    def test_ortalama_dogru_hesaplandi(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=90,
        )
        beklenen = round(80 * Decimal("0.4") + 90 * Decimal("0.6"), 2)
        self.assertEqual(kayit.ortalama, beklenen)

    def test_ortalama_vize_eksik_none(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=None, final_notu=90,
        )
        self.assertIsNone(kayit.ortalama)

    def test_ortalama_final_eksik_none(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=None,
        )
        self.assertIsNone(kayit.ortalama)

    def test_ortalama_ikisi_eksik_none(self):
        kayit = DersKaydi(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=None, final_notu=None,
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
        kayit = DersKaydi(vize_notu=20, final_notu=20, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertEqual(kayit._harf_notu_hesapla(), "FF")

    def test_harf_notu_eksik_notta_none(self):
        kayit = DersKaydi(vize_notu=None, final_notu=None, donem_dersi=self.donem_dersi, ogrenci=self.ogrenci)
        self.assertIsNone(kayit._harf_notu_hesapla())

    def test_save_harf_notu_otomatik_atandi(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=90,
        )
        self.assertIsNotNone(kayit.harf_notu)

    def test_save_notlar_eksikken_harf_notu_none(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
        )
        self.assertIsNone(kayit.harf_notu)

    def test_varsayilan_durum_beklemede(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
        )
        self.assertEqual(kayit.onay_durumu, DersKaydi.Durum.BEKLEMEDE)

    def test_aktif_property_onaylandi(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )
        self.assertTrue(kayit.aktif)

    def test_aktif_property_beklemede_false(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )
        self.assertFalse(kayit.aktif)

    def test_aktif_property_reddedildi_false(self):
        kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.REDDEDILDI,
        )
        self.assertFalse(kayit.aktif)


# -----------------------------------------------------------------------
# ENROLLMENT SERVICE TESTLERİ
# -----------------------------------------------------------------------

class EnrollmentServiceKayitTestleri(TemelKurulum):
    def test_aktif_donemde_kayit_olusur(self):
        kayit = EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)
        self.assertIsNotNone(kayit.pk)
        self.assertEqual(kayit.onay_durumu, DersKaydi.Durum.BEKLEMEDE)

    def test_kapali_donemde_hata(self):
        self.aktif_donem.delete()
        with self.assertRaises(ValidationError):
            EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_pasif_donem_dersine_kayit_hatasi(self):
        self.donem_dersi.aktiflik_durumu = False
        self.donem_dersi.save()
        with self.assertRaises(ValidationError):
            EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_sinif_seviyesi_yetersiz_hata(self):
        ust_ders = Ders.objects.create(
            ders_kodu="BM301", ad="İleri Konular", kredi=3, min_sinif=3, bolum=self.bolum,
        )
        ust_dd = DonemDersi.objects.create(
            ders=ust_ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )
        with self.assertRaises(ValidationError):
            EnrollmentService.ders_kaydi_olustur(self.ogrenci, ust_dd.pk)

    def test_ayni_derse_tekrar_kayit_hatasi(self):
        EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)
        with self.assertRaises(ValidationError):
            EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_kontenjan_dolu_hata(self):
        self.donem_dersi.kontenjan = 1
        self.donem_dersi.save()
        ogr_user2 = User.objects.create_user(
            username="ogr2", password="x", ad="B", soyad="C", role=User.Role.OGRENCI,
        )
        ogr2 = Ogrenci.objects.create(
            user=ogr_user2, ogr_no="20240002", bolum=self.bolum, sinif=1,
        )
        DersKaydi.objects.create(
            ogrenci=ogr2, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )
        with self.assertRaises(ValidationError):
            EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_ders_sayisi_limiti_asilinca_hata(self):
        from apps.enrollments.services import MAX_DERS_SAYISI
        for i in range(MAX_DERS_SAYISI):
            ders = Ders.objects.create(
                ders_kodu=f"BM{200+i}", ad=f"Ders{i}", kredi=1, min_sinif=1, bolum=self.bolum,
            )
            dd = DonemDersi.objects.create(
                ders=ders, akademisyen=self.akademisyen,
                yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
            )
            DersKaydi.objects.create(ogrenci=self.ogrenci, donem_dersi=dd)
        with self.assertRaises(ValidationError):
            EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)

    def test_kredi_limiti_asilinca_hata(self):
        from apps.enrollments.services import MAX_KREDI
        agir_ders = Ders.objects.create(
            ders_kodu="BM999", ad="Ağır Ders", kredi=MAX_KREDI, min_sinif=1, bolum=self.bolum,
        )
        agir_dd = DonemDersi.objects.create(
            ders=agir_ders, akademisyen=self.akademisyen,
            yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
        )
        DersKaydi.objects.create(ogrenci=self.ogrenci, donem_dersi=agir_dd)
        with self.assertRaises(ValidationError):
            EnrollmentService.ders_kaydi_olustur(self.ogrenci, self.donem_dersi.pk)


class EnrollmentServiceOnayTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )

    def test_ders_kaydi_onayla_onaylandi(self):
        EnrollmentService.ders_kaydi_onayla(self.kayit.pk, self.akademisyen)
        self.kayit.refresh_from_db()
        self.assertEqual(self.kayit.onay_durumu, DersKaydi.Durum.ONAYLANDI)

    def test_yetkisiz_akademisyen_onayla_hata(self):
        with self.assertRaises(PermissionDenied):
            EnrollmentService.ders_kaydi_onayla(self.kayit.pk, self.akademisyen2)

    def test_ders_kaydi_reddet_reddedildi(self):
        EnrollmentService.ders_kaydi_reddet(self.kayit.pk, self.akademisyen)
        self.kayit.refresh_from_db()
        self.assertEqual(self.kayit.onay_durumu, DersKaydi.Durum.REDDEDILDI)

    def test_yetkisiz_akademisyen_reddet_hata(self):
        with self.assertRaises(PermissionDenied):
            EnrollmentService.ders_kaydi_reddet(self.kayit.pk, self.akademisyen2)

    def test_bekleyen_kayitlar_listelendi(self):
        bekleyenler = EnrollmentService.bekleyen_kayitlari_listele(self.akademisyen)
        self.assertEqual(bekleyenler.count(), 1)

    def test_onaylanan_bekleyenlerde_gorunmez(self):
        self.kayit.onay_durumu = DersKaydi.Durum.ONAYLANDI
        self.kayit.save()
        bekleyenler = EnrollmentService.bekleyen_kayitlari_listele(self.akademisyen)
        self.assertEqual(bekleyenler.count(), 0)

    def test_baska_akademisyenin_bekleyenleri_gorunmez(self):
        bekleyenler = EnrollmentService.bekleyen_kayitlari_listele(self.akademisyen2)
        self.assertEqual(bekleyenler.count(), 0)


class EnrollmentServiceTranskriptTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        self.onaylı_kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=90,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )
        ders2 = Ders.objects.create(ders_kodu="BM102", ad="Veri Yapıları", kredi=4, min_sinif=1, bolum=self.bolum)
        dd2 = DonemDersi.objects.create(
            ders=ders2, akademisyen=self.akademisyen,
            yil=2024, donem="BAHAR", kontenjan=30, aktiflik_durumu=True,
        )
        self.beklemede_kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=dd2,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )

    def test_transkript_sadece_onaylilari_doner(self):
        kayitlar = EnrollmentService.transkript_getir(self.ogrenci)
        self.assertEqual(kayitlar.count(), 1)
        self.assertEqual(kayitlar.first().pk, self.onaylı_kayit.pk)

    def test_transkript_beklemede_gorunmez(self):
        kayitlar = EnrollmentService.transkript_getir(self.ogrenci)
        pk_listesi = list(kayitlar.values_list("pk", flat=True))
        self.assertNotIn(self.beklemede_kayit.pk, pk_listesi)

    def test_ogrenci_dersleri_listelendi(self):
        kayitlar = EnrollmentService.ogrenci_derslerini_listele(self.ogrenci)
        self.assertEqual(kayitlar.count(), 2)

    def test_ogrenci_dersleri_donem_filtresi(self):
        kayitlar = EnrollmentService.ogrenci_derslerini_listele(self.ogrenci, yil=2024, donem="GUZ")
        self.assertEqual(kayitlar.count(), 1)

    def test_donem_dersi_ogrenci_listesi(self):
        liste = EnrollmentService.donem_dersi_ogrenci_listesi(self.donem_dersi.pk, self.akademisyen)
        self.assertEqual(liste.count(), 1)

    def test_yetkisiz_akademisyen_ogrenci_listesi_hata(self):
        from django.http import Http404
        with self.assertRaises(Http404):
            EnrollmentService.donem_dersi_ogrenci_listesi(self.donem_dersi.pk, self.akademisyen2)


# -----------------------------------------------------------------------
# GRADE SERVICE TESTLERİ
# -----------------------------------------------------------------------

class GradeServiceTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_not_girildi(self):
        guncellendi = GradeService.not_gir_guncelle(self.kayit.pk, 70, 80, self.akademisyen)
        self.assertEqual(guncellendi.vize_notu, 70)
        self.assertEqual(guncellendi.final_notu, 80)

    def test_ortalama_hesaplandi(self):
        guncellendi = GradeService.not_gir_guncelle(self.kayit.pk, 70, 80, self.akademisyen)
        beklenen = round(70 * Decimal("0.4") + 80 * Decimal("0.6"), 2)
        self.assertEqual(guncellendi.ortalama, beklenen)

    def test_harf_notu_atandi(self):
        guncellendi = GradeService.not_gir_guncelle(self.kayit.pk, 80, 90, self.akademisyen)
        self.assertIsNotNone(guncellendi.harf_notu)

    def test_onaysiz_kayida_not_hatasi(self):
        onaysiz = DersKaydi.objects.create(
            ogrenci=self.ogrenci,
            donem_dersi=DonemDersi.objects.create(
                ders=Ders.objects.create(ders_kodu="BM200", ad="Test", kredi=2, min_sinif=1, bolum=self.bolum),
                akademisyen=self.akademisyen,
                yil=2024, donem="GUZ", kontenjan=30, aktiflik_durumu=True,
            ),
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )
        with self.assertRaises(ValidationError):
            GradeService.not_gir_guncelle(onaysiz.pk, 70, 80, self.akademisyen)

    def test_yetkisiz_akademisyen_not_hatasi(self):
        with self.assertRaises(PermissionDenied):
            GradeService.not_gir_guncelle(self.kayit.pk, 70, 80, self.akademisyen2)

    def test_not_sonrasi_gpa_guncellendi(self):
        GradeService.not_gir_guncelle(self.kayit.pk, 90, 95, self.akademisyen)
        self.ogrenci.refresh_from_db()
        self.assertGreater(self.ogrenci.gpa, Decimal("0.00"))


# -----------------------------------------------------------------------
# SERİALİZER TESTLERİ
# -----------------------------------------------------------------------

class DersKaydiOkuSerializerTestleri(TemelKurulum):
    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=90,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_alanlar_mevcut(self):
        serializer = DersKaydiOkuSerializer(self.kayit)
        for alan in ["ogrenci_ad", "ogrenci_no", "ders_ad", "ders_kodu", "kredi",
                     "yil", "donem", "ortalama", "harf_notu", "onay_durumu"]:
            self.assertIn(alan, serializer.data)

    def test_onay_durumu_deger(self):
        serializer = DersKaydiOkuSerializer(self.kayit)
        self.assertEqual(serializer.data["onay_durumu"], DersKaydi.Durum.ONAYLANDI)

    def test_ortalama_deger(self):
        serializer = DersKaydiOkuSerializer(self.kayit)
        beklenen = str(round(80 * Decimal("0.4") + 90 * Decimal("0.6"), 2))
        self.assertEqual(str(serializer.data["ortalama"]), beklenen)


class DersKaydiOlusturSerializerTestleri(TestCase):
    def test_gecerli_veri(self):
        serializer = DersKaydiOlusturSerializer(data={"donem_dersi_id": 1})
        self.assertTrue(serializer.is_valid())

    def test_eksik_alan_gecersiz(self):
        serializer = DersKaydiOlusturSerializer(data={})
        self.assertFalse(serializer.is_valid())


class NotGuncellemeSerializerTestleri(TestCase):
    def test_gecerli_veri(self):
        serializer = NotGuncellemeSerializer(data={"vize_notu": 70, "final_notu": 85})
        self.assertTrue(serializer.is_valid())

    def test_sinir_disi_vize_gecersiz(self):
        serializer = NotGuncellemeSerializer(data={"vize_notu": 101, "final_notu": 85})
        self.assertFalse(serializer.is_valid())

    def test_negatif_not_gecersiz(self):
        serializer = NotGuncellemeSerializer(data={"vize_notu": -1, "final_notu": 85})
        self.assertFalse(serializer.is_valid())

    def test_eksik_alan_gecersiz(self):
        serializer = NotGuncellemeSerializer(data={"vize_notu": 70})
        self.assertFalse(serializer.is_valid())


class TranskriptKaydiSerializerTestleri(TemelKurulum):

    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=75, final_notu=85,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_alanlar_mevcut(self):
        serializer = TranskriptKaydiSerializer(self.kayit)
        for alan in ["ders_ad", "ders_kodu", "kredi", "yil", "donem", "ortalama", "harf_notu"]:
            self.assertIn(alan, serializer.data)

    def test_ders_bilgileri_dogru(self):
        serializer = TranskriptKaydiSerializer(self.kayit)
        self.assertEqual(serializer.data["ders_kodu"], "BM101")
        self.assertEqual(serializer.data["kredi"], 3)


# -----------------------------------------------------------------------
# VIEW TESTLERİ
# -----------------------------------------------------------------------

class ViewTemelKurulum(TemelKurulum):
    def setUp(self):
        from rest_framework.test import APIClient
        super().setUp()
        self.client = APIClient()


class OgrenciDersListeViewTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_ogrenci_derslerini_gorebilir(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/courses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_akademisyen_erisemez(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.get("/api/student/courses/")
        self.assertEqual(response.status_code, 403)

    def test_kimlik_dogrulanmamis_erisemez(self):
        response = self.client.get("/api/student/courses/")
        self.assertEqual(response.status_code, 401)

    def test_yil_filtresi_calisir(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/courses/?yil=2024")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_yanlis_yil_filtresi_bos_doner(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/courses/?yil=1999")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class OgrenciTranskriptViewTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=90,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_ogrenci_transkriptini_gorebilir(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/transcript/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("ogrenci_no", response.data)
        self.assertIn("gpa", response.data)
        self.assertIn("kayitlar", response.data)

    def test_akademisyen_erisemez(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.get("/api/student/transcript/")
        self.assertEqual(response.status_code, 403)

    def test_kimlik_dogrulanmamis_erisemez(self):
        response = self.client.get("/api/student/transcript/")
        self.assertEqual(response.status_code, 401)

    def test_sadece_onaylananlar_transkripte_girer(self):
        ders2 = Ders.objects.create(ders_kodu="BM102", ad="Veri Yapıları", kredi=3, min_sinif=1, bolum=self.bolum)
        dd2 = DonemDersi.objects.create(
            ders=ders2, akademisyen=self.akademisyen,
            yil=2024, donem="BAHAR", kontenjan=30, aktiflik_durumu=True,
        )
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=dd2,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/transcript/")
        self.assertEqual(len(response.data["kayitlar"]), 1)


class OgrenciDersKayitViewTestleri(ViewTemelKurulum):
    def test_gecerli_kayit_olusturulur(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.post(
            "/api/student/enrollments/",
            {"donem_dersi_ids": [self.donem_dersi.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data["basarili"]), 1)

    def test_gecersiz_liste_formati_hata(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.post(
            "/api/student/enrollments/",
            {"donem_dersi_ids": "gecersiz"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_bos_liste_hata(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.post(
            "/api/student/enrollments/",
            {"donem_dersi_ids": []},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_akademisyen_erisemez(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.post(
            "/api/student/enrollments/",
            {"donem_dersi_ids": [self.donem_dersi.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_kimlik_dogrulanmamis_erisemez(self):
        response = self.client.post("/api/student/enrollments/", {}, format="json")
        self.assertEqual(response.status_code, 401)

    def test_kapali_donemde_hata_doner(self):
        self.aktif_donem.delete()
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.post(
            "/api/student/enrollments/",
            {"donem_dersi_ids": [self.donem_dersi.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, 400)


class AkademisyenKayitIstekleriViewTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )

    def test_akademisyen_bekleyenleri_gorebilir(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.get("/api/academician/enrollment-requests/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_ogrenci_erisemez(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/academician/enrollment-requests/")
        self.assertEqual(response.status_code, 403)

    def test_kimlik_dogrulanmamis_erisemez(self):
        response = self.client.get("/api/academician/enrollment-requests/")
        self.assertEqual(response.status_code, 401)

    def test_baska_akademisyenin_kayitlari_gorunmez(self):
        self.client.force_authenticate(user=self.akademisyen2.user)
        response = self.client.get("/api/academician/enrollment-requests/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)


class AkademisyenKayitIstekDetayViewTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.BEKLEMEDE,
        )

    def test_kayit_onaylanir(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.patch(
            f"/api/academician/enrollment-requests/{self.kayit.pk}/",
            {"durum": "onaylandi"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.kayit.refresh_from_db()
        self.assertEqual(self.kayit.onay_durumu, DersKaydi.Durum.ONAYLANDI)

    def test_kayit_reddedilir(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.patch(
            f"/api/academician/enrollment-requests/{self.kayit.pk}/",
            {"durum": "reddedildi"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.kayit.refresh_from_db()
        self.assertEqual(self.kayit.onay_durumu, DersKaydi.Durum.REDDEDILDI)

    def test_gecersiz_durum_hata(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.patch(
            f"/api/academician/enrollment-requests/{self.kayit.pk}/",
            {"durum": "gecersiz"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_yetkisiz_akademisyen_403(self):
        self.client.force_authenticate(user=self.akademisyen2.user)
        response = self.client.patch(
            f"/api/academician/enrollment-requests/{self.kayit.pk}/",
            {"durum": "onaylandi"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_ogrenci_erisemez(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.patch(
            f"/api/academician/enrollment-requests/{self.kayit.pk}/",
            {"durum": "onaylandi"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)


class AkademisyenDersOgrencileriViewTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_akademisyen_ogrenci_listesini_gorebilir(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.get(f"/api/academician/courses/{self.donem_dersi.pk}/students/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_baska_akademisyen_erisemez(self):
        self.client.force_authenticate(user=self.akademisyen2.user)
        response = self.client.get(f"/api/academician/courses/{self.donem_dersi.pk}/students/")
        self.assertEqual(response.status_code, 404)

    def test_ogrenci_erisemez(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get(f"/api/academician/courses/{self.donem_dersi.pk}/students/")
        self.assertEqual(response.status_code, 403)

    def test_kimlik_dogrulanmamis_erisemez(self):
        response = self.client.get(f"/api/academician/courses/{self.donem_dersi.pk}/students/")
        self.assertEqual(response.status_code, 401)


class AkademisyenNotGirViewTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        self.kayit = DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_not_girilir(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.patch(
            f"/api/academician/grades/{self.kayit.pk}/",
            {"vize_notu": 70, "final_notu": 85},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.kayit.refresh_from_db()
        self.assertEqual(self.kayit.vize_notu, 70)
        self.assertEqual(self.kayit.final_notu, 85)

    def test_gecersiz_not_araligi_hata(self):
        self.client.force_authenticate(user=self.akademisyen.user)
        response = self.client.patch(
            f"/api/academician/grades/{self.kayit.pk}/",
            {"vize_notu": 150, "final_notu": 85},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_yetkisiz_akademisyen_403(self):
        self.client.force_authenticate(user=self.akademisyen2.user)
        response = self.client.patch(
            f"/api/academician/grades/{self.kayit.pk}/",
            {"vize_notu": 70, "final_notu": 85},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_ogrenci_erisemez(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.patch(
            f"/api/academician/grades/{self.kayit.pk}/",
            {"vize_notu": 70, "final_notu": 85},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_kimlik_dogrulanmamis_erisemez(self):
        response = self.client.patch(f"/api/academician/grades/{self.kayit.pk}/", {}, format="json")
        self.assertEqual(response.status_code, 401)


class OgrenciDersListeAktifDonemTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        ders2 = Ders.objects.create(
            ders_kodu="BM102", ad="Veri Yapıları", kredi=3, min_sinif=1, bolum=self.bolum,
        )
        self.dd_bahar = DonemDersi.objects.create(
            ders=ders2, akademisyen=self.akademisyen,
            yil=2024, donem="BAHAR", kontenjan=30, aktiflik_durumu=True,
        )
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.dd_bahar,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_parametresiz_aktif_donemi_getirir(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/courses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["donem"], "GUZ")

    def test_aktif_donem_yoksa_tum_dersler_gelir(self):
        self.aktif_donem.delete()
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/courses/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_query_param_verilince_o_donem_gelir(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/courses/?donem=BAHAR")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["donem"], "BAHAR")


class OgrenciTranskriptGruplamaTestleri(ViewTemelKurulum):
    def setUp(self):
        super().setUp()
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=self.donem_dersi,
            vize_notu=80, final_notu=90,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )
        ders2 = Ders.objects.create(
            ders_kodu="BM102", ad="Veri Yapıları", kredi=4, min_sinif=1, bolum=self.bolum,
        )
        dd2 = DonemDersi.objects.create(
            ders=ders2, akademisyen=self.akademisyen,
            yil=2024, donem="BAHAR", kontenjan=30, aktiflik_durumu=True,
        )
        DersKaydi.objects.create(
            ogrenci=self.ogrenci, donem_dersi=dd2,
            vize_notu=70, final_notu=80,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        )

    def test_transkript_donem_gruplu_donuyor(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/transcript/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("kayitlar", response.data)
        self.assertEqual(len(response.data["kayitlar"]), 2)

    def test_transkript_donem_grubu_alanlari_mevcut(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/transcript/")
        ilk_donem = response.data["kayitlar"][0]
        self.assertIn("yil", ilk_donem)
        self.assertIn("donem", ilk_donem)
        self.assertIn("dersler", ilk_donem)

    def test_transkript_her_grupta_bir_ders(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/transcript/")
        for donem_grubu in response.data["kayitlar"]:
            self.assertEqual(len(donem_grubu["dersler"]), 1)

    def test_transkript_siralama_yil_donem(self):
        self.client.force_authenticate(user=self.ogrenci.user)
        response = self.client.get("/api/student/transcript/")
        donemler = [(g["yil"], g["donem"]) for g in response.data["kayitlar"]]
        self.assertEqual(donemler, sorted(donemler))
