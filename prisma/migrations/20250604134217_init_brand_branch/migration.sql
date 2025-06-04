-- CreateTable
CREATE TABLE "Brand" (
    "brandId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandName" TEXT NOT NULL,
    "picture" TEXT,
    "brandCode" TEXT,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("brandId")
);

-- CreateTable
CREATE TABLE "Branch" (
    "brandId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brandName" TEXT NOT NULL,
    "brandCode" TEXT,
    "picture" TEXT,
    "tel" TEXT,
    "memo" TEXT,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("brandId")
);
