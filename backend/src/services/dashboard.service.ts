import { Product } from '../models/Product.model';
import { Sale } from '../models/Sale.model';
import { ProductStatus } from '../models/Product.model';

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

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get all products for stock calculations
  const products = await Product.find().lean();

  // Calculate stock statistics
  const totalStockValue = products.reduce(
    (sum, product) => sum + product.quantity * product.pricePerUnit,
    0
  );

  const totalQuantity = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const lowStockCount = products.filter(
    (product) => product.status === ProductStatus.LOW_STOCK
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.status === ProductStatus.OUT_OF_STOCK
  ).length;

  const inStockCount = products.filter(
    (product) => product.status === ProductStatus.IN_STOCK
  ).length;

  // Get unique categories count
  const categories = await Product.distinct('category');
  const totalCategories = categories.length;

  // Calculate date ranges
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Get daily sales
  const dailySales = await Sale.find({
    saleDate: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  }).lean();

  const dailyRevenue = dailySales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );

  const dailySalesCount = dailySales.length;

  // Get monthly sales
  const monthlySales = await Sale.find({
    saleDate: {
      $gte: monthStart,
      $lte: monthEnd,
    },
  }).lean();

  const monthlyRevenue = monthlySales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );

  const monthlySalesCount = monthlySales.length;

  // Get total sales count and revenue
  const totalSales = await Sale.aggregate([
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  const totalSalesCount = totalSales[0]?.totalCount || 0;
  const totalRevenue = totalSales[0]?.totalRevenue || 0;

  // Calculate averages
  const currentDay = now.getDate();
  const averageDailyRevenue = currentDay > 0 ? monthlyRevenue / currentDay : 0;

  const currentMonth = now.getMonth() + 1;
  const averageMonthlyRevenue = currentMonth > 0 ? totalRevenue / currentMonth : 0;

  return {
    stock: {
      totalStockValue,
      totalQuantity,
      lowStockCount,
      outOfStockCount,
      inStockCount,
    },
    revenue: {
      dailyRevenue,
      monthlyRevenue,
      totalRevenue,
    },
    sales: {
      totalSalesCount,
      dailySalesCount,
      monthlySalesCount,
    },
    summary: {
      totalProducts: products.length,
      totalCategories,
      averageDailyRevenue: Math.round(averageDailyRevenue * 100) / 100,
      averageMonthlyRevenue: Math.round(averageMonthlyRevenue * 100) / 100,
    },
  };
};
