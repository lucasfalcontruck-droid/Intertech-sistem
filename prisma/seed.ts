import {
  PrismaClient,
  Platform,
  OrderStatus,
  TransactionType,
  TransactionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { DRE_EXPENSE_CATEGORIES } from "../lib/constants";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Distributes an integer total across buckets proportional to `weights`, exact sum guaranteed. */
function distributeInt(total: number, weights: number[]): number[] {
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sumW) * total);
  const floors = raw.map(Math.floor);
  const remainder = total - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => ({ i, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) {
    floors[order[k % order.length].i] += 1;
  }
  return floors;
}

/** Splits a monetary `target` across `count` positive values (2 decimals), exact sum guaranteed. */
function splitAmount(count: number, target: number): number[] {
  const weights = Array.from({ length: count }, () => 0.4 + Math.random() * 1.2);
  const sumW = weights.reduce((a, b) => a + b, 0);
  const rounded = weights.map((w) => Math.round((w / sumW) * target * 100) / 100);
  const diff = Math.round((target - rounded.reduce((a, b) => a + b, 0)) * 100) / 100;
  rounded[rounded.length - 1] = Math.round((rounded[rounded.length - 1] + diff) * 100) / 100;
  return rounded;
}

function randomDateBetween(start: Date, end: Date): Date {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const FIRST_NAMES = [
  "Marina",
  "Bruna",
  "Carla",
  "Camila",
  "Fernanda",
  "Juliana",
  "Larissa",
  "Patrícia",
  "Rafaela",
  "Vanessa",
  "Beatriz",
  "Gabriela",
  "Aline",
  "Débora",
  "Tatiane",
  "Rafael",
  "Diego",
  "Bruno",
  "Lucas",
  "Thiago",
  "Eduardo",
  "Felipe",
  "Gustavo",
  "Marcelo",
  "André",
  "Vinícius",
  "Rodrigo",
  "Leonardo",
  "Pedro",
  "Gabriel",
];
const LAST_NAMES = [
  "Souza",
  "Lima",
  "Alves",
  "Martins",
  "Nunes",
  "Oliveira",
  "Costa",
  "Pereira",
  "Ferreira",
  "Rodrigues",
  "Almeida",
  "Carvalho",
  "Gomes",
  "Ribeiro",
  "Barbosa",
  "Cardoso",
  "Teixeira",
  "Moreira",
  "Araújo",
  "Correia",
];

function randomCustomerName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function randomOrderStatus(createdAt: Date): OrderStatus {
  const hoursAgo = (Date.now() - createdAt.getTime()) / 36e5;
  const roll = Math.random();
  if (hoursAgo < 24) {
    if (roll < 0.4) return OrderStatus.PROCESSANDO;
    if (roll < 0.75) return OrderStatus.ENVIADO;
    return OrderStatus.ENTREGUE;
  }
  if (roll < 0.02) return OrderStatus.CANCELADO;
  if (roll < 0.12) return OrderStatus.PROCESSANDO;
  if (roll < 0.3) return OrderStatus.ENVIADO;
  return OrderStatus.ENTREGUE;
}

// ---------------------------------------------------------------------------
// Static reference data (matches spec section 5)
// ---------------------------------------------------------------------------

const PLATFORM_INTEGRATIONS: {
  platform: Platform;
  storeName: string;
  feePercentage: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  weeklyRevenue: [number, number, number, number];
}[] = [
  {
    platform: Platform.MERCADO_LIVRE,
    storeName: "intertech.oficial",
    feePercentage: 14.5,
    monthlyRevenue: 218_400,
    monthlyOrders: 1428,
    weeklyRevenue: [52_000, 58_000, 54_000, 54_400],
  },
  {
    platform: Platform.SHOPEE,
    storeName: "Intertech Store BR",
    feePercentage: 16,
    monthlyRevenue: 155_600,
    monthlyOrders: 2014,
    weeklyRevenue: [36_000, 39_000, 40_500, 40_100],
  },
  {
    platform: Platform.TIKTOK_SHOP,
    storeName: "@intertech.br",
    feePercentage: 10,
    monthlyRevenue: 112_200,
    monthlyOrders: 986,
    weeklyRevenue: [24_000, 27_500, 29_200, 31_500],
  },
];

// 6-month history for the cash-flow chart (Feb..Jun); current month (Jul) is derived live.
const CASH_FLOW_HISTORY = [
  { monthsAgo: 5, entradas: 368_000, saidas: 251_000 },
  { monthsAgo: 4, entradas: 392_000, saidas: 268_000 },
  { monthsAgo: 3, entradas: 410_000, saidas: 279_000 },
  { monthsAgo: 2, entradas: 435_000, saidas: 296_000 },
  { monthsAgo: 1, entradas: 461_000, saidas: 305_000 },
];

type SeedProduct = {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  channels: Platform[];
};

const PRODUCTS: SeedProduct[] = [
  // Eletrônicos
  {
    name: "Fone Bluetooth X200",
    sku: "SKU-1042",
    category: "Eletrônicos",
    price: 89.9,
    stock: 4,
    minStock: 15,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE],
  },
  {
    name: "Carregador USB-C 20W",
    sku: "SKU-0871",
    category: "Eletrônicos",
    price: 49.9,
    stock: 0,
    minStock: 25,
    channels: [Platform.TIKTOK_SHOP],
  },
  {
    name: "Mouse Sem Fio Slim",
    sku: "SKU-4410",
    category: "Eletrônicos",
    price: 59.9,
    stock: 142,
    minStock: 30,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Power Bank 10.000mAh",
    sku: "SKU-5521",
    category: "Eletrônicos",
    price: 99.0,
    stock: 88,
    minStock: 20,
    channels: [Platform.MERCADO_LIVRE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Caixa de Som Bluetooth Mini",
    sku: "SKU-6001",
    category: "Eletrônicos",
    price: 119.9,
    stock: 56,
    minStock: 20,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE],
  },
  {
    name: "Smartwatch Fit Pro",
    sku: "SKU-6002",
    category: "Eletrônicos",
    price: 249.9,
    stock: 5,
    minStock: 12,
    channels: [Platform.MERCADO_LIVRE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Fone de Ouvido com Fio P2",
    sku: "SKU-6003",
    category: "Eletrônicos",
    price: 24.9,
    stock: 210,
    minStock: 40,
    channels: [Platform.SHOPEE],
  },
  {
    name: "Carregador Veicular Turbo",
    sku: "SKU-6004",
    category: "Eletrônicos",
    price: 39.9,
    stock: 0,
    minStock: 15,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Cabo USB-C 1m",
    sku: "SKU-6005",
    category: "Eletrônicos",
    price: 19.9,
    stock: 320,
    minStock: 60,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Adaptador HDMI",
    sku: "SKU-6006",
    category: "Eletrônicos",
    price: 44.9,
    stock: 18,
    minStock: 20,
    channels: [Platform.SHOPEE],
  },
  // Acessórios
  {
    name: "Capa iPhone 14",
    sku: "SKU-2210",
    category: "Acessórios",
    price: 34.9,
    stock: 7,
    minStock: 20,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Capa Samsung S23",
    sku: "SKU-6007",
    category: "Acessórios",
    price: 32.9,
    stock: 64,
    minStock: 20,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE],
  },
  {
    name: "Película de Vidro Universal",
    sku: "SKU-6008",
    category: "Acessórios",
    price: 14.9,
    stock: 480,
    minStock: 100,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Pulseira Smartwatch Silicone",
    sku: "SKU-6009",
    category: "Acessórios",
    price: 29.9,
    stock: 3,
    minStock: 15,
    channels: [Platform.TIKTOK_SHOP],
  },
  {
    name: "Anel Pop Socket",
    sku: "SKU-6010",
    category: "Acessórios",
    price: 12.9,
    stock: 0,
    minStock: 30,
    channels: [Platform.SHOPEE],
  },
  {
    name: "Óculos de Sol Esportivo",
    sku: "SKU-6011",
    category: "Acessórios",
    price: 69.9,
    stock: 41,
    minStock: 15,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Bolsa Transversal Impermeável",
    sku: "SKU-6012",
    category: "Acessórios",
    price: 89.9,
    stock: 22,
    minStock: 10,
    channels: [Platform.SHOPEE, Platform.TIKTOK_SHOP],
  },
  // Casa
  {
    name: "Suporte para Notebook",
    sku: "SKU-3305",
    category: "Casa",
    price: 79.0,
    stock: 3,
    minStock: 10,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE],
  },
  {
    name: "Luminária LED de Mesa",
    sku: "SKU-6013",
    category: "Casa",
    price: 64.9,
    stock: 27,
    minStock: 12,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Organizador de Cabos",
    sku: "SKU-6014",
    category: "Casa",
    price: 22.9,
    stock: 95,
    minStock: 25,
    channels: [Platform.SHOPEE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Umidificador de Ar Compacto",
    sku: "SKU-6015",
    category: "Casa",
    price: 89.9,
    stock: 9,
    minStock: 12,
    channels: [Platform.MERCADO_LIVRE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Kit Ferramentas Multiuso",
    sku: "SKU-6016",
    category: "Casa",
    price: 54.9,
    stock: 33,
    minStock: 15,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Tapete Antiderrapante Cozinha",
    sku: "SKU-6017",
    category: "Casa",
    price: 39.9,
    stock: 0,
    minStock: 10,
    channels: [Platform.SHOPEE],
  },
  // Informática
  {
    name: "Teclado Mecânico Compacto",
    sku: "SKU-6018",
    category: "Informática",
    price: 189.9,
    stock: 31,
    minStock: 15,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE],
  },
  {
    name: "Webcam Full HD",
    sku: "SKU-6019",
    category: "Informática",
    price: 129.9,
    stock: 14,
    minStock: 15,
    channels: [Platform.MERCADO_LIVRE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Hub USB-C 6 em 1",
    sku: "SKU-6020",
    category: "Informática",
    price: 99.9,
    stock: 47,
    minStock: 20,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Mousepad Gamer XL",
    sku: "SKU-6021",
    category: "Informática",
    price: 44.9,
    stock: 63,
    minStock: 20,
    channels: [Platform.SHOPEE, Platform.TIKTOK_SHOP],
  },
  {
    name: "SSD Externo 480GB",
    sku: "SKU-6022",
    category: "Informática",
    price: 219.9,
    stock: 6,
    minStock: 15,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Suporte Ergonômico para Monitor",
    sku: "SKU-6023",
    category: "Informática",
    price: 109.9,
    stock: 19,
    minStock: 10,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE],
  },
  // Outros
  {
    name: "Garrafa Térmica Inox 1L",
    sku: "SKU-6024",
    category: "Outros",
    price: 59.9,
    stock: 72,
    minStock: 20,
    channels: [Platform.MERCADO_LIVRE, Platform.SHOPEE, Platform.TIKTOK_SHOP],
  },
  {
    name: "Mochila Executiva Impermeável",
    sku: "SKU-6025",
    category: "Outros",
    price: 149.9,
    stock: 24,
    minStock: 10,
    channels: [Platform.MERCADO_LIVRE],
  },
  {
    name: "Kit Academia Elásticos",
    sku: "SKU-6026",
    category: "Outros",
    price: 49.9,
    stock: 8,
    minStock: 15,
    channels: [Platform.SHOPEE],
  },
  {
    name: "Relógio Digital Esportivo",
    sku: "SKU-6027",
    category: "Outros",
    price: 79.9,
    stock: 38,
    minStock: 15,
    channels: [Platform.TIKTOK_SHOP],
  },
  {
    name: "Power Bank Solar 20.000mAh",
    sku: "SKU-6028",
    category: "Outros",
    price: 159.9,
    stock: 0,
    minStock: 10,
    channels: [Platform.MERCADO_LIVRE, Platform.TIKTOK_SHOP],
  },
];

const DRE_CATEGORIES: {
  category: (typeof DRE_EXPENSE_CATEGORIES)[number];
  description: string;
  amount: number;
}[] = [
  {
    category: "Taxas de marketplace",
    description: "Taxas de marketplace — período",
    amount: 68_480,
  },
  {
    category: "Custo dos produtos vendidos",
    description: "Custo dos produtos vendidos (CPV)",
    amount: 152_300,
  },
  { category: "Impostos", description: "Impostos sobre vendas", amount: 34_100 },
  {
    category: "Despesas operacionais",
    description: "Despesas operacionais — período",
    amount: 64_060,
  },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productChannel.deleteMany();
  await prisma.product.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.platformIntegration.deleteMany();
  await prisma.user.deleteMany();

  console.log("Criando usuário administrador...");
  const passwordHash = await bcrypt.hash("intertech123", 10);
  await prisma.user.create({
    data: {
      name: "Lucas Falcon",
      email: "admin@intertech.com",
      passwordHash,
      role: "Administrador",
    },
  });

  console.log("Criando integrações de marketplace...");
  for (const integ of PLATFORM_INTEGRATIONS) {
    await prisma.platformIntegration.create({
      data: {
        platform: integ.platform,
        storeName: integ.storeName,
        status: "CONNECTED",
        feePercentage: integ.feePercentage,
        lastSyncedAt: randomDateBetween(daysAgo(1), new Date()),
        credentials: { apiKey: "mock-key", note: "Integração simulada — sem chamadas reais." },
      },
    });
  }

  console.log("Criando produtos e canais...");
  const createdProducts: { id: string; sku: string; category: string; price: number }[] = [];
  const productBySku = new Map<string, { id: string; category: string; price: number }>();
  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        channels: {
          create: p.channels.map((platform) => ({ platform })),
        },
      },
    });
    const info = { id: product.id, category: p.category, price: p.price };
    createdProducts.push({ ...info, sku: p.sku });
    productBySku.set(p.sku, info);
  }

  const productsByPlatform: Record<Platform, { id: string }[]> = {
    MERCADO_LIVRE: [],
    SHOPEE: [],
    TIKTOK_SHOP: [],
  };
  for (const p of PRODUCTS) {
    const created = productBySku.get(p.sku);
    if (!created) continue;
    for (const platform of p.channels) {
      productsByPlatform[platform].push({ id: created.id });
    }
  }

  console.log("Gerando pedidos dos últimos 30 dias (isso pode levar alguns segundos)...");
  const now = new Date();
  type PendingOrder = {
    id: string;
    customerName: string;
    platform: Platform;
    total: number;
    createdAt: Date;
  };
  const pendingOrders: PendingOrder[] = [];

  const WEEKS = 4;
  const weekBounds = Array.from({ length: WEEKS }, (_, i) => {
    const end = daysAgo(((WEEKS - 1 - i) * 30) / WEEKS);
    const start = daysAgo(((WEEKS - i) * 30) / WEEKS);
    return { start, end };
  });
  weekBounds[weekBounds.length - 1].end = now;

  for (const integ of PLATFORM_INTEGRATIONS) {
    const weekOrderCounts = distributeInt(
      integ.monthlyOrders,
      integ.weeklyRevenue as unknown as number[],
    );

    for (let w = 0; w < WEEKS; w++) {
      const count = weekOrderCounts[w];
      const revenueTarget = integ.weeklyRevenue[w];
      const amounts = splitAmount(count, revenueTarget);
      const { start, end } = weekBounds[w];

      for (let i = 0; i < count; i++) {
        pendingOrders.push({
          id: randomUUID(),
          customerName: randomCustomerName(),
          platform: integ.platform,
          total: amounts[i],
          createdAt: randomDateBetween(start, end),
        });
      }
    }
  }

  pendingOrders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const orderNumbers = pendingOrders.map((_, idx) => String(78421 + idx));

  const orderCreateData = pendingOrders.map((o, idx) => ({
    id: o.id,
    number: orderNumbers[idx],
    customerName: o.customerName,
    platform: o.platform,
    total: o.total,
    status: randomOrderStatus(o.createdAt),
    createdAt: o.createdAt,
  }));

  const ORDER_CHUNK = 1000;
  for (let i = 0; i < orderCreateData.length; i += ORDER_CHUNK) {
    await prisma.order.createMany({ data: orderCreateData.slice(i, i + ORDER_CHUNK) });
  }

  console.log(`Criados ${orderCreateData.length} pedidos. Gerando itens dos pedidos...`);

  const orderItemsData: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
  }[] = [];

  for (const order of orderCreateData) {
    const eligible = productsByPlatform[order.platform];
    if (eligible.length === 0) continue;
    const itemCount = randomInt(1, 3);
    for (let i = 0; i < itemCount; i++) {
      const product = pick(eligible);
      const productInfo = createdProducts.find((cp) => cp.id === product.id)!;
      orderItemsData.push({
        id: randomUUID(),
        orderId: order.id,
        productId: product.id,
        quantity: randomInt(1, 4),
        unitPrice: productInfo.price,
      });
    }
  }

  const ITEM_CHUNK = 2000;
  for (let i = 0; i < orderItemsData.length; i += ITEM_CHUNK) {
    await prisma.orderItem.createMany({ data: orderItemsData.slice(i, i + ITEM_CHUNK) });
  }

  console.log(`Criados ${orderItemsData.length} itens de pedido.`);

  console.log("Criando lançamentos financeiros...");

  // Contas a receber (mockup-exact rows)
  await prisma.financialTransaction.createMany({
    data: [
      {
        type: TransactionType.ENTRADA,
        description: "Repasse Mercado Livre",
        category: "Repasse Marketplace",
        amount: 54_200,
        dueDate: daysFromNow(2),
        status: TransactionStatus.PENDENTE,
      },
      {
        type: TransactionType.ENTRADA,
        description: "Repasse Shopee",
        category: "Repasse Marketplace",
        amount: 38_900,
        dueDate: daysFromNow(4),
        status: TransactionStatus.PENDENTE,
      },
      {
        type: TransactionType.ENTRADA,
        description: "Repasse TikTok Shop",
        category: "Repasse Marketplace",
        amount: 27_100,
        dueDate: daysFromNow(7),
        status: TransactionStatus.PENDENTE,
      },
      {
        type: TransactionType.ENTRADA,
        description: "Venda B2B — Cliente Atacado",
        category: "Venda B2B",
        amount: 12_500,
        dueDate: daysFromNow(12),
        status: TransactionStatus.PENDENTE,
      },
    ],
  });

  // Contas a pagar (mockup-exact rows)
  await prisma.financialTransaction.createMany({
    data: [
      {
        type: TransactionType.SAIDA,
        description: "Fornecedor — Eletrônicos SP",
        category: "Fornecedores",
        amount: 62_400,
        dueDate: daysFromNow(1),
        status: TransactionStatus.A_VENCER,
      },
      {
        type: TransactionType.SAIDA,
        description: "Frete e logística",
        category: "Logística",
        amount: 18_750,
        dueDate: daysFromNow(3),
        status: TransactionStatus.A_VENCER,
      },
      {
        type: TransactionType.SAIDA,
        description: "Folha de pagamento",
        category: "Pessoal",
        amount: 41_200,
        dueDate: daysFromNow(9),
        status: TransactionStatus.PENDENTE,
      },
      {
        type: TransactionType.SAIDA,
        description: "Impostos (Simples Nacional)",
        category: "Simples Nacional",
        amount: 22_900,
        dueDate: daysAgo(1),
        status: TransactionStatus.PAGO,
        paidAt: daysAgo(1),
      },
    ],
  });

  // DRE buckets — drive "Despesas do mês" and the simplified DRE report.
  await prisma.financialTransaction.createMany({
    data: DRE_CATEGORIES.map((c) => ({
      type: TransactionType.SAIDA,
      description: c.description,
      category: c.category,
      amount: c.amount,
      dueDate: randomDateBetween(daysAgo(28), daysAgo(1)),
      status: TransactionStatus.PAGO,
      paidAt: randomDateBetween(daysAgo(28), daysAgo(1)),
    })),
  });

  // 6-month cash flow history (Feb..Jun) — settled lump sums for the chart.
  for (const month of CASH_FLOW_HISTORY) {
    const ref = new Date();
    ref.setMonth(ref.getMonth() - month.monthsAgo, 15);
    await prisma.financialTransaction.create({
      data: {
        type: TransactionType.ENTRADA,
        description: `Vendas consolidadas — ${ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
        category: "Vendas",
        amount: month.entradas,
        dueDate: ref,
        status: TransactionStatus.PAGO,
        paidAt: ref,
        createdAt: ref,
      },
    });
    await prisma.financialTransaction.create({
      data: {
        type: TransactionType.SAIDA,
        description: `Despesas consolidadas — ${ref.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
        category: "Despesas consolidadas",
        amount: month.saidas,
        dueDate: ref,
        status: TransactionStatus.PAGO,
        paidAt: ref,
        createdAt: ref,
      },
    });
  }

  // Current month's settled cash inflow, mirroring the live order revenue total
  // (218_400 + 155_600 + 112_200), so "Saldo em caixa" reflects real cash received.
  const currentMonthRevenue = PLATFORM_INTEGRATIONS.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  await prisma.financialTransaction.create({
    data: {
      type: TransactionType.ENTRADA,
      description: `Vendas consolidadas — ${now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
      category: "Vendas",
      amount: currentMonthRevenue,
      dueDate: now,
      status: TransactionStatus.PAGO,
      paidAt: now,
    },
  });

  console.log("Seed concluído com sucesso.");
  console.log("Login: admin@intertech.com / intertech123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
