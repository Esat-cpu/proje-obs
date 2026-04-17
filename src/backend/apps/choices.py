from django.db import models


class Donem(models.TextChoices):
    GUZ = "GUZ", "Güz"
    BAHAR = "BAHAR", "Bahar"


class HarfNotu(models.TextChoices):
    AA = "AA", "AA (4.00)"
    BA = "BA", "BA (3.50)"
    BB = "BB", "BB (3.00)"
    CB = "CB", "CB (2.50)"
    CC = "CC", "CC (2.00)"
    DC = "DC", "DC (1.50)"
    DD = "DD", "DD (1.00)"
    FF = "FF", "FF (0.00)"


HARF_NOTU_KATSAYI = {
    "AA": 4.00,
    "BA": 3.50,
    "BB": 3.00,
    "CB": 2.50,
    "CC": 2.00,
    "DC": 1.50,
    "DD": 1.00,
    "FF": 0.00,
}
