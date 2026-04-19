-- AlterTable
ALTER TABLE `ref_unor` ADD COLUMN `sort_order` INTEGER NULL;

-- CreateIndex
CREATE INDEX `ref_unor_parent_id_sort_order_idx` ON `ref_unor`(`parent_id`, `sort_order`);
