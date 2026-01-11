import { Request, Response, NextFunction } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  searchStaff,
  StaffQueryParams,
} from '../services/staff.service';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Get all staff
 * GET /api/staff
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryParams: StaffQueryParams = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      search: req.query.search as string,
      department: req.query.department as string,
      position: req.query.position as string,
      isActive: req.query.isActive
        ? req.query.isActive === 'true'
        : undefined,
    };

    const result = await getAllStaff(queryParams);

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
 * Get staff by ID
 * GET /api/staff/:id
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const staff = await getStaffById(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create staff
 * POST /api/staff
 */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staff = await createStaff(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      message: SUCCESS_MESSAGES.CREATED,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update staff
 * PUT /api/staff/:id
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const staff = await updateStaff(id, req.body);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.UPDATED,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete staff
 * DELETE /api/staff/:id
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteStaff(id);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search staff
 * GET /api/staff/search
 */
export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryParams: StaffQueryParams = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      search: req.query.search as string,
      department: req.query.department as string,
      position: req.query.position as string,
      isActive: req.query.isActive
        ? req.query.isActive === 'true'
        : undefined,
    };

    const result = await searchStaff(queryParams);

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
