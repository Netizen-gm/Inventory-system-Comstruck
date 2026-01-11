import { Staff } from './staff.model';
import { Product } from './product.model';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CHEQUE = 'cheque',
}

export interface Sale {
  _id: string;
  saleDate: string;
  staffId: Staff | string;
  productId: Product | string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleRequest {
  saleDate?: string;
  staffId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateSaleRequest {
  saleDate?: string;
  staffId?: string;
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface SaleQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  staffId?: string;
  productId?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaginatedSaleResponse {
  data: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DailyReportResponse {
  date: string;
  totalSales: number;
  totalRevenue: number;
  sales: Sale[];
}

export interface MonthlyReportResponse {
  month: number;
  year: number;
  totalSales: number;
  totalRevenue: number;
  dailyBreakdown: Array<{
    date: string;
    totalSales: number;
    totalRevenue: number;
  }>;
}
