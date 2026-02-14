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
- Node.js ve npm
- Git


### Başlangıç

1.Projeyi klonlayın:
```bash
git clone https://github.com/Esat-cpu/proje-obs.git
cd proje-obs
```

2.Çevre Değişkenleri:
Proje dizininde bulunan `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değişkenleri düzenleyin.

### Backend

1.Python bağımlılıklarını kurun:

```bash
pip install -r src/backend/requirements.txt
```

2.Çalıştırmak için:
```bash
python src/backend/manage.py migrate
python src/backend/manage.py runserver
```
### Frontend

1.Paketleri Kurun:
```bash
cd src/frontend
npm install
```

2.Çalıştırmak için:
```bash
npm run dev
```
Uygulama varsayılan olarak http://localhost:5173 adresinde çalışacaktır.