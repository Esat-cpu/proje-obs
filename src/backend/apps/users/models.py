from decimal import Decimal

from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from apps.departments.models import Bolum


class User(AbstractUser):
    ad = models.CharField(max_length=100)
    soyad = models.CharField(max_length=100)

    class Role(models.TextChoices):
        OGRENCI = "OGRENCI", "Öğrenci"
        AKADEMISYEN = "AKADEMISYEN", "Akademisyen"
        YONETICI = "YONETICI", "Yönetici"

    role = models.CharField(
        max_length=15,
        choices=Role.choices,
        blank=False
    )

    def __str__(self):
        return f"{self.username} ({self.ad} {self.soyad}) - {self.role}"
    
    def tam_ad(self):
        return f"{self.ad} {self.soyad}"
    
    def is_ogrenci(self):
        return self.role == self.Role.OGRENCI if self.role else False

    def is_akademisyen(self):
        return self.role == self.Role.AKADEMISYEN if self.role else False

    def is_yonetici(self):
        return self.role == self.Role.YONETICI if self.role else False


class Ogrenci(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ogr_no = models.CharField(max_length=20, unique=True)
    bolum = models.ForeignKey(Bolum, on_delete=models.PROTECT)
    sinif = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(8)]
    )
    gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("4.00"))
        ]
    )

    class Meta:
        verbose_name = "Öğrenci"
        verbose_name_plural = "Öğrenciler"

    def __str__(self):
        return f"{self.ogr_no} - {self.user.ad} {self.user.soyad}"


class Akademisyen(models.Model):
    class Unvan(models.TextChoices):
        PROF_DR = "PROF_DR", "Prof. Dr."
        DOC_DR = "DOC_DR", "Doç. Dr."
        DR_OGRETIM_UYESI = "DR_OGRETIM_UYESI", "Dr. Öğr. Üyesi"
        OGRETIM_GOREVLISI = "OGRETIM_GOREVLISI", "Öğr. Gör."

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bolum = models.ForeignKey(Bolum, on_delete=models.PROTECT)
    unvan = models.CharField(max_length=30, choices=Unvan.choices)

    class Meta:
        verbose_name = "Akademisyen"
        verbose_name_plural = "Akademisyenler"

    def __str__(self):
        return f"{self.get_unvan_display()} {self.user.ad} {self.user.soyad}"


class Yonetici(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Yönetici"
        verbose_name_plural = "Yöneticiler"

    def __str__(self):
        return f"Yönetici: {self.user.ad} {self.user.soyad}"
