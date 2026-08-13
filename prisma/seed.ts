import {
  PrismaClient,
  Platform,
  OrderStatus,
  TransactionType,
  TransactionStatus,
  FornecedorTipo,
  PedidoCompraStatus,
  CustoTipo,
  InsumoMovimentoTipo,
  DevolucaoStatus,
  CampanhaStatus,
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

const STATE_WEIGHTS: [string, number][] = [
  ["SP", 45],
  ["RJ", 15],
  ["MG", 12],
  ["RS", 8],
  ["PR", 7],
  ["BA", 5],
  ["SC", 4],
  ["GO", 2],
  ["PE", 1.5],
  ["CE", 1.5],
];

function randomState(): string {
  const totalWeight = STATE_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * totalWeight;
  for (const [state, weight] of STATE_WEIGHTS) {
    if (roll < weight) return state;
    roll -= weight;
  }
  return STATE_WEIGHTS[0][0];
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

// Cada plataforma pode ter mais de uma loja/conta conectada (CNPJs diferentes).
// Os valores de cada dupla somam exatamente o total que a plataforma tinha antes
// (ex.: as duas lojas do Mercado Livre somam os mesmos 218_400 / 1428 pedidos).
const STORES: {
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
    monthlyRevenue: 141_900,
    monthlyOrders: 928,
    weeklyRevenue: [34_000, 37_500, 35_000, 35_400],
  },
  {
    platform: Platform.MERCADO_LIVRE,
    storeName: "intertech.outlet",
    feePercentage: 14.5,
    monthlyRevenue: 76_500,
    monthlyOrders: 500,
    weeklyRevenue: [18_000, 20_500, 19_000, 19_000],
  },
  {
    platform: Platform.SHOPEE,
    storeName: "Intertech Store BR",
    feePercentage: 16,
    monthlyRevenue: 85_600,
    monthlyOrders: 1108,
    weeklyRevenue: [19_800, 21_500, 22_300, 22_000],
  },
  {
    platform: Platform.SHOPEE,
    storeName: "Intertech Store Sul",
    feePercentage: 16,
    monthlyRevenue: 70_000,
    monthlyOrders: 906,
    weeklyRevenue: [16_200, 17_500, 18_200, 18_100],
  },
  {
    platform: Platform.TIKTOK_SHOP,
    storeName: "@intertech.br",
    feePercentage: 10,
    monthlyRevenue: 78_600,
    monthlyOrders: 690,
    weeklyRevenue: [16_800, 19_300, 20_500, 22_000],
  },
  {
    platform: Platform.TIKTOK_SHOP,
    storeName: "@intertech.promo",
    feePercentage: 10,
    monthlyRevenue: 33_600,
    monthlyOrders: 296,
    weeklyRevenue: [7_200, 8_200, 8_700, 9_500],
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
  await prisma.store.deleteMany();
  await prisma.pedidoCompra.deleteMany();
  await prisma.fornecedor.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.custoItem.deleteMany();
  await prisma.insumoMovimento.deleteMany();
  await prisma.insumo.deleteMany();
  await prisma.devolucao.deleteMany();
  await prisma.campanha.deleteMany();
  await prisma.user.deleteMany();

  console.log("Criando usuários...");
  const passwordHash = await bcrypt.hash("intertech123", 10);

  await prisma.user.create({
    data: {
      name: "Lucas Falcon",
      email: "admin@intertech.com",
      passwordHash,
      role: "Administrador",
    },
  });

  console.log("Criando lojas conectadas (uma ou mais por plataforma)...");
  const storeIds = new Map<string, string>(); // storeName -> id
  for (const s of STORES) {
    const created = await prisma.store.create({
      data: {
        platform: s.platform,
        storeName: s.storeName,
        status: "CONNECTED",
        feePercentage: s.feePercentage,
        lastSyncedAt: randomDateBetween(daysAgo(1), new Date()),
        credentials: { apiKey: "mock-key", note: "Integração simulada — sem chamadas reais." },
      },
    });
    storeIds.set(s.storeName, created.id);
  }

  console.log("Criando produtos e canais...");
  const WAREHOUSES = ["Galpão A", "Galpão B"];
  const createdProducts: { id: string; sku: string; category: string; price: number }[] = [];
  const productBySku = new Map<string, { id: string; category: string; price: number }>();
  for (const p of PRODUCTS) {
    const hasCostPrice = Math.random() < 0.8;
    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        costPrice: hasCostPrice ? Math.round(p.price * (0.5 + Math.random() * 0.15) * 100) / 100 : null,
        location: `${pick(WAREHOUSES)} - Prateleira ${randomInt(1, 8)}`,
        adViews: randomInt(300, 9000),
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
    // Vendedor de Rua não recebe pedidos fictícios no seed — só pedidos reais,
    // criados de verdade pelo app do vendedor via app/api/integrations/vendedor.
    VENDEDOR_RUA: [],
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
    storeId: string;
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

  for (const s of STORES) {
    const storeId = storeIds.get(s.storeName)!;
    const weekOrderCounts = distributeInt(s.monthlyOrders, s.weeklyRevenue as unknown as number[]);

    for (let w = 0; w < WEEKS; w++) {
      const count = weekOrderCounts[w];
      const revenueTarget = s.weeklyRevenue[w];
      const amounts = splitAmount(count, revenueTarget);
      const { start, end } = weekBounds[w];

      for (let i = 0; i < count; i++) {
        pendingOrders.push({
          id: randomUUID(),
          customerName: randomCustomerName(),
          platform: s.platform,
          storeId,
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
    storeId: o.storeId,
    state: randomState(),
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
  const currentMonthRevenue = STORES.reduce((sum, s) => sum + s.monthlyRevenue, 0);
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

  console.log("Criando clientes...");
  await prisma.cliente.createMany({
    data: [
      { name: "Mariana Andrade", email: "mariana.andrade@gmail.com", phone: "(11) 98452-1290", city: "São Paulo", state: "SP" },
      { name: "Rafael Nascimento", email: "rafael.nasc@hotmail.com", phone: "(21) 99123-4477", city: "Rio de Janeiro", state: "RJ" },
      { name: "Juliana Ferreira", email: "ju.ferreira@outlook.com", phone: "(31) 98877-2233", city: "Belo Horizonte", state: "MG" },
      { name: "Lucas Martins", email: "lucas.martins@gmail.com", phone: "(41) 99001-5566", city: "Curitiba", state: "PR" },
      { name: "Camila Lima", email: "camila.lima@gmail.com", phone: "(51) 98234-9911", city: "Porto Alegre", state: "RS" },
      { name: "Diego Costa", email: "diego.costa@yahoo.com", phone: "(71) 99456-8821", city: "Salvador", state: "BA" },
    ],
  });

  console.log("Criando fornecedores...");
  const fornecedoresData = [
    { name: "Shenzhen Tech", tipo: FornecedorTipo.INSUMO, contact: "sales@shenzhentech.cn", leadTimeDays: 18, active: true },
    { name: "Guangzhou Cables", tipo: FornecedorTipo.INSUMO, contact: "contato@gzcables.cn", leadTimeDays: 15, active: true },
    { name: "Embalagens SP", tipo: FornecedorTipo.INSUMO, contact: "vendas@embalagenssp.com.br", leadTimeDays: 4, active: true },
    { name: "PowerCell Baterias", tipo: FornecedorTipo.INSUMO, contact: "comercial@powercell.com.br", leadTimeDays: 22, active: true },
    { name: "Fábrica Parceira Eletrônicos SP", tipo: FornecedorTipo.PRODUTO, contact: "parceria@fabricaeletronicos.com.br", leadTimeDays: 12, active: true },
    { name: "Terceirizada Casa & Decoração", tipo: FornecedorTipo.PRODUTO, contact: "contato@casadecor.com.br", leadTimeDays: 9, active: true },
    { name: "Terceirizada Ferramentas Sul", tipo: FornecedorTipo.PRODUTO, contact: "vendas@ferramentassul.com.br", leadTimeDays: 20, active: true },
  ];
  const createdFornecedores = [];
  for (const f of fornecedoresData) {
    createdFornecedores.push(await prisma.fornecedor.create({ data: f }));
  }
  const fornecedorByName = new Map(createdFornecedores.map((f) => [f.name, f]));

  console.log("Criando pedidos de compra...");
  const pedidosCompraData: {
    tipo: FornecedorTipo;
    fornecedor: string;
    itemName: string;
    quantity: number;
    value: number;
    status: PedidoCompraStatus;
    expectedDaysFromNow: number;
  }[] = [
    { tipo: FornecedorTipo.INSUMO, fornecedor: "Shenzhen Tech", itemName: "Placa PCB Bluetooth", quantity: 500, value: 8900, status: PedidoCompraStatus.EM_TRANSITO, expectedDaysFromNow: 8 },
    { tipo: FornecedorTipo.INSUMO, fornecedor: "Guangzhou Cables", itemName: "Cabo USB-C 1m", quantity: 1200, value: 4560, status: PedidoCompraStatus.RECEBIDO, expectedDaysFromNow: -3 },
    { tipo: FornecedorTipo.INSUMO, fornecedor: "Embalagens SP", itemName: "Espuma protetora", quantity: 800, value: 1600, status: PedidoCompraStatus.RECEBIDO, expectedDaysFromNow: -7 },
    { tipo: FornecedorTipo.INSUMO, fornecedor: "PowerCell Baterias", itemName: "Bateria Li-ion 500mAh", quantity: 600, value: 9000, status: PedidoCompraStatus.AGUARDANDO, expectedDaysFromNow: 14 },
    { tipo: FornecedorTipo.PRODUTO, fornecedor: "Fábrica Parceira Eletrônicos SP", itemName: "Fone Bluetooth Pro X", quantity: 300, value: 18720, status: PedidoCompraStatus.EM_TRANSITO, expectedDaysFromNow: 6 },
    { tipo: FornecedorTipo.PRODUTO, fornecedor: "Terceirizada Casa & Decoração", itemName: "Suporte Notebook Alumínio", quantity: 150, value: 6180, status: PedidoCompraStatus.RECEBIDO, expectedDaysFromNow: -5 },
    { tipo: FornecedorTipo.PRODUTO, fornecedor: "Terceirizada Ferramentas Sul", itemName: "Kit Ferramentas 46 peças", quantity: 120, value: 8940, status: PedidoCompraStatus.AGUARDANDO, expectedDaysFromNow: 20 },
  ];
  let pcNumber = 3100;
  for (const pc of pedidosCompraData) {
    pcNumber += 1;
    const fornecedor = fornecedorByName.get(pc.fornecedor)!;
    await prisma.pedidoCompra.create({
      data: {
        number: `PC-${pcNumber}`,
        tipo: pc.tipo,
        fornecedorId: fornecedor.id,
        itemName: pc.itemName,
        quantity: pc.quantity,
        value: pc.value,
        status: pc.status,
        expectedDate: daysFromNow(pc.expectedDaysFromNow),
      },
    });
  }

  console.log("Criando custos fixos e variáveis...");
  await prisma.custoItem.createMany({
    data: [
      { name: "Aluguel dos galpões", tipo: CustoTipo.FIXO, value: 12500 },
      { name: "Folha de pagamento", tipo: CustoTipo.FIXO, value: 24800 },
      { name: "Softwares e assinaturas", tipo: CustoTipo.FIXO, value: 2140 },
      { name: "Contabilidade", tipo: CustoTipo.FIXO, value: 1800 },
      { name: "Comissões e taxas de marketplace", tipo: CustoTipo.VARIAVEL, value: 18420 },
      { name: "Frete e logística", tipo: CustoTipo.VARIAVEL, value: 9860 },
      { name: "Embalagens", tipo: CustoTipo.VARIAVEL, value: 3120 },
      { name: "Campanhas de anúncios", tipo: CustoTipo.VARIAVEL, value: 4210 },
    ],
  });

  console.log("Criando insumos e movimentações...");
  const insumosData = [
    { name: "Placa PCB Bluetooth", unit: "un", currentStock: 640, minStock: 200, unitCost: 17.8 },
    { name: "Case plástico ABS", unit: "un", currentStock: 410, minStock: 150, unitCost: 7.0 },
    { name: "Cabo USB-C 1m", unit: "un", currentStock: 1850, minStock: 400, unitCost: 3.8 },
    { name: "Bateria Li-ion 500mAh", unit: "un", currentStock: 320, minStock: 250, unitCost: 15.0 },
    { name: "Espuma protetora", unit: "un", currentStock: 980, minStock: 300, unitCost: 2.0 },
  ];
  const createdInsumos = [];
  for (const i of insumosData) {
    createdInsumos.push(await prisma.insumo.create({ data: i }));
  }
  const insumoByName = new Map(createdInsumos.map((i) => [i.name, i]));

  const movimentosData: {
    insumo: string;
    tipo: InsumoMovimentoTipo;
    quantity: number;
    notaFiscal: string;
    party: string;
    value: number;
    daysAgoRef: number;
  }[] = [
    { insumo: "Placa PCB Bluetooth", tipo: InsumoMovimentoTipo.ENTRADA, quantity: 500, notaFiscal: "NF-000482", party: "Shenzhen Tech", value: 8900, daysAgoRef: 1 },
    { insumo: "Case plástico ABS", tipo: InsumoMovimentoTipo.SAIDA, quantity: 340, notaFiscal: "NF-000481", party: "Linha de produção - Fones", value: 2380, daysAgoRef: 2 },
    { insumo: "Cabo USB-C 1m", tipo: InsumoMovimentoTipo.ENTRADA, quantity: 1200, notaFiscal: "NF-000479", party: "Guangzhou Cables", value: 4560, daysAgoRef: 3 },
    { insumo: "Bateria Li-ion 500mAh", tipo: InsumoMovimentoTipo.SAIDA, quantity: 214, notaFiscal: "NF-000475", party: "Linha de produção - Carregadores", value: 3210, daysAgoRef: 5 },
    { insumo: "Espuma protetora", tipo: InsumoMovimentoTipo.ENTRADA, quantity: 800, notaFiscal: "NF-000471", party: "Embalagens SP", value: 1600, daysAgoRef: 7 },
    { insumo: "Placa PCB Bluetooth", tipo: InsumoMovimentoTipo.SAIDA, quantity: 180, notaFiscal: "NF-000468", party: "Linha de produção - Fones", value: 3204, daysAgoRef: 9 },
  ];
  for (const m of movimentosData) {
    const insumo = insumoByName.get(m.insumo)!;
    await prisma.insumoMovimento.create({
      data: {
        insumoId: insumo.id,
        tipo: m.tipo,
        quantity: m.quantity,
        notaFiscal: m.notaFiscal,
        party: m.party,
        value: m.value,
        date: daysAgo(m.daysAgoRef),
      },
    });
  }

  console.log("Criando devoluções...");
  await prisma.devolucao.createMany({
    data: [
      { orderNumber: "48213", product: "Câmera de Segurança Wifi", reason: "Produto com defeito", platform: Platform.MERCADO_LIVRE, value: 249.9, status: DevolucaoStatus.SOLICITADA, createdAt: daysAgo(2) },
      { orderNumber: "48190", product: "Fone Bluetooth Pro X", reason: "Comprador arrependido", platform: Platform.MERCADO_LIVRE, value: 189.9, status: DevolucaoStatus.EM_ANALISE, createdAt: daysAgo(3) },
      { orderNumber: "48155", product: "Mouse Gamer RGB", reason: "Não era o esperado", platform: Platform.SHOPEE, value: 99.9, status: DevolucaoStatus.APROVADA, createdAt: daysAgo(5) },
      { orderNumber: "48042", product: "Kit Ferramentas 46 peças", reason: "Item incompleto", platform: Platform.TIKTOK_SHOP, value: 179.9, status: DevolucaoStatus.REEMBOLSADA, createdAt: daysAgo(8) },
      { orderNumber: "47988", product: "Carregador USB-C 20W", reason: "Produto com defeito", platform: Platform.MERCADO_LIVRE, value: 59.9, status: DevolucaoStatus.REEMBOLSADA, createdAt: daysAgo(11) },
    ],
  });

  console.log("Criando campanhas...");
  await prisma.campanha.createMany({
    data: [
      { name: "Fone Bluetooth — Black Week", platform: Platform.MERCADO_LIVRE, dailyBudget: 80, spent: 612.4, clicks: 3210, conversions: 214, status: CampanhaStatus.ATIVA },
      { name: "Carregadores — Alcance geral", platform: Platform.MERCADO_LIVRE, dailyBudget: 40, spent: 298.1, clicks: 1840, conversions: 76, status: CampanhaStatus.ATIVA },
      { name: "Linha casa — Impulso", platform: Platform.SHOPEE, dailyBudget: 30, spent: 205.7, clicks: 1120, conversions: 41, status: CampanhaStatus.PAUSADA },
      { name: "Kit ferramentas — Lançamento", platform: Platform.TIKTOK_SHOP, dailyBudget: 25, spent: 187.3, clicks: 940, conversions: 18, status: CampanhaStatus.ENCERRADA },
    ],
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
