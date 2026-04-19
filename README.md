# SILAKAP ASN

Repositori ini dipisah menjadi dua aplikasi utama agar lebih mudah dikembangkan dan sesuai dengan pola deploy di Hostinger:

- `api/` untuk backend Node.js / NestJS
- `web/` untuk frontend Vite + React

## Acuan Kerja

Dokumen kerja baku aplikasi ada di [AGENTS.md](./AGENTS.md).

Gunakan `AGENTS.md` sebagai acuan utama bila ingin:

- mengubah alur workflow layanan
- menambah service baru
- mengubah kontrak frontend-backend
- melakukan audit atau perbaikan alur bisnis

Ringkasnya, source of truth alur layanan aktif saat ini adalah:

- backend: `api/src/modules/services/orchestrator`
- frontend adapter: `web/src/features/services/base/api/service.api.ts`

## Struktur

```text
silakap-asn/
  api/         # source backend
  web/         # source frontend
  .gitignore
  README.md
```

Struktur ini sengaja dibuat datar di root, bukan `apps/api` dan `apps/web`, supaya lebih mudah dipetakan ke panel deploy Hostinger.

## Mapping Deploy Hostinger

Contoh mapping yang rapi:

- `api.bkpsdm-tolis.or.id` -> folder `api/`
- `silakap.bkpsdm-tolis.or.id` -> folder `web/`

Jika Hostinger melakukan install dependency dan build langsung dari Git:

- set root backend ke `api`
- set root frontend ke `web`
- jalankan build command masing-masing dari folder tersebut

## Perintah Dasar

Backend:

```bash
cd api
npm install
npm run build
npm run start:prod
```

Frontend:

```bash
cd web
npm install
npm run build
```

## Catatan Struktur

Yang dianggap source utama:

- `api/src`
- `api/prisma`
- `web/src`
- `web/public`

Yang tidak perlu dianggap source dan sebaiknya tidak ikut commit:

- `node_modules`
- `dist`
- `playwright-report`
- `test-results`
- `uploads`
- `tmp`
- `logs`
- file `.env`

## Catatan Pengembangan

Prinsip yang dipakai untuk repo ini:

- backend dan frontend dipisah tegas
- artefak build tidak bercampur dengan source
- file runtime backend seperti upload dan log tidak disimpan sebagai source
- struktur folder disesuaikan agar mudah dipahami tim dan mudah dipasang di shared hosting Hostinger
- perubahan workflow harus mengikuti acuan di `AGENTS.md`

## Catatan Tsconfig

Kondisi saat ini sudah cukup aman:

- `api/tsconfig.json` fokus untuk build output ke `dist`
- `web/tsconfig.json` fokus untuk Vite dan tidak melakukan emit
- keduanya harus tetap lolos `npm run build` setelah perubahan workflow

Belum perlu membuat struktur yang lebih kompleks selama target utama tetap deploy sederhana di Hostinger.
