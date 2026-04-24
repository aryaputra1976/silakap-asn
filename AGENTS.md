# AGENTS.md

## Tujuan

Dokumen ini adalah acuan kerja utama untuk pengembangan `silakap-asn`.
Fungsi dokumen ini bukan hanya sebagai pengingat teknis, tetapi sebagai:

- panduan arah pengembangan
- acuan prioritas kerja tim
- penjaga konsistensi arsitektur
- pengikat kontrak frontend dan backend
- pengingat dependency antar modul

Dokumen ini harus dipakai sebelum mengubah:

- workflow layanan
- endpoint layanan
- role dan hak akses
- struktur sidebar
- kontrak data frontend-backend
- schema layanan
- dokumen layanan
- laporan pegawai

---

## Prinsip Dasar

Prinsip utama pengembangan `silakap-asn`:

- alur bisnis lebih penting daripada kosmetik UI
- source of truth harus jelas
- satu perubahan workflow dianggap perubahan lintas layer
- sidebar user-facing tidak boleh dijadikan acuan arsitektur backend
- modul layanan harus mengikuti orkestrator baku
- build `api` dan `web` harus tetap hijau setelah perubahan signifikan

---

## Struktur Repo

- `api/` adalah backend utama berbasis NestJS
- `web/` adalah frontend utama berbasis Vite + React
- source of truth layanan aktif ada di backend:
  - `api/src/modules/services/orchestrator`
- source of truth frontend layanan aktif ada di adapter:
  - `web/src/features/services/base/api/service.api.ts`
- source of truth sidebar aplikasi ada di:
  - `web/src/app/navigation/menu.config.ts`

---

## Visi Arsitektur

Arsitektur sistem ini harus dianggap sebagai sistem layanan ASN enterprise yang terdiri dari tiga lapisan utama:

### 1. Control Plane

Lapisan pengendali sistem:

- Pengaturan Sistem
- Master Referensi
- Role
- Workflow
- Permission

Ini adalah fondasi. Tanpa lapisan ini, transaksi layanan akan liar dan tidak konsisten.

### 2. Transaction Plane

Lapisan proses bisnis utama:

- Data ASN
- Layanan ASN
- Verifikasi & Persetujuan
- Dokumen & Arsip

Ini adalah inti aplikasi yang dipakai user untuk bekerja sehari-hari.

### 3. Visibility & Governance Plane

Lapisan monitoring, audit, dan pengembangan lanjutan:

- Dashboard
- Laporan
- Keamanan & Audit
- Integrasi Eksternal
- Analitik SDM

Ini dibangun setelah proses inti stabil.

---

## Final Sidebar Yang Dianggap Benar

Sidebar production-ready yang menjadi acuan user-facing:

### 1. Dashboard

- Ringkasan Layanan
- Notifikasi
- Aktivitas Terakhir
- SLA Warning

### 2. Layanan ASN

Fokus: workspace utama user

- Pensiun
- Draft Saya
- Status Layanan
- Mutasi
- KGB
- Jabatan
- Peremajaan Data

Catatan:

- `Draft Saya` dan `Status Layanan` tetap diletakkan tinggi
- `Pensiun` adalah modul flagship dan template arsitektur untuk layanan lain

### 3. Verifikasi & Persetujuan

- Antrian Verifikasi
- Monitoring Workflow
- Disposisi

### 4. Dokumen & Arsip

- Dokumen Usulan
- Kelengkapan Dokumen
- Dokumen Pegawai
- Arsip DMS

### 5. Data ASN

- Profil Pegawai
- Daftar Pegawai
- Riwayat ASN
- Kelengkapan Data

### 6. Laporan

- Jenis Kelamin
- Pendidikan
- Golongan
- Jabatan

### 7. Pengaturan Sistem

- Workflow
- Pengguna
- Role

### 8. Master Referensi

- Referensi ASN
- Referensi Organisasi
- Referensi Dokumen

### 9. Keamanan & Audit

- Audit Log
- Aktivitas Pengguna

### 10. Integrasi Eksternal

- Sinkronisasi SIASN
- Job Sinkronisasi
- Riwayat Sinkronisasi
- Import Data

### 11. Analitik SDM

- Dashboard SDM
- Formasi & Kebutuhan
- Analisis Beban Kerja
- Talent Pool

Catatan penting:

- urutan menu ini adalah urutan pengalaman user
- urutan implementasi teknis tidak harus sama dengan urutan menu

---

## Dependency Map

Dependency map resmi sistem:

`Master Referensi`
↓
`Pengaturan Sistem`
↓
`Data ASN`
↓
`Layanan ASN`
↓
`Verifikasi & Persetujuan`
↓
`Dokumen & Arsip`
↓
`Dashboard & Laporan`
↓
`Keamanan & Audit`
↓
`Integrasi Eksternal`
↓
`Analitik SDM`

### Penjelasan Dependency

#### Master Referensi

Tanpa ini:

- dropdown tidak stabil
- mapping referensi rusak
- validasi layanan jadi inkonsisten
- laporan bisa salah klasifikasi

#### Pengaturan Sistem

Mengendalikan:

- siapa boleh melihat apa
- siapa boleh mengerjakan apa
- transisi workflow
- struktur persetujuan

#### Data ASN

Adalah single source of truth untuk:

- identitas pegawai
- unit kerja
- jabatan
- status kepegawaian
- riwayat ASN

#### Layanan ASN

Adalah transaksi utama:

- create usulan
- draft
- submit
- status layanan
- detail usulan

#### Verifikasi & Persetujuan

Menghidupkan workflow.
Tanpa ini, layanan hanya menjadi form input.

#### Dokumen & Arsip

Dokumen bukan fitur tambahan.
Dokumen adalah syarat:

- submit
- validasi
- persetujuan
- audit

#### Dashboard, Laporan, Audit, Integrasi

Modul-modul ini sebaiknya dibangun setelah transaksi utama stabil.

---

## Prioritas Kerja Utama

Prioritas pengembangan sistem ini:

### Prioritas 1

Jaga alur layanan tetap jalan end-to-end:

- create
- submit
- verify
- approve/reject
- detail
- timeline
- audit

### Prioritas 2

Jaga kontrak frontend-backend tetap sinkron:

- endpoint
- payload
- response
- status
- role

### Prioritas 3

Jaga audit trail dan timeline lengkap.

### Prioritas 4

Baru setelah itu rapikan utang teknis non-kritis seperti:

- optimasi chunk
- warning SCSS
- polishing minor UI

---

## Roadmap Implementasi

Roadmap ini adalah rencana kerja teknis yang harus menjadi acuan tim.

### PHASE 1 — FOUNDATION

#### 1. Master Referensi

Target:

- jenis layanan
- jenis dokumen
- organisasi
- jabatan
- status kepegawaian

Output:

- sistem punya referensi yang stabil

#### 2. Pengaturan Sistem

Target:

- role matrix
- workflow transition
- permission matrix

Output:

- sistem mengerti alur kerja dan otorisasi

### PHASE 2 — CORE DATA

#### 3. Data ASN

Target:

- daftar pegawai
- profil pegawai
- riwayat ASN
- kelengkapan data

Output:

- data pegawai siap dipakai oleh layanan

### PHASE 3 — CORE SERVICE

#### 4. Layanan ASN

Urutan layanan:

1. Pensiun
2. Draft Saya
3. Status Layanan
4. Mutasi
5. KGB
6. Jabatan
7. Peremajaan Data

Output:

- user sudah bisa bekerja secara nyata

### PHASE 4 — WORKFLOW ENGINE

#### 5. Verifikasi & Persetujuan

Target:

- queue verifikasi
- action workflow
- disposisi
- monitoring workflow

Output:

- layanan hidup end-to-end

### PHASE 5 — DOCUMENT SYSTEM

#### 6. Dokumen & Arsip

Target:

- upload dokumen
- validasi kelengkapan
- daftar dokumen usulan
- dokumen pegawai
- integrasi DMS

Output:

- layanan valid secara administratif

### PHASE 6 — VISIBILITY

#### 7. Dashboard

Target:

- ringkasan layanan
- notifikasi
- aktivitas terakhir
- SLA warning

#### 8. Laporan

Target:

- laporan berbasis data tabel
- filter unit organisasi
- export excel/pdf
- klasifikasi laporan yang konsisten

### PHASE 7 — GOVERNANCE

#### 9. Keamanan & Audit

Target:

- audit log
- user activity

Output:

- sistem siap diaudit

### PHASE 8 — ADVANCED

#### 10. Integrasi Eksternal

Target:

- SIASN sync
- import data
- job monitoring

#### 11. Analitik SDM

Target:

- dashboard SDM
- formasi
- ABK
- talent pool

Output:

- sistem naik level dari operasional ke strategis

---

## Aturan Implementasi Layanan

Setiap layanan ASN harus mengikuti aturan ini.

### Service Code

Kode layanan wajib konsisten:

- `pensiun`
- `mutasi`
- `kgb`
- `jabatan`
- `peremajaan`

### Endpoint Baku

Gunakan endpoint:

- `GET /api/services/:service`
- `GET /api/services/:service/:id`
- `POST /api/services/:service`
- `POST /api/services/:service/submit`
- `POST /api/services/:service/workflow`
- `GET /api/services/:service/dashboard`

Jangan menambah endpoint baru yang duplikat tanpa alasan kuat.

### Create Usulan

Urutan baku:

1. frontend kirim create
2. backend resolve `jenisLayananId`
3. backend resolve `pegawaiId`
4. backend create `silakap_usul_layanan`
5. backend create detail domain bila diperlukan

### Submit

Urutan baku:

1. frontend kirim `usulId`
2. backend ambil context usul dari DB
3. backend resolve actor dari JWT
4. backend validasi dependency dan dokumen
5. backend jalankan action `SUBMIT`

### Workflow Action

Gunakan:

- `POST /api/services/:service/workflow`

Payload minimum:

- `usulId`
- `actionCode`

### Detail

Harus diambil dari:

- `GET /api/services/:service/:id`

Detail harus cukup untuk:

- identitas ASN
- current status
- dokumen
- timeline/log

### Audit Trail

Setiap transition workflow minimal harus menulis:

- perubahan status
- layanan log
- workflow timeline
- audit log

Jika salah satu hilang, workflow belum dianggap lengkap.

---

## Aturan Implementasi Laporan

Modul laporan harus dianggap turunan dari data sumber, bukan sumber kebenaran baru.

### Aturan Dasar

- data laporan harus diambil dari tabel nyata
- jangan hardcode data dummy untuk runtime
- klasifikasi harus konsisten dengan master dan aturan bisnis
- export tidak boleh merusak alur aplikasi utama

### Aturan Rekap Pegawai

Laporan pegawai harus mengikuti pola berikut:

#### 1. Rekap Jenis Kelamin

Sumber:

- status pegawai
- jenis kelamin

#### 2. Rekap Pendidikan

Sumber:

- pendidikan pegawai
- jenis kelamin

#### 3. Kelompok Besar Pendidikan

Harus dipetakan konsisten:

- dasar & menengah
- diploma
- perguruan tinggi

#### 4. Rekap Golongan

Sumber:

- golongan pegawai aktif

#### 5. Rekap Golongan Ruang

Harus detail dan stabil.

#### 6. Rekap Jenjang Jabatan

Harus memetakan:

- struktural
- fungsional
- pelaksana
- PPPK

#### 7. Rincian Jabatan Struktural

Dasar:

- `jenis_jabatan_id = 1`
- urut berdasarkan `eselon_id`

#### 8. Rincian Jabatan Tenaga Kesehatan

Dasar:

- `jenis_jabatan_id = 2`
- nama jabatan masuk keluarga tenaga kesehatan

#### 9. Rincian Jabatan Guru

Dasar:

- `jenis_jabatan_id = 2`
- nama jabatan cocok `guru` atau `kepala sekolah`

#### 10. Rincian Jabatan Fungsional Lainnya

Dasar:

- `jenis_jabatan_id = 2`
- bukan tenaga kesehatan
- bukan guru

### Filter dan Export

Laporan harus mendukung:

- filter per `unor`
- export excel
- export pdf per modul

Catatan:

- export PDF preview browser tidak boleh menghancurkan tab utama aplikasi
- export Excel fallback harus memakai ekstensi yang sesuai format

---

## Aturan Role dan Sidebar

Sidebar adalah representasi user-facing.

### Role Dasar

- `ASN`
- `OPERATOR`
- `VERIFIKATOR`
- `PPK`
- `ADMIN_BKPSDM`
- `SUPER_ADMIN`

### Aturan Penting

- role harus dibaca dari auth aktif, bukan asumsi statis
- `SUPER_ADMIN` boleh melihat struktur menu penuh yang dikonfigurasi
- user biasa hanya melihat menu yang relevan dengan role
- sidebar tidak boleh menampilkan menu palsu yang tidak punya route aktif, kecuali memang sengaja untuk `SUPER_ADMIN`

---

## Larangan Praktis

- Jangan pakai route legacy hanya karena filenya masih ada.
- Jangan menambah endpoint baru yang duplikat terhadap `services/*`.
- Jangan mengubah shape response backend tanpa menyesuaikan type dan hook frontend.
- Jangan membuat laporan dengan data dummy untuk runtime.
- Jangan menjadikan sidebar sebagai source of truth arsitektur.
- Jangan merge perubahan workflow tanpa build `api` dan `web`.

---

## Checklist Verifikasi Minimum

Setelah perubahan layanan/workflow/laporan:

1. `cd api && npm run build`
2. `cd web && npm run build`
3. verifikasi create usulan
4. verifikasi submit usulan
5. verifikasi detail tampil
6. verifikasi action workflow utama berhasil
7. verifikasi timeline/log terisi
8. verifikasi laporan tampil
9. verifikasi export laporan tidak merusak flow halaman utama

---

## Checklist Definition of Done

Suatu pekerjaan dianggap selesai jika:

- endpoint aktif jelas
- payload dan response sinkron
- role sesuai
- UI tidak crash
- build hijau
- audit trail tidak hilang
- laporan tidak memakai dummy
- tidak ada pemakaian route legacy baru

---

## Troubleshooting Cepat

### Gejala: tombol workflow ada tapi gagal

Cek:

1. endpoint aktif benar
2. payload ada `usulId` dan `actionCode`
3. JWT valid
4. role cocok
5. status usul cocok

### Gejala: create gagal

Cek:

1. service code valid
2. `pegawaiId` atau `nip` bisa di-resolve
3. payload domain lengkap
4. referensi bisa dinormalisasi

### Gejala: timeline kosong

Cek:

1. backend kirim `layananLog`
2. workflow menulis log
3. workflow menulis timeline
4. workflow menulis audit

### Gejala: laporan kosong

Cek:

1. query tabel sumber benar
2. klasifikasi terlalu sempit atau tidak
3. filter `unor` sedang aktif
4. backend runtime sudah restart

### Gejala: export gagal

Cek:

1. endpoint export aktif
2. fallback frontend aman
3. popup browser tidak diblokir
4. format file cocok dengan ekstensi

---

## Kondisi Saat Ini Yang Harus Dianggap Benar

Kondisi terakhir yang harus dianggap valid:

- endpoint baku layanan aktif ada di backend orkestrator
- frontend layanan aktif memakai adapter generik
- `pensiun` adalah blueprint layanan paling matang
- laporan pegawai sudah berbasis data tabel, bukan dummy
- sidebar sudah mendekati final production structure
- warning SCSS bukan prioritas dibanding workflow bisnis

---

## Cara Menggunakan Dokumen Ini

Gunakan dokumen ini dalam urutan berikut:

1. baca bagian `Dependency Map`
2. cek `Prioritas Kerja Utama`
3. cek `Roadmap Implementasi`
4. cek aturan detail modul yang sedang disentuh
5. jalankan `Checklist Verifikasi Minimum`

Jangan langsung coding tanpa memastikan perubahan berada di fase dan dependency yang benar.

---

## Prioritas Tim

Urutan kerja tim yang disarankan:

1. stabilkan fondasi referensi dan workflow
2. kuatkan Data ASN
3. finalkan layanan inti
4. finalkan verifikasi dan dokumen
5. finalkan laporan
6. baru lanjut ke audit, integrasi, dan analitik

---

## Sprint Plan

Bagian ini adalah rencana kerja operasional yang bisa langsung dipakai tim dalam beberapa sprint awal.

### Sprint 1 — Stabilkan Fondasi

Target utama:

- master referensi stabil
- role dan workflow matrix jelas
- kontrak sidebar dan role sinkron

Ruang lingkup:

- audit referensi ASN, organisasi, dokumen
- rapikan role matrix
- rapikan workflow transition
- validasi permission menu dan route

Deliverable:

- referensi aktif dan konsisten
- role bisa dipetakan jelas ke menu dan action
- workflow transition baku siap dipakai modul layanan

Risiko yang harus dijaga:

- role di frontend tidak sinkron dengan backend
- workflow berubah tanpa update type/action frontend

### Sprint 2 — Stabilkan Data ASN

Target utama:

- Data ASN menjadi source of truth yang bisa dipakai seluruh layanan

Ruang lingkup:

- daftar pegawai
- profil pegawai
- riwayat ASN
- kelengkapan data
- lookup ASN untuk layanan

Deliverable:

- lookup ASN stabil
- identitas, unit, jabatan, dan status pegawai siap dipakai workflow layanan

Risiko yang harus dijaga:

- layanan menyimpan copy data ASN sendiri
- field master pegawai tidak sinkron antar modul

### Sprint 3 — Finalkan Pensiun End-to-End

Target utama:

- `pensiun` menjadi blueprint layanan yang benar

Ruang lingkup:

- create
- draft
- submit
- detail
- workflow action
- timeline
- audit
- dokumen layanan

Deliverable:

- alur `pensiun` end-to-end stabil
- frontend-backend sinkron lewat kontrak `services/*`

Risiko yang harus dijaga:

- route legacy hidup kembali
- detail tampil tetapi timeline/audit kosong

### Sprint 4 — Finalkan Verifikasi dan Dokumen

Target utama:

- layanan tidak berhenti di form input

Ruang lingkup:

- antrian verifikasi
- monitoring workflow
- disposisi
- kelengkapan dokumen
- dokumen usulan
- dokumen pegawai
- DMS monitoring

Deliverable:

- verifikasi dan persetujuan benar-benar operasional
- dokumen menjadi syarat submit dan approve

Risiko yang harus dijaga:

- queue memakai source yang belum final
- dokumen dianggap final padahal endpoint runtime belum aktif

### Sprint 5 — Ekspansi Layanan dan Laporan

Target utama:

- perluasan pola `pensiun` ke layanan lain
- laporan stabil berbasis data nyata

Ruang lingkup:

- `mutasi`
- `kgb`
- `jabatan`
- `peremajaan`
- laporan pegawai
- filter per unor
- export excel/pdf

Deliverable:

- layanan tambahan ikut pola orkestrator
- laporan tidak lagi dummy dan bisa dipakai operasional

Risiko yang harus dijaga:

- layanan baru hanya selesai di UI, belum selesai di workflow
- klasifikasi laporan tidak sesuai tabel sumber

### Sprint 6 — Governance dan Integrasi

Target utama:

- sistem siap audit dan siap berkembang

Ruang lingkup:

- audit log
- user activity
- SIASN sync
- import data
- dashboard SDM
- analitik dasar

Deliverable:

- governance kuat
- integrasi tidak merusak layanan inti

Risiko yang harus dijaga:

- integrasi dikerjakan terlalu awal
- audit trail belum matang saat modul governance dibuka

---

## Issue Breakdown Per Modul

Bagian ini adalah breakdown kerja yang bisa langsung diturunkan ke issue tracker.

### Master Referensi

Issue utama:

- finalkan referensi jenis layanan
- finalkan referensi jenis dokumen
- finalkan referensi organisasi
- finalkan referensi jabatan
- pastikan seluruh dropdown layanan memakai referensi aktif

Acceptance criteria:

- referensi bisa dipakai lintas modul
- tidak ada dropdown utama yang hardcode statis

### Pengaturan Sistem

Issue utama:

- rapikan role matrix
- rapikan permission matrix
- finalkan workflow transition
- sinkronkan menu-role-route

Acceptance criteria:

- role menentukan menu
- role menentukan action
- workflow bisa diverifikasi dari source yang jelas

### Data ASN

Issue utama:

- stabilkan daftar pegawai
- stabilkan profil pegawai
- stabilkan riwayat ASN
- sediakan lookup yang dipakai modul layanan

Acceptance criteria:

- layanan bisa resolve ASN dari data nyata
- field penting pegawai tersedia dan konsisten

### Layanan ASN

Issue utama:

- finalkan `pensiun`
- migrasikan `mutasi`
- migrasikan `kgb`
- migrasikan `jabatan`
- finalkan `draft saya`
- finalkan `status layanan`

Acceptance criteria:

- semua layanan aktif memakai endpoint `services/*`
- create, submit, detail, dan workflow action berjalan

### Verifikasi & Persetujuan

Issue utama:

- finalkan queue verifikasi
- finalkan monitoring workflow
- finalkan disposisi
- sinkronkan available actions dari backend ke frontend

Acceptance criteria:

- antrian kerja relevan dengan role
- action workflow tidak hardcoded buta

### Dokumen & Arsip

Issue utama:

- finalkan dokumen usulan
- finalkan kelengkapan dokumen
- finalkan dokumen pegawai
- finalkan hubungan dengan DMS

Acceptance criteria:

- dokumen bisa diakses dan divalidasi
- dokumen mempengaruhi submit dan approve

### Laporan

Issue utama:

- finalkan rekap pegawai
- finalkan filter unor
- finalkan export excel
- finalkan export pdf
- finalkan klasifikasi jabatan

Acceptance criteria:

- laporan diambil dari tabel nyata
- export tidak merusak flow halaman
- hasil laporan sesuai logika bisnis

### Keamanan & Audit

Issue utama:

- finalkan audit log
- finalkan aktivitas pengguna
- pastikan workflow menulis audit trail lengkap

Acceptance criteria:

- perubahan workflow bisa ditelusuri
- aktivitas user penting tercatat

### Integrasi Eksternal

Issue utama:

- finalkan sinkronisasi SIASN
- finalkan job monitoring
- finalkan riwayat sinkronisasi
- finalkan import data

Acceptance criteria:

- integrasi tidak memutus layanan inti
- error integrasi bisa dilacak

### Analitik SDM

Issue utama:

- finalkan dashboard SDM
- finalkan formasi
- finalkan ABK
- finalkan talent pool

Acceptance criteria:

- analitik memakai data yang sudah stabil
- tidak membebani workflow inti

---

## Ringkasan Eksekutif

Jika harus diringkas menjadi satu kalimat:

`silakap-asn` harus dibangun sebagai sistem layanan ASN yang workflow-driven, data-driven, dan audit-ready; bukan sekadar kumpulan menu atau form.
