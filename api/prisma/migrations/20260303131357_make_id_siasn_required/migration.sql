/*
  Warnings:

  - A unique constraint covering the columns `[id_siasn]` on the table `ref_agama` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_alasan_pensiun` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_golongan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_instansi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_jabatan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_jenis_jabatan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_jenis_kelamin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_jenis_pegawai` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_jenis_pensiun` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_kedudukan_hukum` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_kpkn` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_lokasi_kerja` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_pendidikan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_pendidikan_tingkat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_satker` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_status_kepegawaian` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_siasn]` on the table `ref_status_perkawinan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_siasn` to the `ref_agama` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_alasan_pensiun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_golongan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_instansi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_jabatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_jenis_jabatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_jenis_kelamin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_jenis_pegawai` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_jenis_pensiun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_kedudukan_hukum` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_kpkn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_lokasi_kerja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_pendidikan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_pendidikan_tingkat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_satker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_status_kepegawaian` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_siasn` to the `ref_status_perkawinan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ref_agama` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_alasan_pensiun` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_golongan` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_instansi` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_jabatan` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_jenis_jabatan` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_jenis_kelamin` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_jenis_pegawai` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_jenis_pensiun` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_kedudukan_hukum` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_kpkn` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_lokasi_kerja` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_pendidikan` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_pendidikan_tingkat` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_satker` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_status_kepegawaian` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `ref_status_perkawinan` ADD COLUMN `id_siasn` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ref_agama_id_siasn_key` ON `ref_agama`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_alasan_pensiun_id_siasn_key` ON `ref_alasan_pensiun`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_golongan_id_siasn_key` ON `ref_golongan`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_instansi_id_siasn_key` ON `ref_instansi`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_jabatan_id_siasn_key` ON `ref_jabatan`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_jenis_jabatan_id_siasn_key` ON `ref_jenis_jabatan`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_jenis_kelamin_id_siasn_key` ON `ref_jenis_kelamin`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_jenis_pegawai_id_siasn_key` ON `ref_jenis_pegawai`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_jenis_pensiun_id_siasn_key` ON `ref_jenis_pensiun`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_kedudukan_hukum_id_siasn_key` ON `ref_kedudukan_hukum`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_kpkn_id_siasn_key` ON `ref_kpkn`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_lokasi_kerja_id_siasn_key` ON `ref_lokasi_kerja`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_pendidikan_id_siasn_key` ON `ref_pendidikan`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_pendidikan_tingkat_id_siasn_key` ON `ref_pendidikan_tingkat`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_satker_id_siasn_key` ON `ref_satker`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_status_kepegawaian_id_siasn_key` ON `ref_status_kepegawaian`(`id_siasn`);

-- CreateIndex
CREATE UNIQUE INDEX `ref_status_perkawinan_id_siasn_key` ON `ref_status_perkawinan`(`id_siasn`);
