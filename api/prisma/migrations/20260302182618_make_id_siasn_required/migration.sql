/*
  Warnings:

  - Made the column `id_siasn` on table `ref_tempat_lahir` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ref_tempat_lahir` MODIFY `id_siasn` VARCHAR(100) NOT NULL;
