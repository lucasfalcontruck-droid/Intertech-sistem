import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      { name: 'Base Líquida Matte', sku: 'COS-001', category: 'Face', price: 79.9, stock: 32, minStock: 10 },
      { name: 'Batom Hidratante', sku: 'COS-002', category: 'Lips', price: 39.9, stock: 48, minStock: 12 },
      { name: 'Pó Compacto', sku: 'COS-003', category: 'Face', price: 54.9, stock: 26, minStock: 8 },
      { name: 'Máscara para Cílios', sku: 'COS-004', category: 'Olhos', price: 59.9, stock: 40, minStock: 10 },
      { name: 'Serum Facial Vitamina C', sku: 'COS-005', category: 'Skincare', price: 89.9, stock: 18, minStock: 6 },
    ],
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
