from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from apps.choices import Donem, HarfNotu
from apps.courses.models import DonemDersi
from apps.users.models import Ogrenci


class DersKayitDonemi(models.Model):
    yil = models.IntegerField(validators=[MinValueValidator(2000), MaxValueValidator(2100)])
    donem = models.CharField(max_length=10, choices=Donem.choices)
    baslangic = models.DateTimeField()
    bitis = models.DateTimeField()

    class Meta:
        verbose_name = "Ders Kayıt Dönemi"
        verbose_name_plural = "Ders Kayıt Dönemleri"
        constraints = [
            models.UniqueConstraint(
                fields=["yil", "donem"],
                name="unique_kayit_donemi"
            )
        ]

    def __str__(self):
        return f"{self.yil} {self.donem}"
    
    def is_active(self):
        from django.utils import timezone
        now = timezone.now()
        return self.baslangic <= now <= self.bitis


class DersKaydi(models.Model):
    ogrenci = models.ForeignKey(Ogrenci, on_delete=models.PROTECT)
    donem_dersi = models.ForeignKey(DonemDersi, on_delete=models.PROTECT)
    vize_notu = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    final_notu = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    harf_notu = models.CharField(
        max_length=2, choices=HarfNotu.choices,
        null=True, blank=True
    )
    onay_durumu = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Ders Kaydı"
        verbose_name_plural = "Ders Kayıtları"
        constraints = [
            models.UniqueConstraint(
                fields=["ogrenci", "donem_dersi"],
                name="unique_ogrenci_donem_ders"
            )
        ]

    @property
    def ortalama(self):
        if self.vize_notu is None or self.final_notu is None:
            return None
        return round(self.vize_notu * Decimal("0.4") + self.final_notu * Decimal("0.6"), 2)

    def _harf_notu_hesapla(self):
        ort = self.ortalama
        if ort is None:
            return None
        if ort >= 90: return "AA"
        if ort >= 85: return "BA"
        if ort >= 80: return "BB"
        if ort >= 70: return "CB"
        if ort >= 60: return "CC"
        if ort >= 55: return "DC"
        if ort >= 50: return "DD"
        return "FF"

    def save(self, *args, **kwargs):
        self.harf_notu = self._harf_notu_hesapla()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ogrenci} - {self.donem_dersi}"
    
    
