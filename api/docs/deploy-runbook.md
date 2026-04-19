# Deploy Runbook

Dokumen ini untuk deployment backend `silakap-api` ke environment production.

## 1. Persiapan Server

Minimum:

- Node.js 18.18+
- MySQL
- Redis
- MinIO atau object storage yang kompatibel
- reverse proxy HTTPS

Direktori contoh:

```text
/var/www/silakap-api
```

## 2. File Environment

Salin `.env.production` lalu isi semua nilai production yang benar.

Nilai penting:

- `APP_ENV=production`
- `FORCE_HTTPS=true`
- `REDIS_ENABLED=true`
- `COOKIE_SECURE=true`
- `CORS_ORIGIN=https://frontend-anda`
- `JWT_SECRET` harus random dan panjang

## 3. Install dan Build

```bash
npm ci
npm run prisma:validate
npm run prisma:generate
npm run build
```

## 4. Database Migration

Jalankan ke database production:

```bash
npm run prisma:migrate
```

Jika environment baru dan butuh baseline workflow:

- jalankan seed internal sesuai prosedur tim
- pastikan tabel `silakap_workflow_transition` dan `silakap_workflow_sla` terisi

## 5. Start Application

Minimal:

```bash
npm run start:prod
```

Disarankan memakai process manager seperti `pm2` atau `systemd`.

Contoh `systemd`:

```ini
[Unit]
Description=SILAKAP API
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/silakap-api
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=5
Environment=APP_ENV=production

[Install]
WantedBy=multi-user.target
```

## 6. Reverse Proxy

Wajib:

- HTTPS aktif
- proxy meneruskan `X-Forwarded-Proto=https`
- request diarahkan ke port app, misalnya `3000`

Contoh header penting:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto https;
```

## 7. Smoke Test Setelah Deploy

Urutan cek:

1. `GET /api/health`
2. login
3. refresh token
4. akses endpoint protected
5. satu alur workflow utama
6. upload dokumen
7. statistik/dashboard

Respons health minimal harus menunjukkan:

- `database: ok`
- `redis: ok`

## 8. Rollback Dasar

Jika deploy gagal:

1. stop service baru
2. kembalikan build/artifact versi sebelumnya
3. start ulang service versi sebelumnya
4. cek `/api/health`
5. evaluasi migration yang sudah terlanjur jalan sebelum rollback database

## 9. Monitoring Minimum

Pantau:

- process uptime
- log aplikasi
- error rate auth
- koneksi Redis
- koneksi database
- endpoint `/api/health`

## 10. Checklist Final

- env production valid
- migration sukses
- Prisma client tergenerate
- build sukses
- HTTPS aktif
- health endpoint sehat
- login dan workflow sukses
- service auto-restart aktif
