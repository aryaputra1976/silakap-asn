-- CreateTable
CREATE TABLE `silakap_peremajaan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `layanan_id` BIGINT NOT NULL,
    `jenis_perubahan` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `data_lama` JSON NULL,
    `data_baru` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `silakap_peremajaan_layanan_id_key`(`layanan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `pegawai_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `silakap_user_username_key`(`username`),
    UNIQUE INDEX `silakap_user_pegawai_id_key`(`pegawai_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `silakap_role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `silakap_permission_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_user_role` (
    `user_id` BIGINT NOT NULL,
    `role_id` BIGINT NOT NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_role_permission` (
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_agama` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_agama_kode_key`(`kode`),
    UNIQUE INDEX `ref_agama_nama_key`(`nama`),
    INDEX `ref_agama_is_active_idx`(`is_active`),
    INDEX `ref_agama_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jenis_kelamin` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_jenis_kelamin_kode_key`(`kode`),
    UNIQUE INDEX `ref_jenis_kelamin_nama_key`(`nama`),
    INDEX `ref_jenis_kelamin_is_active_idx`(`is_active`),
    INDEX `ref_jenis_kelamin_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_status_perkawinan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_status_perkawinan_kode_key`(`kode`),
    UNIQUE INDEX `ref_status_perkawinan_nama_key`(`nama`),
    INDEX `ref_status_perkawinan_is_active_idx`(`is_active`),
    INDEX `ref_status_perkawinan_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jenis_pegawai` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_jenis_pegawai_kode_key`(`kode`),
    UNIQUE INDEX `ref_jenis_pegawai_nama_key`(`nama`),
    INDEX `ref_jenis_pegawai_is_active_idx`(`is_active`),
    INDEX `ref_jenis_pegawai_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_status_kepegawaian` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_status_kepegawaian_kode_key`(`kode`),
    UNIQUE INDEX `ref_status_kepegawaian_nama_key`(`nama`),
    INDEX `ref_status_kepegawaian_is_active_idx`(`is_active`),
    INDEX `ref_status_kepegawaian_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_golongan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(6) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_golongan_kode_key`(`kode`),
    UNIQUE INDEX `ref_golongan_nama_key`(`nama`),
    INDEX `ref_golongan_is_active_idx`(`is_active`),
    INDEX `ref_golongan_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jenis_pensiun` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_jenis_pensiun_kode_key`(`kode`),
    UNIQUE INDEX `ref_jenis_pensiun_nama_key`(`nama`),
    INDEX `ref_jenis_pensiun_is_active_idx`(`is_active`),
    INDEX `ref_jenis_pensiun_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_alasan_pensiun` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(2) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_alasan_pensiun_kode_key`(`kode`),
    UNIQUE INDEX `ref_alasan_pensiun_nama_key`(`nama`),
    INDEX `ref_alasan_pensiun_is_active_idx`(`is_active`),
    INDEX `ref_alasan_pensiun_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_pendidikan_tingkat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(10) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `ref_pendidikan_tingkat_kode_key`(`kode`),
    UNIQUE INDEX `ref_pendidikan_tingkat_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_pendidikan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(200) NOT NULL,
    `tingkat_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_pendidikan_kode_key`(`kode`),
    UNIQUE INDEX `ref_pendidikan_nama_key`(`nama`),
    INDEX `ref_pendidikan_tingkat_id_idx`(`tingkat_id`),
    INDEX `ref_pendidikan_is_active_idx`(`is_active`),
    INDEX `ref_pendidikan_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_kedudukan_hukum` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(200) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_kedudukan_hukum_kode_key`(`kode`),
    UNIQUE INDEX `ref_kedudukan_hukum_nama_key`(`nama`),
    INDEX `ref_kedudukan_hukum_is_active_idx`(`is_active`),
    INDEX `ref_kedudukan_hukum_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_tempat_lahir` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(200) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_tempat_lahir_kode_key`(`kode`),
    UNIQUE INDEX `ref_tempat_lahir_nama_key`(`nama`),
    INDEX `ref_tempat_lahir_is_active_idx`(`is_active`),
    INDEX `ref_tempat_lahir_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jenis_jabatan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(200) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_jenis_jabatan_kode_key`(`kode`),
    UNIQUE INDEX `ref_jenis_jabatan_nama_key`(`nama`),
    INDEX `ref_jenis_jabatan_is_active_idx`(`is_active`),
    INDEX `ref_jenis_jabatan_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_jabatan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `jenis_jabatan_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_jabatan_kode_key`(`kode`),
    UNIQUE INDEX `ref_jabatan_nama_key`(`nama`),
    INDEX `ref_jabatan_jenis_jabatan_id_idx`(`jenis_jabatan_id`),
    INDEX `ref_jabatan_is_active_idx`(`is_active`),
    INDEX `ref_jabatan_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_instansi` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_instansi_kode_key`(`kode`),
    UNIQUE INDEX `ref_instansi_nama_key`(`nama`),
    INDEX `ref_instansi_is_active_idx`(`is_active`),
    INDEX `ref_instansi_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_satker` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_satker_kode_key`(`kode`),
    UNIQUE INDEX `ref_satker_nama_key`(`nama`),
    INDEX `ref_satker_is_active_idx`(`is_active`),
    INDEX `ref_satker_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_unor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_unor_kode_key`(`kode`),
    UNIQUE INDEX `ref_unor_nama_key`(`nama`),
    INDEX `ref_unor_is_active_idx`(`is_active`),
    INDEX `ref_unor_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_lokasi_kerja` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_lokasi_kerja_kode_key`(`kode`),
    UNIQUE INDEX `ref_lokasi_kerja_nama_key`(`nama`),
    INDEX `ref_lokasi_kerja_is_active_idx`(`is_active`),
    INDEX `ref_lokasi_kerja_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ref_kpkn` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(100) NOT NULL,
    `nama` VARCHAR(250) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,

    UNIQUE INDEX `ref_kpkn_kode_key`(`kode`),
    UNIQUE INDEX `ref_kpkn_nama_key`(`nama`),
    INDEX `ref_kpkn_is_active_idx`(`is_active`),
    INDEX `ref_kpkn_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_pegawai` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nip` VARCHAR(191) NOT NULL,
    `nip_lama` VARCHAR(20) NULL,
    `nik` VARCHAR(191) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `gelar_depan` VARCHAR(191) NULL,
    `gelar_belakang` VARCHAR(191) NULL,
    `tempat_lahir_id` BIGINT NULL,
    `tempat_lahir` VARCHAR(191) NULL,
    `tanggal_lahir` DATETIME(3) NULL,
    `jenis_kelamin_id` BIGINT NULL,
    `agama_id` BIGINT NULL,
    `status_perkawinan_id` BIGINT NULL,
    `jenis_pegawai_id` BIGINT NULL,
    `jenis_pegawai_nama` VARCHAR(191) NULL,
    `kedudukan_hukum_id` BIGINT NULL,
    `status_cpns_pns` VARCHAR(191) NULL,
    `golongan_awal_id` BIGINT NULL,
    `tmt_golongan_awal` DATETIME(3) NULL,
    `golongan_aktif_id` BIGINT NULL,
    `tmt_golongan` DATETIME(3) NULL,
    `mk_tahun` INTEGER NULL,
    `mk_bulan` INTEGER NULL,
    `jenis_jabatan_id` BIGINT NULL,
    `jabatan_id` BIGINT NULL,
    `tmt_jabatan` DATETIME(3) NULL,
    `sk_jabatan_nomor` VARCHAR(100) NULL,
    `sk_jabatan_tanggal` DATETIME(3) NULL,
    `pendidikan_tingkat_id` BIGINT NULL,
    `pendidikan_id` BIGINT NULL,
    `tahun_lulus` INTEGER NULL,
    `nama_sekolah_terakhir` VARCHAR(191) NULL,
    `nomor_ijazah` VARCHAR(150) NULL,
    `alamat` VARCHAR(191) NULL,
    `no_hp` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `email_pemerintah` VARCHAR(150) NULL,
    `status_aktif` BOOLEAN NOT NULL DEFAULT true,
    `sk_cpns_nomor` VARCHAR(100) NULL,
    `sk_cpns_tanggal` DATETIME(3) NULL,
    `tmt_cpns` DATETIME(3) NULL,
    `sk_pns_nomor` VARCHAR(100) NULL,
    `sk_pns_tanggal` DATETIME(3) NULL,
    `tmt_pns` DATETIME(3) NULL,
    `bpjs_nomor` VARCHAR(50) NULL,
    `npwp_nomor` VARCHAR(50) NULL,
    `kartu_asn_virtual` VARCHAR(100) NULL,
    `instansi_induk_id` BIGINT NULL,
    `instansi_kerja_id` BIGINT NULL,
    `satker_induk_id` BIGINT NULL,
    `satker_kerja_id` BIGINT NULL,
    `unor_id` BIGINT NULL,
    `unor_induk_id` BIGINT NULL,
    `lokasi_kerja_id` BIGINT NULL,
    `kpkn_id` BIGINT NULL,
    `siasn_id` VARCHAR(191) NULL,
    `sapk_id` VARCHAR(191) NULL,
    `ref_siasn` VARCHAR(191) NULL,
    `is_valid_nik` BOOLEAN NOT NULL DEFAULT false,
    `flag_ikd` BOOLEAN NOT NULL DEFAULT false,
    `foto_url` VARCHAR(191) NULL,
    `foto_siasn_url` VARCHAR(191) NULL,
    `foto_hash` VARCHAR(191) NULL,
    `foto_mime` VARCHAR(191) NULL,
    `foto_updated_at` DATETIME(3) NULL,
    `raw_siasn_json` JSON NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `silakap_pegawai_nip_key`(`nip`),
    UNIQUE INDEX `silakap_pegawai_siasn_id_key`(`siasn_id`),
    INDEX `silakap_pegawai_nip_idx`(`nip`),
    INDEX `silakap_pegawai_nik_idx`(`nik`),
    INDEX `silakap_pegawai_nama_idx`(`nama`),
    INDEX `silakap_pegawai_status_aktif_idx`(`status_aktif`),
    INDEX `silakap_pegawai_jenis_kelamin_id_idx`(`jenis_kelamin_id`),
    INDEX `silakap_pegawai_agama_id_idx`(`agama_id`),
    INDEX `silakap_pegawai_status_perkawinan_id_idx`(`status_perkawinan_id`),
    INDEX `silakap_pegawai_jenis_pegawai_id_idx`(`jenis_pegawai_id`),
    INDEX `silakap_pegawai_kedudukan_hukum_id_idx`(`kedudukan_hukum_id`),
    INDEX `silakap_pegawai_golongan_awal_id_idx`(`golongan_awal_id`),
    INDEX `silakap_pegawai_golongan_aktif_id_idx`(`golongan_aktif_id`),
    INDEX `silakap_pegawai_jabatan_id_idx`(`jabatan_id`),
    INDEX `silakap_pegawai_pendidikan_id_idx`(`pendidikan_id`),
    INDEX `silakap_pegawai_instansi_kerja_id_idx`(`instansi_kerja_id`),
    INDEX `silakap_pegawai_satker_kerja_id_idx`(`satker_kerja_id`),
    INDEX `silakap_pegawai_unor_id_idx`(`unor_id`),
    INDEX `silakap_pegawai_lokasi_kerja_id_idx`(`lokasi_kerja_id`),
    INDEX `silakap_pegawai_kpkn_id_idx`(`kpkn_id`),
    INDEX `silakap_pegawai_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_pangkat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `golongan_id` BIGINT NOT NULL,
    `tmt_pangkat` DATETIME(3) NOT NULL,
    `nomor_sk` VARCHAR(100) NULL,
    `tanggal_sk` DATETIME(3) NULL,
    `raw_siasn_json` JSON NULL,

    INDEX `silakap_riwayat_pangkat_pegawai_id_idx`(`pegawai_id`),
    INDEX `silakap_riwayat_pangkat_golongan_id_idx`(`golongan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_pendidikan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `pendidikan_id` BIGINT NULL,
    `pendidikan_tingkat_id` BIGINT NULL,
    `nama_sekolah` VARCHAR(191) NULL,
    `tahun_lulus` INTEGER NULL,
    `raw_siasn_json` JSON NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_cpns_pns` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `nomor_sk` VARCHAR(100) NULL,
    `tanggal_sk` DATETIME(3) NULL,
    `tmt` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `silakap_riwayat_cpns_pns_pegawai_id_idx`(`pegawai_id`),
    INDEX `silakap_riwayat_cpns_pns_jenis_idx`(`jenis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_diklat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `nama` VARCHAR(191) NULL,
    `tahun` INTEGER NULL,
    `raw_siasn_json` JSON NULL,

    INDEX `silakap_riwayat_diklat_pegawai_id_idx`(`pegawai_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_jabatan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `jenis_jabatan_id` BIGINT NULL,
    `jabatan_id` BIGINT NULL,
    `instansi_id` BIGINT NULL,
    `satker_id` BIGINT NULL,
    `unor_id` BIGINT NULL,
    `lokasi_kerja_id` BIGINT NULL,
    `nomor_sk` VARCHAR(100) NULL,
    `tanggal_sk` DATETIME(3) NULL,
    `tmt_jabatan` DATETIME(3) NOT NULL,
    `raw_siasn_json` JSON NULL,

    INDEX `silakap_riwayat_jabatan_pegawai_id_idx`(`pegawai_id`),
    INDEX `silakap_riwayat_jabatan_jabatan_id_idx`(`jabatan_id`),
    INDEX `silakap_riwayat_jabatan_jenis_jabatan_id_idx`(`jenis_jabatan_id`),
    INDEX `silakap_riwayat_jabatan_instansi_id_idx`(`instansi_id`),
    INDEX `silakap_riwayat_jabatan_satker_id_idx`(`satker_id`),
    INDEX `silakap_riwayat_jabatan_unor_id_idx`(`unor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_penghargaan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NULL,
    `raw_siasn_json` JSON NULL,

    INDEX `silakap_riwayat_penghargaan_pegawai_id_idx`(`pegawai_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_skp` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `tahun` INTEGER NOT NULL,
    `nilai` DOUBLE NULL,

    INDEX `silakap_riwayat_skp_pegawai_id_idx`(`pegawai_id`),
    INDEX `silakap_riwayat_skp_tahun_idx`(`tahun`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_riwayat_hukuman_disiplin` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `jenis` VARCHAR(191) NULL,
    `tanggal_sk` DATETIME(3) NULL,

    INDEX `silakap_riwayat_hukuman_disiplin_pegawai_id_idx`(`pegawai_id`),
    INDEX `silakap_riwayat_hukuman_disiplin_tanggal_sk_idx`(`tanggal_sk`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_jenis_layanan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `silakap_jenis_layanan_kode_key`(`kode`),
    UNIQUE INDEX `silakap_jenis_layanan_nama_key`(`nama`),
    INDEX `silakap_jenis_layanan_is_active_idx`(`is_active`),
    INDEX `silakap_jenis_layanan_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_usul_layanan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `jenis_layanan_id` BIGINT NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'APPROVED', 'REJECTED', 'SYNCED_SIASN', 'FAILED_SIASN') NOT NULL DEFAULT 'DRAFT',
    `tanggal_usul` DATETIME(3) NULL,

    INDEX `silakap_usul_layanan_pegawai_id_idx`(`pegawai_id`),
    INDEX `silakap_usul_layanan_jenis_layanan_id_idx`(`jenis_layanan_id`),
    INDEX `silakap_usul_layanan_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_pensiun_detail` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usul_id` BIGINT NOT NULL,
    `jenis_pensiun_id` BIGINT NOT NULL,
    `tmt_pensiun` DATETIME(3) NOT NULL,
    `dasar_hukum` VARCHAR(255) NULL,
    `keterangan` TEXT NULL,
    `nip_snapshot` VARCHAR(30) NOT NULL,
    `nama_snapshot` VARCHAR(200) NOT NULL,
    `tempat_lahir_snapshot` VARCHAR(100) NULL,
    `tanggal_lahir_snapshot` DATETIME(3) NULL,
    `golongan_snapshot` VARCHAR(50) NULL,
    `pangkat_snapshot` VARCHAR(150) NULL,
    `jabatan_snapshot` VARCHAR(250) NULL,
    `unit_kerja_snapshot` VARCHAR(250) NULL,
    `tmt_pns_snapshot` DATETIME(3) NULL,
    `masa_kerja_tahun_snapshot` INTEGER NULL,
    `masa_kerja_bulan_snapshot` INTEGER NULL,
    `usia_saat_pensiun_snapshot` INTEGER NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `silakap_pensiun_detail_usul_id_key`(`usul_id`),
    INDEX `silakap_pensiun_detail_jenis_pensiun_id_idx`(`jenis_pensiun_id`),
    INDEX `silakap_pensiun_detail_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_pensiun_perhitungan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pensiun_id` BIGINT NOT NULL,
    `masa_kerja_tahun` INTEGER NOT NULL,
    `masa_kerja_bulan` INTEGER NOT NULL,
    `gaji_pokok` DECIMAL(12, 2) NOT NULL,
    `estimasi_pensiun` DECIMAL(12, 2) NOT NULL,

    UNIQUE INDEX `silakap_pensiun_perhitungan_pensiun_id_key`(`pensiun_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_pensiun_sk` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pensiun_id` BIGINT NOT NULL,
    `nomor_sk` VARCHAR(191) NOT NULL,
    `tanggal_sk` DATETIME(3) NOT NULL,
    `dokumen_id` BIGINT NOT NULL,
    `status_tte` VARCHAR(191) NOT NULL DEFAULT 'BELUM_TTE',

    UNIQUE INDEX `silakap_pensiun_sk_pensiun_id_key`(`pensiun_id`),
    INDEX `silakap_pensiun_sk_dokumen_id_idx`(`dokumen_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_usul_dependency` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `parent_usul_id` BIGINT NOT NULL,
    `child_usul_id` BIGINT NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'APPROVED', 'REJECTED', 'SYNCED_SIASN', 'FAILED_SIASN') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_usul_dependency_parent_usul_id_idx`(`parent_usul_id`),
    INDEX `silakap_usul_dependency_child_usul_id_idx`(`child_usul_id`),
    UNIQUE INDEX `silakap_usul_dependency_parent_usul_id_child_usul_id_key`(`parent_usul_id`, `child_usul_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_disposisi` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usul_id` BIGINT NOT NULL,
    `status` ENUM('SENT', 'ACCEPTED', 'DONE') NOT NULL DEFAULT 'SENT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_disposisi_usul_id_idx`(`usul_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_siasn_job` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usul_id` BIGINT NOT NULL,
    `status` ENUM('QUEUED', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `error_message` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_siasn_job_usul_id_idx`(`usul_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_siasn_sync` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usul_id` BIGINT NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `request` JSON NULL,
    `response` JSON NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `last_error` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `silakap_siasn_sync_usul_id_idx`(`usul_id`),
    INDEX `silakap_siasn_sync_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_layanan_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usul_id` BIGINT NOT NULL,
    `role_id` BIGINT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'APPROVED', 'REJECTED', 'SYNCED_SIASN', 'FAILED_SIASN') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_layanan_log_usul_id_idx`(`usul_id`),
    INDEX `silakap_layanan_log_role_id_idx`(`role_id`),
    INDEX `silakap_layanan_log_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_layanan_bidang` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `jenis_layanan_id` BIGINT NOT NULL,
    `bidang_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_layanan_bidang_jenis_layanan_id_idx`(`jenis_layanan_id`),
    INDEX `silakap_layanan_bidang_bidang_id_idx`(`bidang_id`),
    UNIQUE INDEX `silakap_layanan_bidang_jenis_layanan_id_bidang_id_key`(`jenis_layanan_id`, `bidang_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_workflow_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `jenis_layanan_id` BIGINT NOT NULL,
    `from_status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'APPROVED', 'REJECTED', 'SYNCED_SIASN', 'FAILED_SIASN') NOT NULL,
    `to_status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'APPROVED', 'REJECTED', 'SYNCED_SIASN', 'FAILED_SIASN') NOT NULL,
    `action_code` VARCHAR(191) NOT NULL,
    `role_required` VARCHAR(191) NOT NULL,
    `requires_disposisi` BOOLEAN NOT NULL DEFAULT false,
    `requires_dependency` BOOLEAN NOT NULL DEFAULT false,
    `requires_siasn` BOOLEAN NOT NULL DEFAULT false,
    `approval_stage` INTEGER NULL,
    `order_no` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_workflow_template_jenis_layanan_id_idx`(`jenis_layanan_id`),
    INDEX `silakap_workflow_template_from_status_idx`(`from_status`),
    UNIQUE INDEX `silakap_workflow_template_jenis_layanan_id_from_status_to_st_key`(`jenis_layanan_id`, `from_status`, `to_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_workflow_dependency` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `parent_jenis_layanan_id` BIGINT NOT NULL,
    `child_jenis_layanan_id` BIGINT NOT NULL,
    `trigger_status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'APPROVED', 'REJECTED', 'SYNCED_SIASN', 'FAILED_SIASN') NOT NULL,
    `blocking_status` ENUM('DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'APPROVED', 'REJECTED', 'SYNCED_SIASN', 'FAILED_SIASN') NOT NULL,
    `auto_create` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_workflow_dependency_parent_jenis_layanan_id_idx`(`parent_jenis_layanan_id`),
    INDEX `silakap_workflow_dependency_child_jenis_layanan_id_idx`(`child_jenis_layanan_id`),
    UNIQUE INDEX `silakap_workflow_dependency_parent_jenis_layanan_id_child_je_key`(`parent_jenis_layanan_id`, `child_jenis_layanan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_dokumen` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pegawai_id` BIGINT NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_dokumen_pegawai_id_idx`(`pegawai_id`),
    INDEX `silakap_dokumen_jenis_idx`(`jenis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `user_id` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_entity_idx`(`entity`),
    INDEX `audit_log_entity_id_idx`(`entity_id`),
    INDEX `audit_log_user_id_idx`(`user_id`),
    INDEX `audit_log_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outbox` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aggregate_type` VARCHAR(191) NOT NULL,
    `aggregate_id` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `next_retry_at` DATETIME(3) NULL,
    `locked_by` VARCHAR(191) NULL,
    `locked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,
    `error` VARCHAR(191) NULL,

    INDEX `outbox_status_idx`(`status`),
    INDEX `outbox_next_retry_at_idx`(`next_retry_at`),
    INDEX `outbox_aggregate_type_aggregate_id_idx`(`aggregate_type`, `aggregate_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_activity` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_activity_user_id_idx`(`user_id`),
    INDEX `silakap_activity_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `silakap_notification_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `silakap_notification_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_session` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` BIGINT NOT NULL,
    `refresh_hash` VARCHAR(191) NOT NULL,
    `user_agent` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `auth_session_user_id_idx`(`user_id`),
    INDEX `auth_session_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_bidang` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `silakap_bidang_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_dokumen_usul` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `usul_id` BIGINT NOT NULL,
    `nama` VARCHAR(191) NULL,
    `file_path` VARCHAR(191) NULL,

    INDEX `silakap_dokumen_usul_usul_id_idx`(`usul_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `silakap_import_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `jenis` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `total_rows` INTEGER NOT NULL,
    `success` INTEGER NOT NULL,
    `failed` INTEGER NOT NULL,
    `errors` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SilakapBidangToSilakapRole` (
    `A` BIGINT NOT NULL,
    `B` BIGINT NOT NULL,

    UNIQUE INDEX `_SilakapBidangToSilakapRole_AB_unique`(`A`, `B`),
    INDEX `_SilakapBidangToSilakapRole_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `silakap_peremajaan` ADD CONSTRAINT `silakap_peremajaan_layanan_id_fkey` FOREIGN KEY (`layanan_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_user` ADD CONSTRAINT `silakap_user_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_user_role` ADD CONSTRAINT `silakap_user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `silakap_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_user_role` ADD CONSTRAINT `silakap_user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `silakap_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_role_permission` ADD CONSTRAINT `silakap_role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `silakap_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_role_permission` ADD CONSTRAINT `silakap_role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `silakap_permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ref_pendidikan` ADD CONSTRAINT `ref_pendidikan_tingkat_id_fkey` FOREIGN KEY (`tingkat_id`) REFERENCES `ref_pendidikan_tingkat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ref_jabatan` ADD CONSTRAINT `ref_jabatan_jenis_jabatan_id_fkey` FOREIGN KEY (`jenis_jabatan_id`) REFERENCES `ref_jenis_jabatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_jenis_kelamin_id_fkey` FOREIGN KEY (`jenis_kelamin_id`) REFERENCES `ref_jenis_kelamin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_agama_id_fkey` FOREIGN KEY (`agama_id`) REFERENCES `ref_agama`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_status_perkawinan_id_fkey` FOREIGN KEY (`status_perkawinan_id`) REFERENCES `ref_status_perkawinan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_jenis_pegawai_id_fkey` FOREIGN KEY (`jenis_pegawai_id`) REFERENCES `ref_jenis_pegawai`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_kedudukan_hukum_id_fkey` FOREIGN KEY (`kedudukan_hukum_id`) REFERENCES `ref_kedudukan_hukum`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_golongan_aktif_id_fkey` FOREIGN KEY (`golongan_aktif_id`) REFERENCES `ref_golongan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_golongan_awal_id_fkey` FOREIGN KEY (`golongan_awal_id`) REFERENCES `ref_golongan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_jenis_jabatan_id_fkey` FOREIGN KEY (`jenis_jabatan_id`) REFERENCES `ref_jenis_jabatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_jabatan_id_fkey` FOREIGN KEY (`jabatan_id`) REFERENCES `ref_jabatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_pendidikan_tingkat_id_fkey` FOREIGN KEY (`pendidikan_tingkat_id`) REFERENCES `ref_pendidikan_tingkat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_pendidikan_id_fkey` FOREIGN KEY (`pendidikan_id`) REFERENCES `ref_pendidikan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_instansi_induk_id_fkey` FOREIGN KEY (`instansi_induk_id`) REFERENCES `ref_instansi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_instansi_kerja_id_fkey` FOREIGN KEY (`instansi_kerja_id`) REFERENCES `ref_instansi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_satker_induk_id_fkey` FOREIGN KEY (`satker_induk_id`) REFERENCES `ref_satker`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_satker_kerja_id_fkey` FOREIGN KEY (`satker_kerja_id`) REFERENCES `ref_satker`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_unor_id_fkey` FOREIGN KEY (`unor_id`) REFERENCES `ref_unor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_unor_induk_id_fkey` FOREIGN KEY (`unor_induk_id`) REFERENCES `ref_unor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_lokasi_kerja_id_fkey` FOREIGN KEY (`lokasi_kerja_id`) REFERENCES `ref_lokasi_kerja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_kpkn_id_fkey` FOREIGN KEY (`kpkn_id`) REFERENCES `ref_kpkn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pegawai` ADD CONSTRAINT `silakap_pegawai_tempat_lahir_id_fkey` FOREIGN KEY (`tempat_lahir_id`) REFERENCES `ref_tempat_lahir`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_pangkat` ADD CONSTRAINT `silakap_riwayat_pangkat_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_pangkat` ADD CONSTRAINT `silakap_riwayat_pangkat_golongan_id_fkey` FOREIGN KEY (`golongan_id`) REFERENCES `ref_golongan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_pendidikan` ADD CONSTRAINT `silakap_riwayat_pendidikan_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_pendidikan` ADD CONSTRAINT `silakap_riwayat_pendidikan_pendidikan_id_fkey` FOREIGN KEY (`pendidikan_id`) REFERENCES `ref_pendidikan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_pendidikan` ADD CONSTRAINT `silakap_riwayat_pendidikan_pendidikan_tingkat_id_fkey` FOREIGN KEY (`pendidikan_tingkat_id`) REFERENCES `ref_pendidikan_tingkat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_cpns_pns` ADD CONSTRAINT `silakap_riwayat_cpns_pns_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_diklat` ADD CONSTRAINT `silakap_riwayat_diklat_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_jabatan` ADD CONSTRAINT `silakap_riwayat_jabatan_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_jabatan` ADD CONSTRAINT `silakap_riwayat_jabatan_jenis_jabatan_id_fkey` FOREIGN KEY (`jenis_jabatan_id`) REFERENCES `ref_jenis_jabatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_jabatan` ADD CONSTRAINT `silakap_riwayat_jabatan_jabatan_id_fkey` FOREIGN KEY (`jabatan_id`) REFERENCES `ref_jabatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_jabatan` ADD CONSTRAINT `silakap_riwayat_jabatan_instansi_id_fkey` FOREIGN KEY (`instansi_id`) REFERENCES `ref_instansi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_jabatan` ADD CONSTRAINT `silakap_riwayat_jabatan_satker_id_fkey` FOREIGN KEY (`satker_id`) REFERENCES `ref_satker`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_jabatan` ADD CONSTRAINT `silakap_riwayat_jabatan_unor_id_fkey` FOREIGN KEY (`unor_id`) REFERENCES `ref_unor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_jabatan` ADD CONSTRAINT `silakap_riwayat_jabatan_lokasi_kerja_id_fkey` FOREIGN KEY (`lokasi_kerja_id`) REFERENCES `ref_lokasi_kerja`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_penghargaan` ADD CONSTRAINT `silakap_riwayat_penghargaan_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_skp` ADD CONSTRAINT `silakap_riwayat_skp_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_riwayat_hukuman_disiplin` ADD CONSTRAINT `silakap_riwayat_hukuman_disiplin_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_usul_layanan` ADD CONSTRAINT `silakap_usul_layanan_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_usul_layanan` ADD CONSTRAINT `silakap_usul_layanan_jenis_layanan_id_fkey` FOREIGN KEY (`jenis_layanan_id`) REFERENCES `silakap_jenis_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pensiun_detail` ADD CONSTRAINT `silakap_pensiun_detail_usul_id_fkey` FOREIGN KEY (`usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pensiun_detail` ADD CONSTRAINT `silakap_pensiun_detail_jenis_pensiun_id_fkey` FOREIGN KEY (`jenis_pensiun_id`) REFERENCES `ref_jenis_pensiun`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pensiun_perhitungan` ADD CONSTRAINT `silakap_pensiun_perhitungan_pensiun_id_fkey` FOREIGN KEY (`pensiun_id`) REFERENCES `silakap_pensiun_detail`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pensiun_sk` ADD CONSTRAINT `silakap_pensiun_sk_pensiun_id_fkey` FOREIGN KEY (`pensiun_id`) REFERENCES `silakap_pensiun_detail`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_pensiun_sk` ADD CONSTRAINT `silakap_pensiun_sk_dokumen_id_fkey` FOREIGN KEY (`dokumen_id`) REFERENCES `silakap_dokumen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_usul_dependency` ADD CONSTRAINT `silakap_usul_dependency_parent_usul_id_fkey` FOREIGN KEY (`parent_usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_usul_dependency` ADD CONSTRAINT `silakap_usul_dependency_child_usul_id_fkey` FOREIGN KEY (`child_usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_disposisi` ADD CONSTRAINT `silakap_disposisi_usul_id_fkey` FOREIGN KEY (`usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_siasn_job` ADD CONSTRAINT `silakap_siasn_job_usul_id_fkey` FOREIGN KEY (`usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_siasn_sync` ADD CONSTRAINT `silakap_siasn_sync_usul_id_fkey` FOREIGN KEY (`usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_layanan_log` ADD CONSTRAINT `silakap_layanan_log_usul_id_fkey` FOREIGN KEY (`usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_layanan_log` ADD CONSTRAINT `silakap_layanan_log_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `silakap_role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_layanan_bidang` ADD CONSTRAINT `silakap_layanan_bidang_jenis_layanan_id_fkey` FOREIGN KEY (`jenis_layanan_id`) REFERENCES `silakap_jenis_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_layanan_bidang` ADD CONSTRAINT `silakap_layanan_bidang_bidang_id_fkey` FOREIGN KEY (`bidang_id`) REFERENCES `silakap_bidang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_workflow_template` ADD CONSTRAINT `silakap_workflow_template_jenis_layanan_id_fkey` FOREIGN KEY (`jenis_layanan_id`) REFERENCES `silakap_jenis_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_workflow_dependency` ADD CONSTRAINT `silakap_workflow_dependency_parent_jenis_layanan_id_fkey` FOREIGN KEY (`parent_jenis_layanan_id`) REFERENCES `silakap_jenis_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_workflow_dependency` ADD CONSTRAINT `silakap_workflow_dependency_child_jenis_layanan_id_fkey` FOREIGN KEY (`child_jenis_layanan_id`) REFERENCES `silakap_jenis_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_dokumen` ADD CONSTRAINT `silakap_dokumen_pegawai_id_fkey` FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `silakap_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_activity` ADD CONSTRAINT `silakap_activity_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `silakap_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_notification` ADD CONSTRAINT `silakap_notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `silakap_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_session` ADD CONSTRAINT `auth_session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `silakap_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `silakap_dokumen_usul` ADD CONSTRAINT `silakap_dokumen_usul_usul_id_fkey` FOREIGN KEY (`usul_id`) REFERENCES `silakap_usul_layanan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SilakapBidangToSilakapRole` ADD CONSTRAINT `_SilakapBidangToSilakapRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `silakap_bidang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_SilakapBidangToSilakapRole` ADD CONSTRAINT `_SilakapBidangToSilakapRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `silakap_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
