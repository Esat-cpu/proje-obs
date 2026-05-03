import datetime
from decimal import Decimal

from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404

from apps.departments.models import Bolum
from apps.users.models import Akademisyen, Ogrenci, User, Yonetici

HARF_NOTU_KATSAYI = {
    "AA": Decimal("4.0"),
    "BA": Decimal("3.5"),
    "BB": Decimal("3.0"),
    "CB": Decimal("2.5"),
    "CC": Decimal("2.0"),
    "DC": Decimal("1.5"),
    "DD": Decimal("1.0"),
    "FF": Decimal("0.0"),
}


def ogr_no_uret():
    yil = datetime.datetime.now().year
    son_ogrenci = (
        Ogrenci.objects.filter(ogr_no__startswith=str(yil))
        .order_by("-ogr_no")
        .first()
    )
    if son_ogrenci:
        son_sira = int(son_ogrenci.ogr_no[4:]) + 1
    else:
        son_sira = 1
    return f"{yil}{son_sira:04d}"


def kullanici_adi_uret(ad, soyad, rol_prefix=""):
    temel = f"{rol_prefix}{ad.lower()}.{soyad.lower()}".replace(" ", "")
    if not User.objects.filter(username=temel).exists():
        return temel
    sayac = 1
    while User.objects.filter(username=f"{temel}{sayac}").exists():
        sayac += 1
    return f"{temel}{sayac}"


@transaction.atomic
def ogrenci_olustur(ad, soyad, bolum_kodu, sinif=1, sifre=None):
    bolum = get_object_or_404(Bolum, bolum_kodu=bolum_kodu)
    ogr_no = ogr_no_uret()
    kullanici_adi = kullanici_adi_uret(ad, soyad)
    sifre = sifre or ogr_no

    user = User(
        username=kullanici_adi,
        ad=ad,
        soyad=soyad,
        role=User.Role.OGRENCI,
        password=make_password(sifre),
    )
    user.full_clean()
    user.save()

    ogrenci = Ogrenci(
        user=user,
        ogr_no=ogr_no,
        bolum=bolum,
        sinif=sinif,
    )
    ogrenci.full_clean()
    ogrenci.save()
    return ogrenci


@transaction.atomic
def akademisyen_olustur(ad, soyad, bolum_kodu, unvan, sifre=None):
    bolum = get_object_or_404(Bolum, bolum_kodu=bolum_kodu)
    kullanici_adi = kullanici_adi_uret(ad, soyad, rol_prefix="akd.")

    user = User(
        username=kullanici_adi,
        ad=ad,
        soyad=soyad,
        role=User.Role.AKADEMISYEN,
        password=make_password(sifre or kullanici_adi),
    )
    user.full_clean()
    user.save()

    akademisyen = Akademisyen(
        user=user,
        bolum=bolum,
        unvan=unvan,
    )
    akademisyen.full_clean()
    akademisyen.save()
    return akademisyen


@transaction.atomic
def yonetici_olustur(ad, soyad, kullanici_adi, sifre):
    user = User(
        username=kullanici_adi,
        ad=ad,
        soyad=soyad,
        role=User.Role.YONETICI,
        password=make_password(sifre),
    )
    user.full_clean()
    user.save()

    yonetici = Yonetici(user=user)
    yonetici.save()
    return yonetici


def ogrenci_listesi_getir(bolum_kodu=None, sinif=None):
    qs = Ogrenci.objects.select_related("user", "bolum")
    if bolum_kodu:
        qs = qs.filter(bolum__bolum_kodu=bolum_kodu)
    if sinif:
        qs = qs.filter(sinif=sinif)
    return qs


def ogrenci_getir(ogrenci_id):
    return get_object_or_404(Ogrenci, pk=ogrenci_id)


def akademisyen_getir(akademisyen_id):
    return get_object_or_404(Akademisyen, pk=akademisyen_id)


def gpa_guncelle(ogrenci):
    from apps.enrollments.models import DersKaydi

    kayitlar = DersKaydi.objects.filter(
        ogrenci=ogrenci,
        onay_durumu=True,
        harf_notu__isnull=False,
    ).select_related("donem_dersi__ders")

    toplam_kredi = Decimal("0")
    agirlikli_toplam = Decimal("0")

    for kayit in kayitlar:
        kredi = Decimal(kayit.donem_dersi.ders.kredi)
        katsayi = HARF_NOTU_KATSAYI.get(kayit.harf_notu, Decimal("0"))
        agirlikli_toplam += kredi * katsayi
        toplam_kredi += kredi

    yeni_gpa = (agirlikli_toplam / toplam_kredi).quantize(Decimal("0.01")) if toplam_kredi > 0 else Decimal("0.00")
    ogrenci.gpa = yeni_gpa
    ogrenci.save(update_fields=["gpa"])
    return ogrenci.gpa


def ogrenci_kaydi_excel(dosya):
    try:
        import openpyxl
    except ImportError:
        raise ValidationError("openpyxl kurulu değil.")

    try:
        calisma_kitabi = openpyxl.load_workbook(dosya)
    except Exception:
        raise ValidationError("Excel dosyası okunamadı.")

    sayfa = calisma_kitabi.active
    basarili = 0
    hatali = 0
    hatalar = []

    for satir_no, satir in enumerate(sayfa.iter_rows(min_row=2, values_only=True), start=2):
        if not any(satir):
            continue
        try:
            ad, soyad, bolum_kodu = satir[0], satir[1], satir[2]
            if not all([ad, soyad, bolum_kodu]):
                raise ValueError("Eksik alan")
            ogrenci_olustur(
                ad=str(ad).strip(),
                soyad=str(soyad).strip(),
                bolum_kodu=str(bolum_kodu).strip(),
            )
            basarili += 1
        except Exception as hata:
            hatali += 1
            hatalar.append({"satir": satir_no, "hata": str(hata)})

    return {"basarili": basarili, "hatali": hatali, "hatalar": hatalar}