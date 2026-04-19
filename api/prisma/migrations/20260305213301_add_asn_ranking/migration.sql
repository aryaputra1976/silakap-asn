-- AlterTable
ALTER TABLE `silakap_pegawai` ADD COLUMN `golongan_rank` INTEGER NULL,
    ADD COLUMN `jenis_jabatan_rank` INTEGER NULL,
    ADD COLUMN `masa_kerja_total` INTEGER NULL,
    ADD COLUMN `pendidikan_rank` INTEGER NULL;

-- CreateIndex
CREATE INDEX `idx_asn_ranking` ON `silakap_pegawai`(`jenis_jabatan_rank`, `golongan_rank`, `masa_kerja_total`, `pendidikan_rank`, `tanggal_lahir`, `nip`);
