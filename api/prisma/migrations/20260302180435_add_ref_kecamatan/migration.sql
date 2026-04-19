-- AlterTable
ALTER TABLE `ref_unor` ADD COLUMN `kecamatan_id` BIGINT NULL;

-- CreateTable
CREATE TABLE `ref_kecamatan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ref_kecamatan_nama_key`(`nama`),
    INDEX `ref_kecamatan_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ref_unor_kecamatan_id_idx` ON `ref_unor`(`kecamatan_id`);

-- AddForeignKey
ALTER TABLE `ref_unor` ADD CONSTRAINT `ref_unor_kecamatan_id_fkey` FOREIGN KEY (`kecamatan_id`) REFERENCES `ref_kecamatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
