-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "storeId" TEXT;

-- DropTable
DROP TABLE "PlatformIntegration";

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "storeName" TEXT NOT NULL,
    "externalId" TEXT,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "feePercentage" DECIMAL(5,2) NOT NULL,
    "credentials" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Store_platform_idx" ON "Store"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "Store_platform_externalId_key" ON "Store"("platform", "externalId");

-- CreateIndex
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

