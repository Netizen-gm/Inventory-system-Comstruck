import { Product, IProduct, ProductStatus } from '../models/Product.model';
import { AppError } from '../utils/AppError';
import { PAGINATION } from '../utils/constants';
import mongoose from 'mongoose';

export interface CreateProductInput {
  name: string;
  description?: string;
  category: string;
  sku: string;
  quantity?: number;
  minStock: number;
  maxStock?: number;
  unit?: string;
  pricePerUnit: number;
  location?: string;
  supplier?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: string;
  sku?: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  pricePerUnit?: number;
  status?: ProductStatus;
  location?: string;
  supplier?: string;
  lastRestocked?: Date;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedProductResponse {
  data: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  categoriesCount: number;
  totalQuantity: number;
}

/**
 * Get all products with pagination, search, and filters
 */
export const getAllProducts = async (
  queryParams: ProductQueryParams
): Promise<PaginatedProductResponse> => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    search,
    category,
    status,
    minPrice,
    maxPrice,
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

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = new RegExp(category, 'i');
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.pricePerUnit = {};
    if (minPrice !== undefined) {
      (filter.pricePerUnit as Record<string, number>).$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      (filter.pricePerUnit as Record<string, number>).$lte = maxPrice;
    }
  }

  // Build search query
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { sku: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
    ];
  }

  // Get total count for pagination
  const total = await Product.countDocuments(filter);

  // Get products with pagination
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalPages = Math.ceil(total / limitNumber);

  return {
    data: products as unknown as IProduct[],
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
    },
  };
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<IProduct> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id);

  if (!product) {
    throw AppError.notFound('Product not found');
  }

  return product;
};

/**
 * Create new product
 */
export const createProduct = async (
  input: CreateProductInput
): Promise<IProduct> => {
  const {
    name,
    description,
    category,
    sku,
    quantity = 0,
    minStock,
    maxStock,
    unit = 'bag',
    pricePerUnit,
    location,
    supplier,
  } = input;

  // Validate quantity is not negative
  if (quantity < 0) {
    throw AppError.badRequest('Quantity cannot be negative');
  }

  // Check if SKU already exists
  const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
  if (existingSku) {
    throw AppError.conflict('SKU already exists');
  }

  // Validate maxStock is greater than minStock if provided
  if (maxStock !== undefined && maxStock < minStock) {
    throw AppError.badRequest('Maximum stock must be greater than minimum stock');
  }

  // Create product (status will be auto-updated by pre-save hook)
  const product = await Product.create({
    name,
    description,
    category,
    sku: sku.toUpperCase(),
    quantity,
    minStock,
    maxStock,
    unit,
    pricePerUnit,
    location,
    supplier,
  });

  return product;
};

/**
 * Update product
 */
export const updateProduct = async (
  id: string,
  input: UpdateProductInput
): Promise<IProduct> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid product ID');
  }

  const {
    name,
    description,
    category,
    sku,
    quantity,
    minStock,
    maxStock,
    unit,
    pricePerUnit,
    status,
    location,
    supplier,
    lastRestocked,
  } = input;

  // Check if product exists
  const product = await Product.findById(id);
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  // Validate quantity is not negative
  if (quantity !== undefined && quantity < 0) {
    throw AppError.badRequest('Quantity cannot be negative');
  }

  // Check if SKU is being updated and if it already exists
  if (sku && sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      throw AppError.conflict('SKU already exists');
    }
    product.sku = sku.toUpperCase();
  }

  // Validate maxStock is greater than minStock if both are provided
  const newMinStock = minStock !== undefined ? minStock : product.minStock;
  if (maxStock !== undefined && maxStock < newMinStock) {
    throw AppError.badRequest('Maximum stock must be greater than minimum stock');
  }

  // Update fields
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category;
  if (quantity !== undefined) product.quantity = quantity;
  if (minStock !== undefined) product.minStock = minStock;
  if (maxStock !== undefined) product.maxStock = maxStock;
  if (unit !== undefined) product.unit = unit;
  if (pricePerUnit !== undefined) product.pricePerUnit = pricePerUnit;
  if (location !== undefined) product.location = location;
  if (supplier !== undefined) product.supplier = supplier;
  if (lastRestocked !== undefined) {
    product.lastRestocked = lastRestocked ? new Date(lastRestocked) : undefined;
  }

  // Only allow status update if explicitly set (otherwise auto-update)
  if (status !== undefined) {
    product.status = status;
  }

  // Status will be auto-updated by pre-save hook if quantity or minStock changed
  await product.save();

  return product;
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid product ID');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  await Product.findByIdAndDelete(id);
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (): Promise<IProduct[]> => {
  const products = await Product.find({
    status: { $in: [ProductStatus.LOW_STOCK, ProductStatus.OUT_OF_STOCK] },
  })
    .sort({ quantity: 1 })
    .lean();

return products as unknown as IProduct[];};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [
    totalProducts,
    products,
    lowStockCount,
    outOfStockCount,
    inStockCount,
    categories,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.find().lean(),
    Product.countDocuments({ status: ProductStatus.LOW_STOCK }),
    Product.countDocuments({ status: ProductStatus.OUT_OF_STOCK }),
    Product.countDocuments({ status: ProductStatus.IN_STOCK }),
    Product.distinct('category'),
  ]);

  // Calculate total stock value
  const totalStockValue = products.reduce(
    (sum, product) => sum + (product.quantity * product.pricePerUnit),
    0
  );

  // Calculate total quantity
  const totalQuantity = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  return {
    totalProducts,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    inStockCount,
    categoriesCount: categories.length,
    totalQuantity,
  };
};
