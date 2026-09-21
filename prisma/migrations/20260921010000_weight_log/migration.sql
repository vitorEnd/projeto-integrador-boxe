CREATE TABLE `WeightLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `weightKg` DOUBLE NOT NULL,
    `recordedOn` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WeightLog_userId_recordedOn_key`(`userId`, `recordedOn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `WeightLog` ADD CONSTRAINT `WeightLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `WeightLog` (`userId`, `weightKg`, `recordedOn`)
SELECT `userId`, `weightKg`, DATE(`createdAt`) FROM `Profile`;
