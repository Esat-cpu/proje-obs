from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from django.http import HttpResponse

from apps.enrollments.models import DersKaydi
from apps.enrollments.serializers import (
    DersKaydiOkuSerializer,
    DersKayitDonemiSerializer,
    NotGuncellemeSerializer,
    TranskriptSerializer,
)
from apps.enrollments.services import EnrollmentService, GradeService
from apps.users.permissions import IsAkademisyen, IsOgrenci


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — aktif kayıt dönemi bilgisi
#  GET /api/student/enrollment-period/
# ─────────────────────────────────────────────────────────────────────────────

class AktifKayitDonemiView(APIView):
    """
    GET /api/student/enrollment-period/
    Aktif ders kayıt dönemini döner. Dönem yoksa 404 döner.
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        donem = EnrollmentService.aktif_kayit_donemi_getir()
        if not donem:
            return Response(
                {"detail": "Aktif kayıt dönemi bulunmuyor."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = DersKayitDonemiSerializer(donem)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — kendi derslerini listele
#  GET /api/student/courses/
# ─────────────────────────────────────────────────────────────────────────────

class OgrenciDersListeView(APIView):
    """
    GET /api/student/courses/
    Oturum açan öğrencinin kayıtlı olduğu dersleri döner.
    Query params:
        yil   → ?yil=2024
        donem → ?donem=GUZ
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        ogrenci = request.user.ogrenci
        yil = request.query_params.get("yil")
        donem = request.query_params.get("donem")

        if not yil and not donem:
            aktif_donem = EnrollmentService.aktif_kayit_donemi_getir()
            if aktif_donem:
                yil = aktif_donem.yil
                donem = aktif_donem.donem

        kayitlar = EnrollmentService.ogrenci_derslerini_listele(
            ogrenci=ogrenci,
            yil=yil,
            donem=donem,
        )
        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — transkript
#  GET /api/student/transcript/
# ─────────────────────────────────────────────────────────────────────────────

class OgrenciTranskriptView(APIView):
    """
    GET /api/student/transcript/
    Oturum açan öğrencinin onaylı derslerinden oluşan transkriptini döner.
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        from collections import defaultdict
        ogrenci = request.user.ogrenci
        kayitlar = EnrollmentService.transkript_getir(ogrenci)

        gruplar = defaultdict(list)
        for kayit in kayitlar:
            anahtar = (kayit.donem_dersi.yil, kayit.donem_dersi.donem)
            gruplar[anahtar].append(kayit)

        donem_listesi = [
            {"yil": yil, "donem": donem, "dersler": ks}
            for (yil, donem), ks in sorted(gruplar.items())
        ]

        data = {
            "ogrenci_no": ogrenci.ogr_no,
            "ogrenci_ad": ogrenci.user.tam_ad(),
            "bolum": ogrenci.bolum.ad,
            "sinif": ogrenci.sinif,
            "gpa": ogrenci.gpa,
            "kayitlar": donem_listesi,
        }
        serializer = TranskriptSerializer(data)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — transkript pdf indir
#  GET /api/student/transcript/pdf/
# ─────────────────────────────────────────────────────────────────────────────

class OgrenciTranskriptPDFView(APIView):
    """
    GET /api/student/transcript/pdf/
    Öğrencinin transkriptini PDF olarak indirir.
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        ogrenci = request.user.ogrenci
        pdf_buffer = EnrollmentService.transkript_pdf(ogrenci)

        # Response
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="transkript_{ogrenci.ogr_no}.pdf"'
        return response


# ─────────────────────────────────────────────────────────────────────────────
#  ÖĞRENCİ — derse kayıt ol (çoklu)
#  POST /api/student/enrollments/
# ─────────────────────────────────────────────────────────────────────────────

class OgrenciDersKayitView(APIView):
    """
    POST /api/student/enrollments/
    Oturum açan öğrenciyi belirtilen dönem derslerine kaydeder.
    Body: { "donem_dersi_ids": [<int>, ...] }
    Her ders için ayrı ayrı işlem yapılır; kısmi başarı mümkündür.
    """
    permission_classes = [IsOgrenci]

    def post(self, request):
        donem_dersi_ids = request.data.get("donem_dersi_ids")

        if not isinstance(donem_dersi_ids, list) or not donem_dersi_ids:
            return Response(
                {"detail": "'donem_dersi_ids' alanı dolu bir liste olmalıdır."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not all(isinstance(id_, int) for id_ in donem_dersi_ids):
            return Response(
                {"detail": "Tüm ders ID'leri tam sayı olmalıdır."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ogrenci = request.user.ogrenci
        basarili = []
        hatalar = []

        for donem_dersi_id in donem_dersi_ids:
            try:
                kayit = EnrollmentService.ders_kaydi_olustur(
                    ogrenci=ogrenci,
                    donem_dersi_id=donem_dersi_id,
                )
                basarili.append(DersKaydiOkuSerializer(kayit).data)
            except ValidationError as e:
                hatalar.append({"donem_dersi_id": donem_dersi_id, "hata": e.message})

        if not basarili:
            return Response({"hatalar": hatalar}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"basarili": basarili, "hatalar": hatalar},
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — kayıt isteklerini listele
#  GET /api/academician/enrollment-requests/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenKayitIstekleriView(APIView):
    """
    GET /api/academician/enrollment-requests/
    Akademisyenin derslerine ait tüm kayıt isteklerini döner.
    """
    permission_classes = [IsAkademisyen]

    def get(self, request):
        akademisyen = request.user.akademisyen
        kayitlar = EnrollmentService.kayit_isteklerini_listele(akademisyen)
        
        onay_durumu = request.query_params.get("onay_durumu")
        if onay_durumu:
            kayitlar = kayitlar.filter(onay_durumu=onay_durumu)
            
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(kayitlar, request, view=self)
        if page is not None:
            serializer = DersKaydiOkuSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — kayıt isteğini onayla / reddet
#  PATCH /api/academician/enrollment-requests/{id}/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenKayitIstekDetayView(APIView):
    """
    PATCH /api/academician/enrollment-requests/{id}/
    Kayıt isteğini onaylar veya reddeder.
    Body: { "durum": "onaylandi" } veya { "durum": "reddedildi" }
    """
    permission_classes = [IsAkademisyen]

    def patch(self, request, pk):
        akademisyen = request.user.akademisyen
        durum = request.data.get("durum")

        if durum not in [DersKaydi.Durum.ONAYLANDI, DersKaydi.Durum.REDDEDILDI]:
            return Response(
                {"detail": "Geçerli durum: 'onaylandi' veya 'reddedildi'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if durum == DersKaydi.Durum.ONAYLANDI:
                kayit = EnrollmentService.ders_kaydi_onayla(pk, akademisyen)
                return Response(DersKaydiOkuSerializer(kayit).data)
            else:
                EnrollmentService.ders_kaydi_reddet(pk, akademisyen)
                return Response({"detail": "Kayıt reddedildi."})
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — dersteki öğrenci listesi
#  GET /api/academician/courses/{id}/students/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenDersOgrencileriView(APIView):
    """
    GET /api/academician/courses/{id}/students/
    Akademisyenin belirtilen dönem dersine kayıtlı öğrencileri döner.
    """
    permission_classes = [IsAkademisyen]

    def get(self, request, pk):
        akademisyen = request.user.akademisyen

        try:
            kayitlar = EnrollmentService.donem_dersi_ogrenci_listesi(pk, akademisyen)
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(kayitlar, request, view=self)
        if page is not None:
            serializer = DersKaydiOkuSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = DersKaydiOkuSerializer(kayitlar, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
#  AKADEMİSYEN — not gir / güncelle
#  PATCH /api/academician/grades/{id}/
# ─────────────────────────────────────────────────────────────────────────────

class AkademisyenNotGirView(APIView):
    """
    PATCH /api/academician/grades/{id}/
    Onaylı kayda vize ve final notu girer, harf notunu ve GPA'yı otomatik günceller.
    Body: { "vize_notu": <int>, "final_notu": <int> }
    """
    permission_classes = [IsAkademisyen]

    def patch(self, request, pk):
        serializer = NotGuncellemeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        akademisyen = request.user.akademisyen

        try:
            kayit = GradeService.not_gir_guncelle(
                kayit_id=pk,
                vize_notu=serializer.validated_data["vize_notu"],
                final_notu=serializer.validated_data["final_notu"],
                akademisyen=akademisyen,
            )
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(DersKaydiOkuSerializer(kayit).data)
