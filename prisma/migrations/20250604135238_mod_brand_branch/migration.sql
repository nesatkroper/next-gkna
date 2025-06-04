-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "brandId" UUID;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brandId" UUID;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Branch"("brandId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("brandId") ON DELETE SET NULL ON UPDATE CASCADE;
