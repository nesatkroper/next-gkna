/*
  Warnings:

  - You are about to drop the column `address` on the `Supplier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supplierId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "supplierId" UUID;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "address";

-- CreateIndex
CREATE UNIQUE INDEX "Address_supplierId_key" ON "Address"("supplierId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE SET NULL ON UPDATE CASCADE;
