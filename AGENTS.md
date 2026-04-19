# AGENTS.md

## Tujuan

Dokumen ini adalah acuan kerja baku untuk pengembangan `silakap-asn`.
Fokus utamanya:

- menjaga konsistensi alur bisnis layanan ASN
- mencegah mismatch frontend-backend
- memastikan perubahan fitur tidak memutus workflow utama

Dokumen ini harus dipakai sebelum mengubah endpoint, form layanan, status workflow, atau integrasi data layanan.

## Struktur Repo

- `api/` adalah backend utama NestJS
- `web/` adalah frontend utama Vite + React
- source of truth workflow layanan aktif ada di backend `api/src/modules/services/orchestrator`
- frontend layanan aktif harus mengikuti kontrak backend `api/src/modules/services/orchestrator/controllers/services.controller.ts`

## Prinsip Utama

- Jangan buat endpoint frontend baru yang melewati kontrak `services/*` tanpa alasan yang jelas.
- Jangan anggap file `routes/*.ts` lama berbasis Express sebagai source of truth runtime bila controller Nest aktif sudah tersedia.
- Setiap perubahan alur layanan harus dianggap perubahan lintas layer: backend, frontend, tipe data, dan verifikasi build.
- Endpoint aktif lebih penting daripada asumsi nama folder.
- Build `api` dan `web` harus tetap hijau setelah perubahan workflow.

## Alur Kerja Baku Layanan

### 1. Identitas Service

Setiap layanan harus diidentifikasi dengan `service code` yang konsisten.

Contoh:

- `pensiun`
- `mutasi`
- `kgb`
- `jabatan`

Frontend dan backend wajib memakai kode yang sama.

### 2. Endpoint Baku

Semua layanan generik wajib mengikuti endpoint berikut:

- `GET /api/services/:service`
  untuk list usulan layanan
- `GET /api/services/:service/:id`
  untuk detail usulan layanan
- `POST /api/services/:service`
  untuk create usulan layanan
- `POST /api/services/:service/submit`
  untuk submit usulan dari `DRAFT`
- `POST /api/services/:service/workflow`
  untuk action workflow lanjutan seperti `VERIFY`, `APPROVE`, `REJECT`
- `GET /api/services/:service/dashboard`
  untuk dashboard per layanan

Jangan gunakan jalur lama seperti:

- `/:service/approve`
- `/:service/reject`
- `/:service/submit`

kecuali memang sudah dipastikan route tersebut aktif dan terdaftar di runtime aplikasi.

### 3. Create Usulan

Urutan baku create:

1. Frontend mengirim request ke `POST /api/services/:service`
2. Backend resolve `jenisLayananId` dari `kode layanan`
3. Backend resolve `pegawaiId`
   prioritas:
   - dari `pegawaiId` bila ada
   - dari `nip` bila payload memakai pencarian NIP
4. Backend membuat record `silakap_usul_layanan` dengan status awal `DRAFT`
5. Backend membuat detail domain layanan melalui handler registry bila layanan punya detail

Catatan:

- Payload frontend boleh berupa `payload` terbungkus atau field mentah selama backend masih mendukung normalisasi.
- Untuk layanan domain seperti `pensiun`, field referensi seperti `jenisPensiun` harus dinormalisasi ke ID sebelum disimpan.

### 4. Submit Usulan

Urutan baku submit:

1. Frontend mengirim `POST /api/services/:service/submit`
2. Payload minimum:
   - `usulId`
3. Backend mengambil konteks usul dari database:
   - `pegawaiId`
   - `jenisLayananId`
4. Backend resolve actor dari JWT:
   - user id
   - role aktif
5. Backend jalankan engine workflow dengan action `SUBMIT`
6. Engine wajib memvalidasi:
   - usul ada
   - dependency valid
   - workflow transition valid
   - kelengkapan dokumen valid
7. Status berubah dari `DRAFT` ke status berikutnya sesuai definisi workflow

### 5. Workflow Action Lanjutan

Action lanjutan wajib memakai endpoint:

- `POST /api/services/:service/workflow`

Payload minimum:

- `usulId`
- `actionCode`

Payload tambahan seperti `pegawaiId` atau `jenisLayananId` boleh dikirim, tetapi backend harus bisa fallback dari database bila field itu tidak ada.

Contoh action:

- `VERIFY`
- `APPROVE`
- `REJECT`
- `RETURN`

### 6. Detail dan Timeline

Detail layanan wajib diambil dari:

- `GET /api/services/:service/:id`

Respons detail minimal harus bisa dipakai frontend untuk:

- menampilkan identitas ASN
- menampilkan status current
- menampilkan daftar dokumen
- menampilkan timeline/log proses

Jika backend mengembalikan `layananLog`, frontend harus memetakan data itu ke komponen timeline. Jangan mengasumsikan field `timeline` sudah selalu tersedia mentah.

### 7. Audit Trail

Setiap transition workflow wajib menghasilkan minimal:

- perubahan status usul
- entri `silakapLayananLog`
- entri timeline workflow
- entri `auditLog`

Jika salah satu dari tiga jejak ini hilang, perubahan workflow dianggap belum lengkap.

## Status Workflow Baku

Status yang sudah dikenal sistem dan harus diperlakukan hati-hati:

- `DRAFT`
- `SUBMITTED`
- `VERIFIED`
- `RETURNED`
- `APPROVED`
- `REJECTED`
- `SYNCED_SIASN`
- `FAILED_SIASN`
- `COMPLETED`

Aturan:

- menambah status baru harus dibarengi pembaruan frontend type, badge, config workflow, dan mapping label
- jangan menambah status hanya di backend atau hanya di frontend

## Kontrak Frontend Baku

Frontend layanan generik harus memakai adapter di:

- `web/src/features/services/base/api/service.api.ts`

Jangan hardcode endpoint layanan di page/component bila adapter generik sudah tersedia.

Semua page layanan harus mengikuti pola:

- page memanggil hook
- hook memanggil adapter API
- adapter mengikuti endpoint `services/*`

## Kontrak Backend Baku

Backend orkestrator layanan aktif harus mengikuti pola:

- controller menerima request
- controller resolve context yang bisa diturunkan dari DB
- engine memegang validasi workflow lintas concern
- service workflow mengubah status dan menulis audit/timeline/log
- registry service menangani aturan domain spesifik layanan

## Saat Menambah Layanan Baru

Urutan baku:

1. Tambahkan handler domain di backend registry layanan
2. Pastikan `service code` didaftarkan konsisten
3. Pastikan create detail dan submit validation domain tersedia bila dibutuhkan
4. Tambahkan konfigurasi frontend service registry
5. Buat schema/form frontend
6. Uji create, submit, detail, dan minimal satu action workflow
7. Pastikan build `api` dan `web` sukses

## Contoh Alur Baku Pensiun

Bagian ini adalah contoh konkret implementasi alur kerja yang saat ini paling relevan.

### Create Pensiun

Input minimum yang diharapkan frontend:

- `nip`
- `jenisPensiun`
- `tmtPensiun`

Perilaku baku backend:

1. resolve `pegawaiId` dari `nip` bila `pegawaiId` tidak dikirim
2. resolve `jenisPensiunId` dari kode `jenisPensiun`
3. create `silakap_usul_layanan` dengan status `DRAFT`
4. create detail pensiun melalui handler domain

### Submit Pensiun

Input minimum frontend:

- `usulId`

Perilaku baku backend:

1. ambil context usul dari database
2. ambil actor dari JWT
3. validasi kelengkapan
4. jalankan action `SUBMIT`

### Verify dan Approve Pensiun

Frontend wajib memakai:

- `POST /api/services/pensiun/workflow`

Payload minimum:

- `usulId`
- `actionCode`

Contoh:

- `VERIFY`
- `APPROVE`
- `REJECT`

### Hal yang Tidak Boleh Dilakukan pada Pensiun

- jangan kirim ke endpoint legacy seperti `/pensiun/approve`
- jangan hardcode `jenisPensiunId` di frontend
- jangan asumsikan frontend sudah punya `pegawaiId` tanpa lookup atau normalisasi backend
- jangan ubah shape form tanpa cek normalisasi backend

## Saat Mengubah Workflow

Wajib cek seluruh titik berikut:

- transition di database / source workflow
- controller backend
- engine workflow
- audit log
- timeline
- badge status frontend
- config action frontend
- page detail/verifikasi
- test atau verifikasi manual

Jangan anggap perubahan workflow selesai bila hanya status di database yang berubah.

## Larangan Praktis

- Jangan membuat endpoint baru yang duplikat makna endpoint `services/*` tanpa migrasi jelas.
- Jangan membaca `req.user.roleId` kecuali JWT strategy memang mengisi field itu.
- Jangan mengubah shape respons backend tanpa menyesuaikan hook dan type frontend.
- Jangan memakai route legacy hanya karena file-nya masih ada di repo.
- Jangan merge perubahan workflow tanpa build `api` dan `web`.

## Checklist Verifikasi Minimum

Setelah mengubah workflow layanan, jalankan minimal:

1. `cd api && npm run build`
2. `cd web && npm run build`
3. Verifikasi create usulan
4. Verifikasi submit usulan
5. Verifikasi detail layanan tampil
6. Verifikasi action workflow utama berhasil
7. Verifikasi timeline/log terisi

## Checklist Audit Cepat

Saat menemukan bug alur kerja, cek berurutan:

1. Apakah frontend menembak endpoint aktif yang benar
2. Apakah payload frontend sesuai kontrak backend
3. Apakah backend masih mengandalkan field request yang tidak ada di JWT
4. Apakah `pegawaiId` dan `jenisLayananId` bisa diturunkan dari `usulId`
5. Apakah perubahan status juga menulis log, timeline, dan audit
6. Apakah type frontend sudah sinkron dengan status backend
7. Apakah build `api` dan `web` tetap lolos

## Troubleshooting Workflow

Gunakan panduan ini saat alur layanan tampak gagal di runtime.

### Gejala: tombol aksi ada, tapi klik gagal

Cek berurutan:

1. apakah frontend mengirim ke `/api/services/:service/workflow`
2. apakah payload minimal berisi `usulId` dan `actionCode`
3. apakah JWT user masih valid
4. apakah role user cocok dengan transition workflow
5. apakah usul masih berada di status yang sesuai

### Gejala: create usulan gagal

Cek berurutan:

1. apakah `service code` valid
2. apakah `pegawaiId` ada, atau `nip` bisa di-resolve backend
3. apakah payload domain wajib sudah lengkap
4. apakah referensi master seperti `jenisPensiun` bisa dinormalisasi

### Gejala: submit gagal

Cek berurutan:

1. apakah status usul masih `DRAFT`
2. apakah dokumen wajib sudah lengkap
3. apakah dependency layanan sudah valid
4. apakah actor dari JWT berhasil di-resolve ke role internal

### Gejala: detail layanan tampil, tapi timeline kosong

Cek berurutan:

1. apakah backend mengembalikan `layananLog`
2. apakah action workflow benar-benar menulis `silakapLayananLog`
3. apakah action workflow juga menulis timeline dan audit log
4. apakah frontend memetakan `layananLog` ke komponen timeline

### Gejala: queue verifikasi tidak tampil

Anggap ini area yang perlu dicek ekstra, karena frontend queue saat ini masih memakai endpoint:

- `GET /api/workflow/queue`

Referensi frontend:

- `web/src/features/workflow/queue/api/getUniversalQueue.api.ts`

Jika endpoint backend aktif untuk queue belum tersedia, halaman queue tidak boleh dianggap source of truth operasional.

### Gejala: dokumen layanan gagal diakses

Anggap ini area yang perlu dicek ekstra, karena frontend dokumen saat ini memakai endpoint:

- `GET /api/services/:service/:id/documents`
- `POST /api/services/:service/:id/documents`

Referensi frontend:

- `web/src/features/services/base/documents/api/document.api.ts`

Jika controller dokumen belum aktif di runtime backend, fitur dokumen belum boleh dianggap final.

## Checklist Release Workflow

Gunakan checklist ini sebelum release yang menyentuh layanan atau workflow.

### Sebelum Merge

1. pastikan endpoint yang dipakai frontend masih endpoint aktif
2. pastikan tidak ada pemakaian route legacy baru
3. pastikan type status frontend sinkron dengan backend
4. pastikan build `api` sukses
5. pastikan build `web` sukses

### Sebelum Deploy

1. pastikan migration database sudah sesuai
2. pastikan data master untuk layanan terkait tersedia
3. pastikan workflow transition untuk layanan terkait tersedia
4. pastikan akun uji dengan role yang relevan tersedia
5. pastikan environment deploy mengarah ke `api` dan `web` yang benar

### Setelah Deploy

1. login berhasil
2. create usulan berhasil
3. submit usulan berhasil
4. detail layanan tampil
5. minimal satu action workflow berhasil
6. timeline dan audit log terisi
7. health check aplikasi tetap sehat

## Residual Risk Saat Ini

Bagian ini harus dibaca sebagai pengingat area yang masih perlu kehati-hatian ekstra.

- frontend queue verifikasi masih mengarah ke `/api/workflow/queue`
- frontend dokumen layanan sudah punya adapter, tetapi aktivasi runtime backend untuk jalur dokumen perlu dipastikan sebelum dianggap final
- chunk frontend masih besar; ini bukan blocker workflow, tetapi penting untuk optimasi berikutnya
- warning SCSS sudah diredam untuk build, tetapi belum dimigrasi penuh ke standar Sass baru

## Kondisi Saat Ini

Kondisi yang harus dianggap benar per audit terakhir:

- endpoint baku layanan aktif ada di `api/src/modules/services/orchestrator/controllers/services.controller.ts`
- frontend adapter layanan aktif ada di `web/src/features/services/base/api/service.api.ts`
- backend dan frontend sama-sama sudah lolos build
- warning SCSS bukan prioritas utama dibanding workflow bisnis
- `pensiun` adalah contoh layanan aktif yang sudah dinormalisasi ke kontrak `services/*`

## Prioritas Pengembangan

Prioritas kerja tim untuk aplikasi ini:

1. jaga alur layanan tetap jalan end-to-end
2. jaga kontrak frontend-backend tetap sinkron
3. jaga audit trail dan timeline tetap lengkap
4. baru setelah itu rapikan utang teknis non-kritis seperti warning SCSS atau optimasi chunk
