-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_hash_key`(`token_hash`),
    INDEX `sessions_user_id_expires_at_idx`(`user_id`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('BUILD', 'QUIT') NOT NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `habits_user_id_status_created_at_idx`(`user_id`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habit_periods` (
    `id` CHAR(36) NOT NULL,
    `habit_id` CHAR(36) NOT NULL,
    `started_on` DATE NOT NULL,
    `ended_on` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT `habit_periods_date_order_check` CHECK (`ended_on` IS NULL OR `ended_on` >= `started_on`),

    INDEX `habit_periods_habit_id_started_on_idx`(`habit_id`, `started_on`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `build_completions` (
    `id` CHAR(36) NOT NULL,
    `habit_id` CHAR(36) NOT NULL,
    `completed_on` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `build_completions_habit_id_completed_on_key`(`habit_id`, `completed_on`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relapses` (
    `id` CHAR(36) NOT NULL,
    `habit_id` CHAR(36) NOT NULL,
    `relapsed_on` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `relapses_habit_id_relapsed_on_key`(`habit_id`, `relapsed_on`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goals` (
    `id` CHAR(36) NOT NULL,
    `habit_id` CHAR(36) NOT NULL,
    `target_days` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
    `active_slot` TINYINT NULL,
    `achieved_at` DATETIME(3) NULL,
    `removed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    CONSTRAINT `goals_target_days_positive_check` CHECK (`target_days` > 0),
    CONSTRAINT `goals_active_slot_value_check` CHECK (`active_slot` IS NULL OR `active_slot` = 1),

    INDEX `goals_habit_id_status_idx`(`habit_id`, `status`),
    UNIQUE INDEX `goals_habit_id_active_slot_key`(`habit_id`, `active_slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habits` ADD CONSTRAINT `habits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habit_periods` ADD CONSTRAINT `habit_periods_habit_id_fkey` FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `build_completions` ADD CONSTRAINT `build_completions_habit_id_fkey` FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relapses` ADD CONSTRAINT `relapses_habit_id_fkey` FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goals` ADD CONSTRAINT `goals_habit_id_fkey` FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
