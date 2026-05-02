from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from apps.choices import Donem
from apps.users.models import Akademisyen


class Ders(models.Model):
    ders_kodu = models.CharField(max_length=20, unique=True)
    ad = models.CharField(max_length=100)
    kredi = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    min_sinif = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)]
    )

    class Meta:
        verbose_name = "Ders"
        verbose_name_plural = "Dersler"

    def __str__(self):
        return f"{self.ad} ({self.ders_kodu})"


class DonemDersi(models.Model):
    ders = models.ForeignKey(Ders, on_delete=models.PROTECT)
    akademisyen = models.ForeignKey(Akademisyen, on_delete=models.PROTECT)

    yil = models.IntegerField(validators=[MinValueValidator(2000), MaxValueValidator(2100)])
    donem = models.CharField(max_length=10, choices=Donem.choices)

    kontenjan = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(999)])
    aktiflik_durumu = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Dönem Dersi"
        verbose_name_plural = "Dönem Dersleri"
        constraints = [
            models.UniqueConstraint(
                fields=["ders", "akademisyen", "yil", "donem"],
                name="unique_donem_dersi"
            )
        ]

    def __str__(self):
        return f"{self.ders.ad} - {self.donem} {self.yil}"

    def is_active(self):
        return self.aktiflik_durumu

    def onaylanan_sayisi(self):
        from apps.enrollments.models import DersKaydi

        return DersKaydi.objects.filter(
            donem_dersi=self,
            onay_durumu=True
        ).count()

    def is_full(self):
        if self.kontenjan == 0:
            return False
        return self.onaylanan_sayisi() >= self.kontenjan

    def kalan_kontenjan(self):
        kalan = self.kontenjan - self.onaylanan_sayisi()
        return max(kalan, 0)

    def kontenjan_doluluk_orani(self):
        if self.kontenjan <= 0:
            return 0
        return self.onaylanan_sayisi() / self.kontenjan