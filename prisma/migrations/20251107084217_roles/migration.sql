/*
  Warnings:

  - You are about to drop the column `system_role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sessions` ADD COLUMN `impersonated_by` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `system_role`,
    ADD COLUMN `ban_expires_at` DATETIME(3) NULL,
    ADD COLUMN `ban_reason` TEXT NULL,
    ADD COLUMN `banned` BOOLEAN NULL,
    ADD COLUMN `role` VARCHAR(191) NULL;
