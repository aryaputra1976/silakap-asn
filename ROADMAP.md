# ROADMAP.md

## Tujuan

Dokumen ini adalah turunan operasional dari [AGENTS.md](D:/silakap-asn/AGENTS.md).
Fungsinya:

- menerjemahkan arah besar menjadi urutan kerja nyata
- membantu tim menentukan fokus sprint
- memisahkan pekerjaan fondasi, transaksi inti, dan pengembangan lanjutan

Dokumen ini dipakai bersama `AGENTS.md`, bukan menggantikannya.

---

## Prinsip Umum

- kerjakan fondasi lebih dulu sebelum memperluas fitur
- utamakan alur end-to-end yang benar daripada banyak modul setengah jadi
- setiap sprint harus menghasilkan sesuatu yang benar-benar bisa diverifikasi
- jangan buka modul baru jika dependency dasarnya belum stabil

---

## Urutan Prioritas Besar

1. Master Referensi
2. Pengaturan Sistem
3. Data ASN
4. Layanan ASN
5. Verifikasi & Persetujuan
6. Dokumen & Arsip
7. Laporan
8. Keamanan & Audit
9. Integrasi Eksternal
10. Analitik SDM

---

## Sprint 1 — Fondasi Sistem

### Fokus

- Master Referensi
- Pengaturan Sistem
- sinkronisasi role, menu, route, permission

### Target

- referensi inti tersedia dan dipakai konsisten
- role matrix dan permission matrix jelas
- workflow transition punya source of truth yang stabil

### Scope

- referensi jenis layanan
- referensi dokumen
- referensi organisasi
- referensi jabatan
- role
- workflow
- permission
- validasi sidebar terhadap role

### Output

- sistem bisa “mengerti aturan”
- frontend dan backend berbicara dalam vocabulary yang sama

### Definition of Done

- referensi utama tidak hardcode di halaman penting
- role yang aktif sesuai dengan menu dan route
- workflow transition bisa dipetakan dengan jelas
- build `api` dan `web` hijau

---

## Sprint 2 — Data ASN Sebagai Source of Truth

### Fokus

- stabilkan modul `Data ASN`

### Target

- layanan bisa bergantung pada satu sumber data pegawai

### Scope

- daftar pegawai
- profil pegawai
- riwayat ASN
- kelengkapan data
- lookup pegawai berdasarkan NIP/ID
- validasi data dasar pegawai

### Output

- modul layanan tidak perlu membuat copy data pegawai sendiri

### Definition of Done

- lookup ASN bisa dipakai oleh create layanan
- profil ASN tampil konsisten
- data unit, jabatan, status, dan identitas utama stabil
- build `api` dan `web` hijau

---

## Sprint 3 — Layanan ASN Inti

### Fokus

- finalkan `pensiun`
- rapikan `draft saya`
- rapikan `status layanan`

### Target

- ada satu layanan yang benar-benar matang sebagai blueprint

### Scope

- create usulan
- draft
- submit
- detail layanan
- dashboard layanan
- timeline
- audit trail

### Output

- `pensiun` menjadi template resmi untuk layanan lain

### Definition of Done

- create, submit, detail, dan workflow action utama berjalan
- detail menampilkan log/timeline
- audit trail terisi
- frontend memakai adapter `services/*`
- build `api` dan `web` hijau

---

## Sprint 4 — Workflow dan Dokumen

### Fokus

- verifikasi
- persetujuan
- dokumen usulan
- kelengkapan dokumen

### Target

- layanan tidak berhenti di input, tetapi menjadi proses bisnis lengkap

### Scope

- antrian verifikasi
- monitoring workflow
- disposisi
- dokumen usulan
- dokumen pegawai
- validasi kelengkapan dokumen
- koneksi awal dengan DMS monitoring

### Output

- submit, verify, approve, return, reject benar-benar operasional

### Definition of Done

- queue relevan dengan role
- dokumen bisa diakses dan divalidasi
- submit/approve memperhitungkan kelengkapan dokumen
- build `api` dan `web` hijau

---

## Sprint 5 — Ekspansi Layanan dan Laporan

### Fokus

- perluas pola `pensiun`
- stabilkan modul laporan pegawai

### Target

- layanan lain ikut pola generik
- laporan tidak lagi dummy

### Scope

- `mutasi`
- `kgb`
- `jabatan`
- `peremajaan`
- laporan jenis kelamin
- laporan pendidikan
- laporan golongan
- laporan jabatan
- filter per unor
- export excel/pdf

### Output

- layanan tambahan bisa mengikuti orkestrator
- laporan bisa dipakai operasional

### Definition of Done

- layanan baru tidak bypass orkestrator
- laporan diambil dari tabel nyata
- export jalan tanpa memutus flow halaman
- build `api` dan `web` hijau

---

## Sprint 6 — Governance

### Fokus

- audit
- keamanan
- logging aktivitas user

### Target

- sistem siap diaudit dan lebih aman untuk operasional

### Scope

- audit log
- aktivitas pengguna
- verifikasi kelengkapan jejak workflow

### Output

- perubahan penting bisa ditelusuri

### Definition of Done

- perubahan workflow meninggalkan jejak
- aktivitas user penting tercatat
- build `api` dan `web` hijau

---

## Sprint 7 — Integrasi dan Advanced Features

### Fokus

- SIASN
- import data
- analitik SDM

### Target

- sistem naik dari operasional ke integrasi dan insight

### Scope

- sinkronisasi SIASN
- job sinkronisasi
- riwayat sinkronisasi
- import data
- dashboard SDM
- formasi
- ABK
- talent pool

### Output

- sistem siap berkembang ke skala yang lebih strategis

### Definition of Done

- integrasi tidak memutus layanan inti
- error integrasi dapat dilacak
- analitik memakai data stabil
- build `api` dan `web` hijau

---

## Backlog Modul

### Master Referensi

- finalkan semua referensi inti
- hapus hardcode dropdown penting
- pastikan referensi dipakai lintas modul

### Pengaturan Sistem

- sinkronkan role dan permission
- finalkan workflow matrix
- sinkronkan route guard dengan role map

### Data ASN

- rapikan daftar pegawai
- finalkan profil pegawai
- finalkan riwayat ASN
- pastikan lookup stabil

### Layanan ASN

- finalkan `pensiun`
- aktifkan `mutasi`
- aktifkan `kgb`
- aktifkan `jabatan`
- aktifkan `peremajaan`

### Verifikasi & Persetujuan

- finalkan queue
- finalkan monitoring workflow
- finalkan disposisi

### Dokumen & Arsip

- finalkan dokumen usulan
- finalkan kelengkapan dokumen
- finalkan dokumen pegawai
- finalkan koneksi DMS

### Laporan

- finalkan seluruh rekap pegawai
- pastikan filter `unor` konsisten
- finalkan export excel
- finalkan export pdf

### Keamanan & Audit

- finalkan audit log
- finalkan aktivitas pengguna

### Integrasi Eksternal

- finalkan SIASN sync
- finalkan job monitoring
- finalkan import data

### Analitik SDM

- finalkan dashboard SDM
- finalkan formasi
- finalkan ABK
- finalkan talent pool

---

## Dependency Reminder

Jangan mengerjakan modul ini secara terbalik:

- jangan ekspansi layanan sebelum `pensiun` benar
- jangan finalkan laporan sebelum data sumber stabil
- jangan finalkan dokumen sebelum alur workflow jelas
- jangan kerjakan integrasi lebih dulu daripada layanan inti
- jangan buka analitik saat data transaksi belum konsisten

---

## Cara Pakai

Gunakan roadmap ini seperti berikut:

1. pilih sprint aktif
2. batasi scope sprint
3. ambil issue dari backlog modul yang relevan
4. cocokkan dengan aturan di `AGENTS.md`
5. tutup sprint hanya jika definition of done terpenuhi
