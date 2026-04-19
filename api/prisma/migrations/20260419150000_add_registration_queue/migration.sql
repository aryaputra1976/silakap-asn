CREATE TABLE `silakap_registrasi_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pegawai_id` BIGINT NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(191) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `no_hp` VARCHAR(30) NOT NULL,
  `requested_role_id` BIGINT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `review_note` TEXT NULL,
  `reviewed_by_user_id` BIGINT NULL,
  `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `silakap_registrasi_user_pegawai_id_key`(`pegawai_id`),
  UNIQUE INDEX `silakap_registrasi_user_username_key`(`username`),
  INDEX `silakap_registrasi_user_status_idx`(`status`),
  INDEX `silakap_registrasi_user_submitted_at_idx`(`submitted_at`),
  INDEX `silakap_registrasi_user_requested_role_id_idx`(`requested_role_id`),
  INDEX `silakap_registrasi_user_reviewed_by_user_id_idx`(`reviewed_by_user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `silakap_registrasi_user`
  ADD CONSTRAINT `silakap_registrasi_user_pegawai_id_fkey`
    FOREIGN KEY (`pegawai_id`) REFERENCES `silakap_pegawai`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `silakap_registrasi_user`
  ADD CONSTRAINT `silakap_registrasi_user_requested_role_id_fkey`
    FOREIGN KEY (`requested_role_id`) REFERENCES `silakap_role`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `silakap_registrasi_user`
  ADD CONSTRAINT `silakap_registrasi_user_reviewed_by_user_id_fkey`
    FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `silakap_user`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
