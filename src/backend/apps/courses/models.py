from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from apps.departments.models import Bolum
from apps.choices import Donem
from apps.users.models import Akademisyen


class Ders(models.Model):
    ders_kodu = models.CharField(max_length=20, unique=True)
    ad = models.CharField(max_length=100)
    kredi = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    min_sinif = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)]
    )
    bolum = models.ForeignKey(Bolum, on_delete=models.PROTECT, related_name="dersler")

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
    aktiflik_durumu = models.BooleanField(default=False)

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

    def aktif_mi(self):
        return self.aktiflik_durumu