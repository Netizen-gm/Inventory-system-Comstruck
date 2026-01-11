import { Request, Response, NextFunction } from 'express';
import {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getDailyReport,
  getMonthlyReport,
  SaleQueryParams,
} from '../services/sales.service';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Get all sales
 * GET /api/sales
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryParams: SaleQueryParams = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      startDate: req.query.startDate
        ? new Date(String(req.query.startDate))
        : undefined,
      endDate: req.query.endDate
        ? new Date(String(req.query.endDate))
        : undefined,
      staffId: req.query.staffId as string,
      productId: req.query.productId as string,
      paymentMethod: req.query.paymentMethod as SaleQueryParams['paymentMethod'],
    };

    const result = await getAllSales(queryParams);

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
 * Get sale by ID
 * GET /api/sales/:id
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const sale = await getSaleById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create sale (auto-reduces stock)
 * POST /api/sales
 */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sale = await createSale(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: SUCCESS_MESSAGES.CREATED,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update sale
 * PUT /api/sales/:id
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const sale = await updateSale(id, req.body);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.UPDATED,
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete sale (restores stock)
 * DELETE /api/sales/:id
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteSale(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get daily sales report
 * GET /api/sales/daily-report
 */
export const getDaily = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const date = req.query.date
      ? new Date(String(req.query.date))
      : undefined;

    const report = await getDailyReport(date);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly sales report
 * GET /api/sales/monthly-report
 */
export const getMonthly = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const year = req.query.year
      ? parseInt(String(req.query.year), 10)
      : undefined;
    const month = req.query.month
      ? parseInt(String(req.query.month), 10)
      : undefined;

    const report = await getMonthlyReport(year, month);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
