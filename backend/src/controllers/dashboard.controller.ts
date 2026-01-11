import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboard.service';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
export const getStats = async (
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
