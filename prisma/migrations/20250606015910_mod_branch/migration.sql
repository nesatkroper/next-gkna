/*
  Warnings:

  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `brandId` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `brandId` on the `Employee` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_brandId_fkey";

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
DROP COLUMN "brandId",
ADD COLUMN     "branchId" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("branchId");

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "brandId",
ADD COLUMN     "branchId" UUID;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("branchId") ON DELETE SET NULL ON UPDATE CASCADE;
