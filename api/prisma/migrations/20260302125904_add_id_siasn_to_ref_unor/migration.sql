/*
  Warnings:

  - A unique constraint covering the columns `[id_siasn]` on the table `ref_unor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ref_unor` ADD COLUMN `id_siasn` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ref_unor_id_siasn_key` ON `ref_unor`(`id_siasn`);

-- CreateIndex
CREATE INDEX `ref_unor_id_siasn_idx` ON `ref_unor`(`id_siasn`);
