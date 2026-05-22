from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from io import BytesIO
from django.template.loader import render_to_string

from apps.courses.models import DonemDersi
from apps.enrollments.models import DersKaydi, DersKayitDonemi

MAX_DERS_SAYISI = 8
MAX_KREDI = 30


class EnrollmentService:

    @staticmethod
    def aktif_kayit_donemi_getir():
        simdi = timezone.now()
        return DersKayitDonemi.objects.filter(
            baslangic__lte=simdi,
            bitis__gte=simdi,
        ).first()

    @staticmethod
    def kayit_donemi_aktif_mi():
        return EnrollmentService.aktif_kayit_donemi_getir() is not None

    @staticmethod
    @transaction.atomic
    def ders_kaydi_olustur(ogrenci, donem_dersi_id):
        if not EnrollmentService.kayit_donemi_aktif_mi():
            raise ValidationError("Ders kayıt dönemi aktif değil.")

        donem_dersi = get_object_or_404(DonemDersi, pk=donem_dersi_id)

        if not donem_dersi.aktiflik_durumu:
            raise ValidationError("Bu dönem dersi aktif değil.")

        if donem_dersi.ders.min_sinif > ogrenci.sinif:
            raise ValidationError("Bu dersi almak için sınıf seviyeniz yetersiz.")

        if DersKaydi.objects.filter(ogrenci=ogrenci, donem_dersi=donem_dersi).exists():
            raise ValidationError("Bu derse zaten kayıtlısınız.")

        from apps.courses.services import CoursesService
        if CoursesService.kontenjan_dolu_mu(donem_dersi):
            raise ValidationError("Bu dersin kontenjanı dolmuştur.")

        mevcut_kayitlar = DersKaydi.objects.filter(
            ogrenci=ogrenci,
            donem_dersi__yil=donem_dersi.yil,
            donem_dersi__donem=donem_dersi.donem,
        ).select_related("donem_dersi__ders")

        if mevcut_kayitlar.count() >= MAX_DERS_SAYISI:
            raise ValidationError(f"Bir dönemde en fazla {MAX_DERS_SAYISI} ders alabilirsiniz.")

        mevcut_kredi = sum(k.donem_dersi.ders.kredi for k in mevcut_kayitlar)
        if mevcut_kredi + donem_dersi.ders.kredi > MAX_KREDI:
            raise ValidationError(f"Kredi limitini ({MAX_KREDI}) aşıyorsunuz.")

        kayit = DersKaydi(ogrenci=ogrenci, donem_dersi=donem_dersi, onay_durumu=DersKaydi.Durum.BEKLEMEDE)
        kayit.save()
        return kayit

    @staticmethod
    def kayit_isteklerini_listele(akademisyen, onay_durumu=None):
        qs = DersKaydi.objects.filter(
            donem_dersi__akademisyen=akademisyen,
        ).select_related("ogrenci__user", "donem_dersi__ders", "donem_dersi__akademisyen__user").order_by("-id")
        if onay_durumu:
            qs = qs.filter(onay_durumu=onay_durumu)
        return qs

    @staticmethod
    def ders_kaydi_onayla(kayit_id, akademisyen):
        kayit = get_object_or_404(DersKaydi, pk=kayit_id)
        if kayit.donem_dersi.akademisyen != akademisyen:
            raise PermissionDenied("Bu kayıt size ait değil.")
        kayit.onay_durumu = DersKaydi.Durum.ONAYLANDI
        kayit.save(update_fields=["onay_durumu"])
        return kayit

    @staticmethod
    def ders_kaydi_reddet(kayit_id, akademisyen):
        kayit = get_object_or_404(DersKaydi, pk=kayit_id)
        if kayit.donem_dersi.akademisyen != akademisyen:
            raise PermissionDenied("Bu kayıt size ait değil.")
        kayit.onay_durumu = DersKaydi.Durum.REDDEDILDI
        kayit.save(update_fields=["onay_durumu"])

    @staticmethod
    def donem_dersi_ogrenci_listesi(donem_dersi_id, akademisyen):
        donem_dersi = get_object_or_404(
            DonemDersi, pk=donem_dersi_id, akademisyen=akademisyen
        )
        return DersKaydi.objects.filter(
            donem_dersi=donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        ).select_related("ogrenci__user", "donem_dersi__ders", "donem_dersi__akademisyen__user").order_by("id")

    @staticmethod
    def ogrenci_derslerini_listele(ogrenci, yil=None, donem=None):
        qs = DersKaydi.objects.filter(ogrenci=ogrenci).select_related(
            "donem_dersi__ders", "donem_dersi__akademisyen__user"
        )
        if yil:
            qs = qs.filter(donem_dersi__yil=yil)
        if donem:
            qs = qs.filter(donem_dersi__donem=donem)
        return qs

    @staticmethod
    def transkript_getir(ogrenci):
        return DersKaydi.objects.filter(
            ogrenci=ogrenci,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        ).select_related(
            "donem_dersi__ders",
            "donem_dersi__akademisyen__user",
        ).order_by("donem_dersi__yil", "donem_dersi__donem")

    @staticmethod
    def transkript_pdf(ogrenci) -> BytesIO:
        from collections import defaultdict

        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            Table,
            TableStyle
        )
        from reportlab.lib import colors
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont

        # Font
        from django.conf import settings
        import os
        
        font_path = os.path.join(settings.BASE_DIR, "fonts", "DejaVuSans.ttf")
        font_bold_path = os.path.join(settings.BASE_DIR, "fonts", "DejaVuSans-Bold.ttf")

        pdfmetrics.registerFont(
            TTFont("DejaVu", font_path)
        )
        pdfmetrics.registerFont(
            TTFont("DejaVu-Bold", font_bold_path)
        )

        base_style = ParagraphStyle(
            name="Base",
            fontName="DejaVu",
            fontSize=9,
            leading=11,
            leftIndent=0,
            spaceBefore=0,
            spaceAfter=4
        )

        title_style = ParagraphStyle(
            name="Title",
            fontName="DejaVu-Bold",
            fontSize=13,
            alignment=1,
            spaceAfter=10
        )

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            leftMargin=50,
            rightMargin=50,
            topMargin=40,
            bottomMargin=40
        )

        elements = []

        # 1. Başlık
        elements.append(Paragraph("AKADEMİK TRANSKRİPT", title_style))
        elements.append(Spacer(1, 8))

        # 2. Öğrenci Bilgileri
        info_text = f"""
        <font name="DejaVu-Bold">Öğrenci No:</font> {ogrenci.ogr_no}<br/>
        <font name="DejaVu-Bold">Ad Soyad:</font> {ogrenci.user.tam_ad()}<br/>
        <font name="DejaVu-Bold">Bölüm:</font> {ogrenci.bolum.ad}<br/>
        <font name="DejaVu-Bold">Sınıf:</font> {ogrenci.sinif}<br/>
        <font name="DejaVu-Bold">GPA:</font> {ogrenci.gpa}
        """

        elements.append(Paragraph(info_text, base_style))
        elements.append(Spacer(1, 12))

        # 3. Gruplama
        kayitlar = EnrollmentService.transkript_getir(ogrenci)

        gruplar = defaultdict(list)

        for k in kayitlar:
            key = (k.donem_dersi.yil, k.donem_dersi.donem)
            gruplar[key].append(k)

        donem_listesi = sorted(gruplar.items())

        # Dönemler ve Tablolar
        for (yil, donem), dersler in donem_listesi:

            # dönem başlığı
            donem_style = ParagraphStyle(
                name="DonemStyle",
                fontName="DejaVu-Bold",
                fontSize=10,
                leftIndent=0,
                spaceBefore=4,
                spaceAfter=6
            )
            elements.append(Paragraph(f"{yil} - {donem}", donem_style))
            elements.append(Spacer(1, 4))

            data = [[
                "Ders Kodu",
                "Ders Adı",
                "Kredi",
                "Vize",
                "Final",
                "Ortalama",
                "Harf"
            ]]

            for k in dersler:
                data.append([
                    k.donem_dersi.ders.ders_kodu,
                    k.donem_dersi.ders.ad,
                    str(k.donem_dersi.ders.kredi),
                    str(k.vize_notu or "--"),
                    str(k.final_notu or "--"),
                    str(k.ortalama or "--"),
                    str(k.harf_notu or "--")
                ])

            table = Table(
                data,
                repeatRows=1,
                colWidths=[70, 165, 45, 45, 45, 55, 45]
            )

            table.setStyle(TableStyle([
                # HEADER
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f4e79")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "DejaVu-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),

                # BODY
                ("FONTNAME", (0, 1), (-1, -1), "DejaVu"),
                ("FONTSIZE", (0, 1), (-1, -1), 7.5),

                # ALIGNMENT
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("ALIGN", (1, 1), (1, -1), "LEFT"),

                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

                # GRID
                ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),

                # PADDING (temiz görünüm)
                ("LEFTPADDING", (0, 0), (-1, -1), 3),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]))

            elements.append(table)
            elements.append(Spacer(1, 12))

        doc.build(elements)

        buffer.seek(0)
        return buffer


class GradeService:

    @staticmethod
    @transaction.atomic
    def not_gir_guncelle(kayit_id, vize_notu, final_notu, akademisyen):
        kayit = get_object_or_404(DersKaydi, pk=kayit_id)
        if kayit.donem_dersi.akademisyen != akademisyen:
            raise PermissionDenied("Bu kayıt size ait değil.")
        if not kayit.aktif:
            raise ValidationError("Onaylanmamış kayıda not girilemez.")
        kayit.vize_notu = vize_notu
        kayit.final_notu = final_notu
        kayit.save()

        from apps.users.services import UsersService
        UsersService.gpa_guncelle(kayit.ogrenci)
        return kayit
