/*
  Warnings:

  - Added the required column `branchId` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Sale_customerId_employeeId_saleDate_status_idx";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "branchId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Sale_customerId_employeeId_saleDate_status_branchId_idx" ON "Sale"("customerId", "employeeId", "saleDate", "status", "branchId");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE RESTRICT ON UPDATE CASCADE;
