# Proje OBS

Bu proje, üniversitelerde akademik süreçlerin yönetilmesini kolaylaştırmak amacıyla
geliştirilen web tabanlı bir Öğrenci Bilgi Sistemi (OBS) prototipidir.

---


## Dokümantasyon

- [Proje Özeti](docs/proje-ozeti.pdf)


## Kurulum

### Gereksinimler
- Python 3.11+
- pip
- Git

---

Projeyi klonlayın:

```bash
git clone https://github.com/Esat-cpu/proje-obs.git
cd proje-obs
```

Proje dizininde bulunan `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri düzenleyin.

### Backend

Python bağımlılıklarını kurun:

```bash
pip install -r src/backend/requirements.txt
```

Çalıştırmak için:
```bash
python src/backend/manage.py migrate
python src/backend/manage.py runserver
```
