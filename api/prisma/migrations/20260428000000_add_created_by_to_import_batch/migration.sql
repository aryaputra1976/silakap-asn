-- Add createdBy field to track batch ownership
ALTER TABLE silakap_pegawai_import_batch ADD COLUMN created_by VARCHAR(36);

-- Add index for querying batches by creator
CREATE INDEX idx_silakap_pegawai_import_batch_created_by ON silakap_pegawai_import_batch(created_by);
