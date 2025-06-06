/*
  Warnings:

  - You are about to drop the column `brandCode` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `brandName` on the `Branch` table. All the data in the column will be lost.
  - Added the required column `branchName` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "brandCode",
DROP COLUMN "brandName",
ADD COLUMN     "branchCode" TEXT,
ADD COLUMN     "branchName" TEXT NOT NULL;
