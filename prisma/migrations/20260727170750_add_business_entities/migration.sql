-- CreateEnum
CREATE TYPE "FornecedorTipo" AS ENUM ('INSUMO', 'PRODUTO');

-- CreateEnum
CREATE TYPE "PedidoCompraStatus" AS ENUM ('AGUARDANDO', 'EM_TRANSITO', 'RECEBIDO');

-- CreateEnum
CREATE TYPE "CustoTipo" AS ENUM ('FIXO', 'VARIAVEL');

-- CreateEnum
CREATE TYPE "InsumoMovimentoTipo" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateEnum
CREATE TYPE "DevolucaoStatus" AS ENUM ('SOLICITADA', 'EM_ANALISE', 'APROVADA', 'REEMBOLSADA');

-- CreateEnum
CREATE TYPE "CampanhaStatus" AS ENUM ('ATIVA', 'PAUSADA', 'ENCERRADA');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "adViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "costPrice" DECIMAL(10,2),
ADD COLUMN     "location" TEXT;

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tipo" "FornecedorTipo" NOT NULL,
    "contact" TEXT NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoCompra" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "tipo" "FornecedorTipo" NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "status" "PedidoCompraStatus" NOT NULL DEFAULT 'AGUARDANDO',
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tipo" "CustoTipo" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insumo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'un',
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsumoMovimento" (
    "id" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "tipo" "InsumoMovimentoTipo" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notaFiscal" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsumoMovimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devolucao" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT,
    "product" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "status" "DevolucaoStatus" NOT NULL DEFAULT 'SOLICITADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "dailyBudget" DECIMAL(10,2) NOT NULL,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "status" "CampanhaStatus" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "Fornecedor_tipo_idx" ON "Fornecedor"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoCompra_number_key" ON "PedidoCompra"("number");

-- CreateIndex
CREATE INDEX "PedidoCompra_tipo_idx" ON "PedidoCompra"("tipo");

-- CreateIndex
CREATE INDEX "PedidoCompra_status_idx" ON "PedidoCompra"("status");

-- CreateIndex
CREATE INDEX "CustoItem_tipo_idx" ON "CustoItem"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Insumo_name_key" ON "Insumo"("name");

-- CreateIndex
CREATE INDEX "InsumoMovimento_insumoId_idx" ON "InsumoMovimento"("insumoId");

-- CreateIndex
CREATE INDEX "Devolucao_status_idx" ON "Devolucao"("status");

-- AddForeignKey
ALTER TABLE "PedidoCompra" ADD CONSTRAINT "PedidoCompra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsumoMovimento" ADD CONSTRAINT "InsumoMovimento_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
