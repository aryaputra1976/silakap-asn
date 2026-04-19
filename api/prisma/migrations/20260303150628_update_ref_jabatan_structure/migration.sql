/*
  Warnings:

  - You are about to drop the column `created_by` on the `ref_jabatan` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `ref_jabatan` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `ref_jabatan_deleted_at_idx` ON `ref_jabatan`;

-- DropIndex
DROP INDEX `ref_jabatan_is_active_idx` ON `ref_jabatan`;

-- AlterTable
ALTER TABLE `ref_jabatan` DROP COLUMN `created_by`,
    DROP COLUMN `updated_by`,
    ADD COLUMN `bup` INTEGER NULL,
    ADD COLUMN `eselon_id` VARCHAR(50) NULL,
    ADD COLUMN `jenjang` VARCHAR(100) NULL,
    ADD COLUMN `unor_nama` VARCHAR(250) NULL;
