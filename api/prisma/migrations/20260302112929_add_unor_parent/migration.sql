-- AlterTable
ALTER TABLE `ref_unor` ADD COLUMN `level` INTEGER NULL,
    ADD COLUMN `parent_id` BIGINT NULL;

-- CreateIndex
CREATE INDEX `ref_unor_parent_id_idx` ON `ref_unor`(`parent_id`);

-- AddForeignKey
ALTER TABLE `ref_unor` ADD CONSTRAINT `ref_unor_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `ref_unor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
