/*
  Warnings:

  - A unique constraint covering the columns `[source_file_id,key]` on the table `locale_strings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `locale_strings` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `translated_strings` MODIFY `content` TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `locale_strings_source_file_id_key_key` ON `locale_strings`(`source_file_id`, `key`);
