/*
  Warnings:

  - A unique constraint covering the columns `[id_siasn]` on the table `ref_tempat_lahir` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ref_tempat_lahir` ADD COLUMN `id_siasn` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ref_tempat_lahir_id_siasn_key` ON `ref_tempat_lahir`(`id_siasn`);
