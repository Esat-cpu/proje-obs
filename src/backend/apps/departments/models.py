from django.db import models


class Bolum(models.Model):
    ad = models.CharField(max_length=100)
    bolum_kodu = models.CharField(max_length=20, unique=True)

    class Meta:
        verbose_name = "Bölüm"
        verbose_name_plural = "Bölümler"

    def __str__(self):
        return self.ad