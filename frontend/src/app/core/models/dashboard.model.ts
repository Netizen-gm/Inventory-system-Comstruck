export interface DashboardStats {
  stock: {
    totalStockValue: number;
    totalQuantity: number;
    lowStockCount: number;
    outOfStockCount: number;
    inStockCount: number;
  };
  revenue: {
    dailyRevenue: number;
    monthlyRevenue: number;
    totalRevenue: number;
  };
  sales: {
    totalSalesCount: number;
    dailySalesCount: number;
    monthlySalesCount: number;
  };
  summary: {
    totalProducts: number;
    totalCategories: number;
    averageDailyRevenue: number;
    averageMonthlyRevenue: number;
  };
}
