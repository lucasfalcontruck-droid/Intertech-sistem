import type { OrderStatus, Platform, TransactionStatus, TransactionType } from "@prisma/client";
import type { ProductStatus } from "@/lib/utils";

export interface DashboardKpis {
  salesToday: number;
  salesTrend: number;
  ordersToday: number;
  ordersTrend: number;
  avgTicketToday: number;
  avgTicketTrend: number;
  lowStockCount: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  salesByPlatformWeekly: ({ week: string } & Record<Platform, number>)[];
  platformShare: { platform: Platform; total: number; pct: number }[];
  dailyEvolution: { date: string; total: number }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; minStock: number }[];
  recentOrders: {
    id: string;
    number: string;
    customerName: string;
    platform: Platform;
    total: number;
    status: OrderStatus;
    createdAt: string;
  }[];
  grandTotal: number;
}

export interface IntegrationCard {
  platform: Platform;
  storeName: string;
  status: "CONNECTED" | "DISCONNECTED";
  feePercentage: number;
  lastSyncedAt: string | null;
  sales: number;
  orders: number;
  averageTicket: number;
  netPayout: number;
}

export interface MarketplaceData {
  integrationCards: IntegrationCard[];
  monthlyTrend: ({ month: string } & Record<Platform, number>)[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  channels: Platform[];
}

export interface StockSummary {
  totalSkus: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface EstoqueSummaryData {
  summary: StockSummary;
  byCategory: { category: string; units: number }[];
  categories: string[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  status: TransactionStatus;
  paidAt: string | null;
}

export interface FinanceKpis {
  revenueMonth: number;
  expensesMonth: number;
  netProfit: number;
  cashBalance: number;
}

export interface FinanceiroSummaryData {
  kpis: FinanceKpis;
  cashFlow: { month: string; entradas: number; saidas: number }[];
  dre: {
    grossRevenue: number;
    deductions: { category: string; amount: number }[];
    netProfit: number;
  };
  receivables: Transaction[];
  payables: Transaction[];
}
