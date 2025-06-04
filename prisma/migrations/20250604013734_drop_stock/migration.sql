/*
  Warnings:

  - The `capacity` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stockentry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_productId_fkey";

-- DropForeignKey
ALTER TABLE "Stockentry" DROP CONSTRAINT "Stockentry_productId_fkey";

-- DropForeignKey
ALTER TABLE "Stockentry" DROP CONSTRAINT "Stockentry_supplierId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "capacity",
ADD COLUMN     "capacity" DECIMAL(10,2) DEFAULT 0.00;

-- DropTable
DROP TABLE "Stock";

-- DropTable
DROP TABLE "Stockentry";

-- CreateTable
CREATE TABLE "Entry" (
    "entryId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "entryPrice" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "entryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "invoice" TEXT,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("entryId")
);

-- CreateIndex
CREATE INDEX "Entry_productId_supplierId_status_entryDate_idx" ON "Entry"("productId", "supplierId", "status", "entryDate");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;
