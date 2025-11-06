/*
  Warnings:

  - You are about to drop the column `state` on the `locale_strings` table. All the data in the column will be lost.
  - You are about to drop the column `bot` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `locale_strings` DROP COLUMN `state`;

-- AlterTable
ALTER TABLE `source_files` ADD COLUMN `export_not_translated` ENUM('KEEP_ORIGINAL', 'EMPTY_STRING', 'SKIP_STRING', 'FAIL_EXPORT') NOT NULL DEFAULT 'KEEP_ORIGINAL';

-- AlterTable
ALTER TABLE `users` DROP COLUMN `bot`,
    MODIFY `system_role` ENUM('BANNED', 'BOT', 'USER', 'ADMIN') NOT NULL DEFAULT 'USER';
