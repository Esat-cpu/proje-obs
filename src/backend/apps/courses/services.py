from django.shortcuts import get_object_or_404

from apps.courses.models import Ders, DonemDersi


class CoursesService:

    @staticmethod
    def dersleri_listele(sinif=None):
        qs = Ders.objects.select_related("bolum")
        if sinif is not None:
            qs = qs.filter(min_sinif__lte=sinif)
        return qs

    @staticmethod
    def ders_getir(ders_id):
        return get_object_or_404(Ders, pk=ders_id)

    @staticmethod
    def donem_derslerini_listele(akademisyen=None, yil=None, donem=None, sadece_aktif=False):
        qs = DonemDersi.objects.select_related("ders", "akademisyen__user")
        if akademisyen is not None:
            qs = qs.filter(akademisyen=akademisyen)
        if yil is not None:
            qs = qs.filter(yil=yil)
        if donem is not None:
            qs = qs.filter(donem=donem)
        if sadece_aktif:
            qs = qs.filter(aktiflik_durumu=True)
        return qs.order_by("id")

    @staticmethod
    def akademisyen_derslerini_getir(akademisyen):
        return CoursesService.donem_derslerini_listele(akademisyen=akademisyen)

    @staticmethod
    def donem_dersi_getir(donem_dersi_id):
        return get_object_or_404(DonemDersi, pk=donem_dersi_id)

    @staticmethod
    def kontenjan_dolu_mu(donem_dersi):
        from apps.enrollments.models import DersKaydi
        onaylanan_kayit_sayisi = DersKaydi.objects.filter(
            donem_dersi=donem_dersi,
            onay_durumu=DersKaydi.Durum.ONAYLANDI,
        ).count()
        return onaylanan_kayit_sayisi >= donem_dersi.kontenjan
