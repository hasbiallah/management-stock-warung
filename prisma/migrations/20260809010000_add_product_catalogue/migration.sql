-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `sellingPrice` DECIMAL(14, 2) NOT NULL,
    `minimumStock` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    CONSTRAINT `Product_sellingPrice_nonnegative_check` CHECK (`sellingPrice` >= 0),
    CONSTRAINT `Product_minimumStock_nonnegative_check` CHECK (`minimumStock` >= 0)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovement` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `type` ENUM('MASUK', 'KELUAR', 'OPNAME') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `quantityAfter` INTEGER NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    CONSTRAINT `StockMovement_quantity_nonnegative_check` CHECK (`quantity` >= 0),
    CONSTRAINT `StockMovement_quantityAfter_nonnegative_check` CHECK (`quantityAfter` IS NULL OR `quantityAfter` >= 0),
    CONSTRAINT `StockMovement_type_fields_check` CHECK (
      (`type` = 'OPNAME' AND `quantityAfter` IS NOT NULL AND `reason` IS NOT NULL AND CHAR_LENGTH(TRIM(`reason`)) > 0)
      OR (`type` IN ('MASUK', 'KELUAR') AND `quantityAfter` IS NULL AND `reason` IS NULL)
    )
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_active_name_idx` ON `Product`(`active`, `name`);

-- CreateIndex
CREATE INDEX `StockMovement_productId_createdAt_idx` ON `StockMovement`(`productId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
