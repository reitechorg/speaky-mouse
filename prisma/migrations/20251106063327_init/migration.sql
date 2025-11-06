-- CreateTable
CREATE TABLE `labels` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `source_files` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `import_path` VARCHAR(191) NOT NULL,
    `export_path` VARCHAR(191) NOT NULL,
    `parser` VARCHAR(191) NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `source_language_code` CHAR(2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `source_file_target_languages` (
    `source_file_id` VARCHAR(191) NOT NULL,
    `language_code` CHAR(2) NOT NULL,

    PRIMARY KEY (`source_file_id`, `language_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locale_strings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `max_length` INTEGER NULL,
    `source_file_id` VARCHAR(191) NOT NULL,
    `state` ENUM('NOT_TRANSLATED', 'NOT_APPROVED', 'APPROVED') NOT NULL DEFAULT 'NOT_TRANSLATED',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translated_strings` (
    `id` VARCHAR(191) NOT NULL,
    `locale_string_id` VARCHAR(191) NOT NULL,
    `language_code` CHAR(2) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `publicVisible` BOOLEAN NOT NULL DEFAULT false,
    `publicJoin` BOOLEAN NOT NULL DEFAULT false,
    `publicDownload` BOOLEAN NOT NULL DEFAULT false,
    `default_source_language_code` CHAR(2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `default_project_target_languages` (
    `project_id` VARCHAR(191) NOT NULL,
    `language_code` CHAR(2) NOT NULL,

    PRIMARY KEY (`project_id`, `language_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectMember` (
    `project_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('BANNED', 'TRANSLATOR', 'REVIEWER', 'MODERATOR', 'ADMIN', 'OWNER') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`project_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `realm_of_origin` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `system_role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `bot` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_LocaleStringLabels` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_LocaleStringLabels_AB_unique`(`A`, `B`),
    INDEX `_LocaleStringLabels_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `labels` ADD CONSTRAINT `labels_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `source_files` ADD CONSTRAINT `source_files_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `source_file_target_languages` ADD CONSTRAINT `source_file_target_languages_source_file_id_fkey` FOREIGN KEY (`source_file_id`) REFERENCES `source_files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `locale_strings` ADD CONSTRAINT `locale_strings_source_file_id_fkey` FOREIGN KEY (`source_file_id`) REFERENCES `source_files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `translated_strings` ADD CONSTRAINT `translated_strings_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `translated_strings` ADD CONSTRAINT `translated_strings_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `translated_strings` ADD CONSTRAINT `translated_strings_locale_string_id_fkey` FOREIGN KEY (`locale_string_id`) REFERENCES `locale_strings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `default_project_target_languages` ADD CONSTRAINT `default_project_target_languages_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LocaleStringLabels` ADD CONSTRAINT `_LocaleStringLabels_A_fkey` FOREIGN KEY (`A`) REFERENCES `labels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LocaleStringLabels` ADD CONSTRAINT `_LocaleStringLabels_B_fkey` FOREIGN KEY (`B`) REFERENCES `locale_strings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
