import mongoose from 'mongoose';
import { Sale, ISale, PaymentMethod } from '../models/Sale.model';
import { Product } from '../models/Product.model';
import { AppError } from '../utils/AppError';
import { PAGINATION } from '../utils/constants';

export interface CreateSaleInput {
  saleDate?: Date;
  staffId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateSaleInput {
  saleDate?: Date;
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
  startDate?: Date;
  endDate?: Date;
  staffId?: string;
  productId?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaginatedSaleResponse {
  data: ISale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DailyReportData {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalQuantity: number;
  transactionCount: number;
  paymentMethods: Record<PaymentMethod, number>;
}

export interface MonthlyReportData {
  month: string;
  year: number;
  totalSales: number;
  totalRevenue: number;
  totalQuantity: number;
  transactionCount: number;
  averageSaleAmount: number;
  paymentMethods: Record<PaymentMethod, number>;
  topProducts: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topStaff: Array<{
    staffId: mongoose.Types.ObjectId;
    staffName: string;
    totalSales: number;
    totalRevenue: number;
  }>;
}

/**
 * Get all sales with pagination and filters
 */
export const getAllSales = async (
  queryParams: SaleQueryParams
): Promise<PaginatedSaleResponse> => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    startDate,
    endDate,
    staffId,
    productId,
    paymentMethod,
  } = queryParams;

  // Validate pagination
  const pageNumber = Math.max(1, parseInt(String(page), 10));
  const limitNumber = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(String(limit), 10))
  );
  const skip = (pageNumber - 1) * limitNumber;

  // Build filter query
  const filter: Record<string, unknown> = {};

  if (startDate || endDate) {
    filter.saleDate = {};
    if (startDate) {
      (filter.saleDate as Record<string, Date>).$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      (filter.saleDate as Record<string, Date>).$lte = end;
    }
  }

  if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
    filter.staffId = new mongoose.Types.ObjectId(staffId);
  }

  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    filter.productId = new mongoose.Types.ObjectId(productId);
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Get total count for pagination
  const total = await Sale.countDocuments(filter);

  // Get sales with population and pagination
  const sales = await Sale.find(filter)
    .populate({
      path: 'staffId',
      select: 'employeeId userId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email',
      },
    })
    .populate({
      path: 'productId',
      select: 'name sku category unit pricePerUnit',
    })
    .sort({ saleDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: sales as ISale[],
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

/**
 * Get sale by ID
 */
export const getSaleById = async (id: string): Promise<ISale> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid sale ID');
  }

  const sale = await Sale.findById(id)
    .populate({
      path: 'staffId',
      select: 'employeeId userId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email',
      },
    })
    .populate({
      path: 'productId',
      select: 'name sku category unit pricePerUnit',
    });

  if (!sale) {
    throw AppError.notFound('Sale not found');
  }

  return sale;
};

/**
 * Create new sale with stock reduction (using MongoDB transaction)
 */
export const createSale = async (
  input: CreateSaleInput
): Promise<ISale> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      saleDate,
      staffId,
      productId,
      quantity,
      unitPrice,
      customerName,
      customerPhone,
      paymentMethod,
      notes,
    } = input;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      throw AppError.badRequest('Invalid staff ID');
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw AppError.badRequest('Invalid product ID');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw AppError.badRequest('Quantity must be greater than 0');
    }

    // Validate unit price
    if (unitPrice < 0) {
      throw AppError.badRequest('Unit price cannot be negative');
    }

    // Check product and validate stock (with lock)
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    // Validate stock availability
    if (product.quantity < quantity) {
      throw AppError.badRequest(
        `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`
      );
    }

    // Check if product is discontinued
    if (product.status === 'discontinued') {
      throw AppError.badRequest('Cannot sell discontinued product');
    }

    // Calculate total amount
    const totalAmount = quantity * unitPrice;

    // Create sale
    const sale = await Sale.create(
      [
        {
          saleDate: saleDate ? new Date(saleDate) : new Date(),
          staffId: new mongoose.Types.ObjectId(staffId),
          productId: new mongoose.Types.ObjectId(productId),
          quantity,
          unitPrice,
          totalAmount,
          customerName,
          customerPhone,
          paymentMethod,
          notes,
        },
      ],
      { session }
    );

    // Reduce product stock
    product.quantity -= quantity;
    // Status will be auto-updated by pre-save hook
    await product.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate sale data
    const populatedSale = await Sale.findById(sale[0]._id)
      .populate({
        path: 'staffId',
        select: 'employeeId userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate({
        path: 'productId',
        select: 'name sku category unit pricePerUnit',
      });

    return populatedSale!;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal('Failed to create sale');
  } finally {
    session.endSession();
  }
};

/**
 * Update sale (with stock adjustment if quantity changed)
 */
export const updateSale = async (
  id: string,
  input: UpdateSaleInput
): Promise<ISale> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid sale ID');
    }

    const sale = await Sale.findById(id).session(session);
    if (!sale) {
      throw AppError.notFound('Sale not found');
    }

    const {
      saleDate,
      quantity,
      unitPrice,
      customerName,
      customerPhone,
      paymentMethod,
      notes,
    } = input;

    // Handle quantity change (adjust stock)
    if (quantity !== undefined && quantity !== sale.quantity) {
      const quantityDiff = quantity - sale.quantity;

      // Validate new quantity
      if (quantity <= 0) {
        throw AppError.badRequest('Quantity must be greater than 0');
      }

      // Get product and adjust stock
      const product = await Product.findById(sale.productId).session(session);
      if (!product) {
        throw AppError.notFound('Product not found');
      }

      // If increasing quantity, check stock availability
      if (quantityDiff > 0) {
        if (product.quantity < quantityDiff) {
          throw AppError.badRequest(
            `Insufficient stock. Available: ${product.quantity}, Additional needed: ${quantityDiff}`
          );
        }
        product.quantity -= quantityDiff;
      } else {
        // If decreasing quantity, restore stock
        product.quantity += Math.abs(quantityDiff);
      }

      await product.save({ session });
      sale.quantity = quantity;
    }

    // Update other fields
    if (saleDate !== undefined) {
      sale.saleDate = new Date(saleDate);
    }
    if (unitPrice !== undefined) {
      if (unitPrice < 0) {
        throw AppError.badRequest('Unit price cannot be negative');
      }
      sale.unitPrice = unitPrice;
    }
    if (customerName !== undefined) {
      sale.customerName = customerName;
    }
    if (customerPhone !== undefined) {
      sale.customerPhone = customerPhone;
    }
    if (paymentMethod !== undefined) {
      sale.paymentMethod = paymentMethod;
    }
    if (notes !== undefined) {
      sale.notes = notes;
    }

    // Total amount will be recalculated by pre-save hook
    await sale.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate sale data
    const populatedSale = await Sale.findById(id)
      .populate({
        path: 'staffId',
        select: 'employeeId userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate({
        path: 'productId',
        select: 'name sku category unit pricePerUnit',
      });

    return populatedSale!;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal('Failed to update sale');
  } finally {
    session.endSession();
  }
};

/**
 * Delete sale (restore stock)
 */
export const deleteSale = async (id: string): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid sale ID');
    }

    const sale = await Sale.findById(id).session(session);
    if (!sale) {
      throw AppError.notFound('Sale not found');
    }

    // Restore product stock
    const product = await Product.findById(sale.productId).session(session);
    if (product) {
      product.quantity += sale.quantity;
      await product.save({ session });
    }

    // Delete sale
    await Sale.findByIdAndDelete(id).session(session);

    // Commit transaction
    await session.commitTransaction();
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal('Failed to delete sale');
  } finally {
    session.endSession();
  }
};

/**
 * Get daily sales report
 */
export const getDailyReport = async (
  date?: Date
): Promise<DailyReportData> => {
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const sales = await Sale.find({
    saleDate: {
      $gte: targetDate,
      $lt: nextDay,
    },
  }).lean();

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  // Calculate payment methods breakdown
  const paymentMethods: Record<PaymentMethod, number> = {
    cash: 0,
    card: 0,
    transfer: 0,
    cheque: 0,
  };

  sales.forEach((sale) => {
    paymentMethods[sale.paymentMethod] += sale.totalAmount;
  });

  return {
    date: targetDate.toISOString().split('T')[0],
    totalSales,
    totalRevenue,
    totalQuantity,
    transactionCount: totalSales,
    paymentMethods,
  };
};

/**
 * Get monthly sales report
 */
export const getMonthlyReport = async (
  year?: number,
  month?: number
): Promise<MonthlyReportData> => {
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month !== undefined ? month - 1 : now.getMonth(); // month is 0-indexed

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const sales = await Sale.find({
    saleDate: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate('productId', 'name')
    .populate({
      path: 'staffId',
      select: 'userId',
      populate: {
        path: 'userId',
        select: 'firstName lastName',
      },
    })
    .lean();

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageSaleAmount = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Calculate payment methods breakdown
  const paymentMethods: Record<PaymentMethod, number> = {
    cash: 0,
    card: 0,
    transfer: 0,
    cheque: 0,
  };

  sales.forEach((sale) => {
    paymentMethods[sale.paymentMethod] += sale.totalAmount;
  });

  // Calculate top products
  const productMap = new Map<
    string,
    { productId: mongoose.Types.ObjectId; productName: string; totalQuantity: number; totalRevenue: number }
  >();

  sales.forEach((sale) => {
    const productId = (sale.productId as any)._id.toString();
    const productName = (sale.productId as any).name || 'Unknown';
    
    if (!productMap.has(productId)) {
      productMap.set(productId, {
        productId: sale.productId as mongoose.Types.ObjectId,
        productName,
        totalQuantity: 0,
        totalRevenue: 0,
      });
    }

    const product = productMap.get(productId)!;
    product.totalQuantity += sale.quantity;
    product.totalRevenue += sale.totalAmount;
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  // Calculate top staff
  const staffMap = new Map<
    string,
    { staffId: mongoose.Types.ObjectId; staffName: string; totalSales: number; totalRevenue: number }
  >();

  sales.forEach((sale) => {
    const staffId = (sale.staffId as any)._id.toString();
    const userId = (sale.staffId as any).userId;
    const staffName = userId
      ? `${userId.firstName || ''} ${userId.lastName || ''}`.trim() || 'Unknown'
      : 'Unknown';

    if (!staffMap.has(staffId)) {
      staffMap.set(staffId, {
        staffId: sale.staffId as mongoose.Types.ObjectId,
        staffName,
        totalSales: 0,
        totalRevenue: 0,
      });
    }

    const staff = staffMap.get(staffId)!;
    staff.totalSales += 1;
    staff.totalRevenue += sale.totalAmount;
  });

  const topStaff = Array.from(staffMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  return {
    month: (targetMonth + 1).toString().padStart(2, '0'),
    year: targetYear,
    totalSales,
    totalRevenue,
    totalQuantity,
    transactionCount: totalSales,
    averageSaleAmount,
    paymentMethods,
    topProducts,
    topStaff,
  };
};
