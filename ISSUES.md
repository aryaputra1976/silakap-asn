# ISSUES.md

## Tujuan

Dokumen ini adalah daftar issue template yang siap dipakai untuk eksekusi kerja tim.
Dokumen ini menurunkan `AGENTS.md` dan `ROADMAP.md` menjadi bentuk tugas yang lebih operasional.

Setiap issue di bawah ini bisa:

- dijadikan GitHub Issue
- dijadikan task board
- dipecah lagi menjadi PR kecil

---

## Cara Pakai

Gunakan format berikut saat memindahkan ke issue tracker:

- `Title`
- `Objective`
- `Scope`
- `Acceptance Criteria`
- `Dependency`
- `Risks`

Jangan buka issue implementasi tanpa mengecek dependency-nya lebih dulu.

---

## Sprint 1 — Fondasi

### Issue 1.1 — Finalkan Referensi Jenis Layanan

**Objective**

Menjadikan referensi jenis layanan sebagai source of truth lintas modul.

**Scope**

- audit referensi jenis layanan yang aktif
- sinkronkan kode layanan dengan backend orkestrator
- pastikan frontend memakai kode layanan yang sama

**Acceptance Criteria**

- kode layanan konsisten di frontend dan backend
- tidak ada service code yang ambigu
- referensi jenis layanan bisa dipakai semua layanan aktif

**Dependency**

- tidak ada

**Risks**

- code layanan berbeda antara menu, registry, dan endpoint

### Issue 1.2 — Finalkan Referensi Dokumen

**Objective**

Menjadikan referensi dokumen sebagai fondasi validasi dokumen layanan.

**Scope**

- audit jenis dokumen aktif
- sinkronkan `docKey`, kode dokumen, dan syarat layanan
- pastikan referensi dokumen bisa dipakai modul dokumen

**Acceptance Criteria**

- syarat dokumen layanan memakai referensi aktif
- upload dokumen bisa dipetakan ke master dokumen

**Dependency**

- referensi layanan

**Risks**

- dokumen layanan tidak bisa divalidasi konsisten

### Issue 1.3 — Rapikan Role Matrix

**Objective**

Menjadikan role sebagai dasar menu, route, dan workflow action.

**Scope**

- audit role aktif
- rapikan pemetaan role ke menu
- rapikan pemetaan role ke route
- rapikan pemetaan role ke action workflow

**Acceptance Criteria**

- role bisa menentukan menu yang terlihat
- role bisa menentukan action yang valid

**Dependency**

- tidak ada

**Risks**

- role frontend dan backend berbeda arti

### Issue 1.4 — Finalkan Workflow Transition Source

**Objective**

Menjadikan workflow transition sebagai source of truth yang stabil.

**Scope**

- audit transition table
- audit action code
- audit from-state dan to-state
- sinkronkan dengan action yang dirender frontend

**Acceptance Criteria**

- workflow transition bisa diverifikasi dari source yang jelas
- frontend tidak menebak transition secara hardcoded

**Dependency**

- role matrix

**Risks**

- perubahan status tidak sinkron lintas layer

---

## Sprint 2 — Data ASN

### Issue 2.1 — Stabilkan Daftar Pegawai

**Objective**

Menjadikan daftar pegawai sebagai pintu masuk utama data ASN.

**Scope**

- audit query daftar pegawai
- audit filter daftar pegawai
- audit pagination dan pencarian

**Acceptance Criteria**

- daftar pegawai stabil
- pencarian pegawai bisa dipakai modul lain

**Dependency**

- data pegawai tersedia

**Risks**

- modul layanan tidak bisa lookup ASN dengan benar

### Issue 2.2 — Finalkan Profil Pegawai

**Objective**

Menjadikan profil pegawai sebagai tampilan tunggal identitas ASN.

**Scope**

- tampilkan identitas utama
- tampilkan data jabatan, unit, status
- sinkronkan data profil dengan sumber master

**Acceptance Criteria**

- profil ASN tampil konsisten
- field penting tersedia untuk kebutuhan layanan

**Dependency**

- daftar pegawai

**Risks**

- layanan memakai data ASN yang berbeda dari profil

### Issue 2.3 — Finalkan Lookup ASN untuk Layanan

**Objective**

Memastikan create layanan bisa resolve ASN dari sumber data yang benar.

**Scope**

- lookup berdasarkan NIP
- lookup berdasarkan `pegawaiId`
- fallback yang aman di backend

**Acceptance Criteria**

- create layanan bisa resolve pegawai tanpa asumsi frontend

**Dependency**

- daftar pegawai
- profil ASN

**Risks**

- create layanan gagal karena pegawai tidak bisa di-resolve

---

## Sprint 3 — Layanan ASN

### Issue 3.1 — Finalkan Pensiun End-to-End

**Objective**

Menjadikan `pensiun` sebagai blueprint layanan utama.

**Scope**

- create
- draft
- submit
- detail
- timeline
- audit
- workflow action

**Acceptance Criteria**

- alur `pensiun` berjalan end-to-end
- frontend memakai kontrak `services/*`
- route legacy tidak dipakai flow utama

**Dependency**

- workflow source
- lookup ASN

**Risks**

- `pensiun` tampak hidup di UI tetapi workflow/audit tidak lengkap

### Issue 3.2 — Finalkan Draft Saya

**Objective**

Memberikan workspace draft yang stabil untuk user.

**Scope**

- list draft
- filter draft
- link ke detail/edit draft

**Acceptance Criteria**

- user bisa melihat dan melanjutkan draft miliknya

**Dependency**

- create layanan

**Risks**

- draft tidak sinkron dengan status di backend

### Issue 3.3 — Finalkan Status Layanan

**Objective**

Memberikan visibilitas status usulan secara jelas.

**Scope**

- list status usulan
- badge status
- link ke detail

**Acceptance Criteria**

- status usulan tampil konsisten dengan backend

**Dependency**

- detail layanan
- status mapping

**Risks**

- status di UI tidak sama dengan state backend

---

## Sprint 4 — Verifikasi dan Dokumen

### Issue 4.1 — Finalkan Antrian Verifikasi

**Objective**

Membuat queue verifikasi benar-benar relevan dengan role.

**Scope**

- audit endpoint queue
- audit role filtering
- audit action dari queue ke detail

**Acceptance Criteria**

- role melihat item queue yang relevan
- klik item queue membuka detail yang benar

**Dependency**

- workflow source
- status layanan

**Risks**

- queue masih memakai source yang belum final

### Issue 4.2 — Finalkan Monitoring Workflow

**Objective**

Memberikan visibilitas alur layanan ke role internal.

**Scope**

- tampilkan status
- tampilkan progress
- tampilkan action history

**Acceptance Criteria**

- monitoring workflow konsisten dengan timeline backend

**Dependency**

- timeline
- layanan log

**Risks**

- monitoring berbeda dari log nyata

### Issue 4.3 — Finalkan Dokumen Usulan

**Objective**

Menjadikan dokumen usulan sebagai syarat transaksi layanan.

**Scope**

- list dokumen
- upload dokumen
- status upload
- validasi dokumen

**Acceptance Criteria**

- dokumen bisa diunggah dan dilihat
- status dokumen terbaca jelas

**Dependency**

- referensi dokumen
- syarat layanan

**Risks**

- dokumen tampak ada tetapi tidak tervalidasi

### Issue 4.4 — Finalkan Kelengkapan Dokumen

**Objective**

Menjadikan kelengkapan dokumen sebagai bagian dari validasi submit/approve.

**Scope**

- cek dokumen wajib
- tampilkan kekurangan
- integrasikan ke submit/workflow

**Acceptance Criteria**

- submit/approve mempertimbangkan kelengkapan dokumen

**Dependency**

- dokumen usulan
- workflow validation

**Risks**

- user bisa submit layanan tanpa dokumen wajib

---

## Sprint 5 — Ekspansi Layanan dan Laporan

### Issue 5.1 — Aktifkan Mutasi dengan Pola Orkestrator

**Objective**

Membawa `mutasi` ke pola layanan generik yang sama dengan `pensiun`.

**Scope**

- handler backend
- registry backend
- config frontend
- create/detail/submit/workflow

**Acceptance Criteria**

- `mutasi` hidup di jalur `services/*`

**Dependency**

- blueprint `pensiun`

**Risks**

- mutasi hanya hidup di UI tanpa aturan domain yang cukup

### Issue 5.2 — Aktifkan KGB dengan Pola Orkestrator

**Objective**

Membawa `kgb` ke pola layanan generik.

**Scope**

- handler backend
- registry backend
- config frontend
- create/detail/submit/workflow

**Acceptance Criteria**

- `kgb` hidup di jalur `services/*`

**Dependency**

- blueprint `pensiun`

**Risks**

- KGB terlihat aktif tetapi belum domain-complete

### Issue 5.3 — Aktifkan Jabatan dengan Pola Orkestrator

**Objective**

Menjadikan `jabatan` layanan aktif yang mengikuti kontrak baku.

**Scope**

- handler backend
- form frontend
- detail/workflow

**Acceptance Criteria**

- `jabatan` ikut pola layanan baku

**Dependency**

- blueprint `pensiun`

**Risks**

- frontend dan backend `jabatan` selesai parsial

### Issue 5.4 — Finalkan Rekap Laporan Pegawai

**Objective**

Membuat laporan pegawai operasional dan konsisten dengan tabel sumber.

**Scope**

- jenis kelamin
- pendidikan
- golongan
- jabatan
- filter `unor`
- export excel
- export pdf

**Acceptance Criteria**

- laporan memakai data tabel nyata
- filter `unor` bekerja
- export berjalan

**Dependency**

- data ASN stabil

**Risks**

- klasifikasi laporan tidak konsisten

---

## Sprint 6 — Governance

### Issue 6.1 — Finalkan Audit Log

**Objective**

Menjadikan audit log jejak resmi perubahan sistem.

**Scope**

- audit action layanan
- audit workflow
- audit perubahan penting

**Acceptance Criteria**

- perubahan penting bisa ditelusuri

**Dependency**

- workflow final

**Risks**

- perubahan status tidak bisa diaudit

### Issue 6.2 — Finalkan Aktivitas Pengguna

**Objective**

Mencatat aktivitas operasional utama user.

**Scope**

- login
- create
- submit
- approve/reject
- akses dokumen penting

**Acceptance Criteria**

- aktivitas penting user tercatat

**Dependency**

- audit/logging layer

**Risks**

- investigasi operasional sulit dilakukan

---

## Sprint 7 — Integrasi dan Advanced

### Issue 7.1 — Finalkan Sinkronisasi SIASN

**Objective**

Menyambungkan layanan dan data ASN ke proses sinkronisasi eksternal.

**Scope**

- job sync
- status sync
- riwayat sync

**Acceptance Criteria**

- sync bisa dipantau
- error sync bisa ditelusuri

**Dependency**

- data ASN stabil
- layanan inti stabil

**Risks**

- integrasi memutus alur utama

### Issue 7.2 — Finalkan Import Data

**Objective**

Menyediakan jalur import data yang aman dan terukur.

**Scope**

- upload file
- validasi import
- hasil import
- log import

**Acceptance Criteria**

- import data punya jejak dan hasil yang bisa diverifikasi

**Dependency**

- referensi stabil

**Risks**

- import menghasilkan data kotor

### Issue 7.3 — Finalkan Analitik SDM Dasar

**Objective**

Memberikan insight yang dibangun di atas data yang sudah stabil.

**Scope**

- dashboard SDM
- formasi
- ABK
- talent pool

**Acceptance Criteria**

- analitik memakai data yang tervalidasi

**Dependency**

- data ASN stabil
- laporan stabil

**Risks**

- analitik menampilkan insight yang salah karena source data belum matang

---

## Template PR Kecil

Gunakan template ini saat membuat PR dari issue:

### Objective

Apa tujuan perubahan ini.

### Scope

Apa saja yang disentuh:

- backend
- frontend
- schema
- route
- role
- laporan

### Validation

- `cd api && npm run build`
- `cd web && npm run build`
- langkah verifikasi manual utama

### Risks

Risiko residual yang masih ada setelah PR ini merged.
