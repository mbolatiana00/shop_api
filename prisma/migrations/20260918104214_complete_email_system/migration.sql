-- AlterTable
ALTER TABLE `Restaurant` ADD COLUMN `email` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `EmailVerificationToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmailVerificationToken_tokenHash_key`(`tokenHash`),
    INDEX `EmailVerificationToken_userId_idx`(`userId`),
    INDEX `EmailVerificationToken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    INDEX `PasswordResetToken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Email` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('WELCOME', 'OTP', 'EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'ACCOUNT_VERIFIED', 'LOGIN_ALERT', 'ORDER_RECEIVED', 'ORDER_CONFIRMED', 'ORDER_PREPARING', 'ORDER_READY', 'ORDER_PICKED_UP', 'ORDER_IN_TRANSIT', 'ORDER_DELIVERED', 'ORDER_CANCELED', 'DRIVER_ASSIGNED', 'DELIVERY_STARTED', 'DRIVER_NEARBY', 'DELIVERY_COMPLETED', 'DELIVERY_FAILED', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PAYMENT_RECEIPT', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'PROMOTION', 'COUPON', 'SPECIAL_OFFER', 'PROFILE_UPDATED', 'PHONE_CHANGED', 'EMAIL_CHANGED', 'RESTAURANT_ORDER_RECEIVED', 'RESTAURANT_ORDER_CONFIRMED', 'RESTAURANT_ORDER_CANCELED', 'DRIVER_NEW_DELIVERY', 'DRIVER_DELIVERY_CANCELED', 'ADMIN_NEW_USER', 'ADMIN_NEW_ORDER', 'ADMIN_PAYMENT_ALERT', 'SYSTEM_NOTIFICATION') NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `recipient` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `messageId` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `errorMessage` TEXT NULL,
    `userId` INTEGER NULL,
    `orderId` INTEGER NULL,
    `paymentId` INTEGER NULL,
    `deliveryId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Email_userId_idx`(`userId`),
    INDEX `Email_orderId_idx`(`orderId`),
    INDEX `Email_paymentId_idx`(`paymentId`),
    INDEX `Email_deliveryId_idx`(`deliveryId`),
    INDEX `Email_type_idx`(`type`),
    INDEX `Email_status_idx`(`status`),
    INDEX `Email_recipient_idx`(`recipient`),
    INDEX `Email_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `OtpToken_expiresAt_idx` ON `OtpToken`(`expiresAt`);

-- CreateIndex
CREATE INDEX `OtpToken_userId_used_idx` ON `OtpToken`(`userId`, `used`);

-- CreateIndex
CREATE INDEX `Restaurant_email_idx` ON `Restaurant`(`email`);

-- AddForeignKey
ALTER TABLE `EmailVerificationToken` ADD CONSTRAINT `EmailVerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
