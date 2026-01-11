import { Request, Response, NextFunction } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getDashboardStats,
  ProductQueryParams,
} from '../services/products.service';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Get all products
 * GET /api/products
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryParams: ProductQueryParams = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      search: req.query.search as string,
      category: req.query.category as string,
      status: req.query.status as ProductQueryParams['status'],
      minPrice: req.query.minPrice
        ? parseFloat(String(req.query.minPrice))
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(String(req.query.maxPrice))
        : undefined,
    };

    const result = await getAllProducts(queryParams);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        data: result.data,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create product
 * POST /api/products
 */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await createProduct(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: SUCCESS_MESSAGES.CREATED,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await updateProduct(id, req.body);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.UPDATED,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteProduct(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock products
 * GET /api/products/low-stock
 */
export const getLowStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await getLowStockProducts();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics
 * GET /api/products/dashboard-stats
 */
export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getDashboardStats();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
