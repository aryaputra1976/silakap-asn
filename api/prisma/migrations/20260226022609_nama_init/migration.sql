-- DropIndex
DROP INDEX `ref_agama_nama_key` ON `ref_agama`;

-- DropIndex
DROP INDEX `ref_alasan_pensiun_nama_key` ON `ref_alasan_pensiun`;

-- DropIndex
DROP INDEX `ref_golongan_nama_key` ON `ref_golongan`;

-- DropIndex
DROP INDEX `ref_instansi_nama_key` ON `ref_instansi`;

-- DropIndex
DROP INDEX `ref_jabatan_nama_key` ON `ref_jabatan`;

-- DropIndex
DROP INDEX `ref_jenis_jabatan_nama_key` ON `ref_jenis_jabatan`;

-- DropIndex
DROP INDEX `ref_jenis_kelamin_nama_key` ON `ref_jenis_kelamin`;

-- DropIndex
DROP INDEX `ref_jenis_pegawai_nama_key` ON `ref_jenis_pegawai`;

-- DropIndex
DROP INDEX `ref_jenis_pensiun_nama_key` ON `ref_jenis_pensiun`;

-- DropIndex
DROP INDEX `ref_kedudukan_hukum_nama_key` ON `ref_kedudukan_hukum`;

-- DropIndex
DROP INDEX `ref_kpkn_nama_key` ON `ref_kpkn`;

-- DropIndex
DROP INDEX `ref_lokasi_kerja_nama_key` ON `ref_lokasi_kerja`;

-- DropIndex
DROP INDEX `ref_pendidikan_nama_key` ON `ref_pendidikan`;

-- DropIndex
DROP INDEX `ref_pendidikan_tingkat_nama_key` ON `ref_pendidikan_tingkat`;

-- DropIndex
DROP INDEX `ref_satker_nama_key` ON `ref_satker`;

-- DropIndex
DROP INDEX `ref_status_kepegawaian_nama_key` ON `ref_status_kepegawaian`;

-- DropIndex
DROP INDEX `ref_status_perkawinan_nama_key` ON `ref_status_perkawinan`;

-- DropIndex
DROP INDEX `ref_tempat_lahir_nama_key` ON `ref_tempat_lahir`;

-- DropIndex
DROP INDEX `ref_unor_nama_key` ON `ref_unor`;

-- CreateIndex
CREATE INDEX `ref_agama_nama_idx` ON `ref_agama`(`nama`);

-- CreateIndex
CREATE INDEX `ref_alasan_pensiun_nama_idx` ON `ref_alasan_pensiun`(`nama`);

-- CreateIndex
CREATE INDEX `ref_golongan_nama_idx` ON `ref_golongan`(`nama`);

-- CreateIndex
CREATE INDEX `ref_instansi_nama_idx` ON `ref_instansi`(`nama`);

-- CreateIndex
CREATE INDEX `ref_jabatan_nama_idx` ON `ref_jabatan`(`nama`);

-- CreateIndex
CREATE INDEX `ref_jenis_jabatan_nama_idx` ON `ref_jenis_jabatan`(`nama`);

-- CreateIndex
CREATE INDEX `ref_jenis_kelamin_nama_idx` ON `ref_jenis_kelamin`(`nama`);

-- CreateIndex
CREATE INDEX `ref_jenis_pegawai_nama_idx` ON `ref_jenis_pegawai`(`nama`);

-- CreateIndex
CREATE INDEX `ref_jenis_pensiun_nama_idx` ON `ref_jenis_pensiun`(`nama`);

-- CreateIndex
CREATE INDEX `ref_kedudukan_hukum_nama_idx` ON `ref_kedudukan_hukum`(`nama`);

-- CreateIndex
CREATE INDEX `ref_kpkn_nama_idx` ON `ref_kpkn`(`nama`);

-- CreateIndex
CREATE INDEX `ref_lokasi_kerja_nama_idx` ON `ref_lokasi_kerja`(`nama`);

-- CreateIndex
CREATE INDEX `ref_pendidikan_nama_idx` ON `ref_pendidikan`(`nama`);

-- CreateIndex
CREATE INDEX `ref_pendidikan_tingkat_nama_idx` ON `ref_pendidikan_tingkat`(`nama`);

-- CreateIndex
CREATE INDEX `ref_satker_nama_idx` ON `ref_satker`(`nama`);

-- CreateIndex
CREATE INDEX `ref_status_kepegawaian_nama_idx` ON `ref_status_kepegawaian`(`nama`);

-- CreateIndex
CREATE INDEX `ref_status_perkawinan_nama_idx` ON `ref_status_perkawinan`(`nama`);

-- CreateIndex
CREATE INDEX `ref_tempat_lahir_nama_idx` ON `ref_tempat_lahir`(`nama`);

-- CreateIndex
CREATE INDEX `ref_unor_nama_idx` ON `ref_unor`(`nama`);
