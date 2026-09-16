# Hikâye Atölyesi

Statik arayüzü küçük bir API sunucusuyla çalıştıran ilk uygulama iskeleti.

## Çalıştırma

PowerShell ile `outputs` klasöründe:

```powershell
$env:OWNER_ACCESS_CODE = "kisisel-kodunuz"
node server.js
```

Sonra `http://localhost:8787` adresini açın.

## Hazır API uçları

- `GET /api/health` — sunucu durumu
- `GET /api/projects` — projeleri listeler
- `POST /api/projects` — proje oluşturur
- `POST /api/jobs` — demo üretim görevi başlatır
- `GET /api/jobs/:id` — görev durumunu verir
- `POST /api/owner/verify` — özel erişim kodunu sunucu tarafında doğrular

Gerçek AI servisleri eklenmeden önce API anahtarları ortam değişkenlerine alınmalıdır; tarayıcı koduna yazılmamalıdır.
