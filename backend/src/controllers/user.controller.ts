import { Request, Response, NextFunction } from 'express';
import {
  getUsers,
  getPendingManagerApprovals,
  getUserById,
  approveManager,
  updateUserRole,
  updateUserStatus,
} from '../services/user.service';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

/**
 * Get all users
 * GET /api/users
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getUsers({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      search: req.query.search as string,
      role: req.query.role as any,
      approvalStatus: req.query.approvalStatus as any,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending manager approvals
 * GET /api/users/pending-managers
 */
export const getPendingManagers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pendingManagers = await getPendingManagerApprovals();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: pendingManagers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject manager registration
 * PATCH /api/users/:id/approve-manager
 */
export const approveManagerRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { approved, reason } = req.body;

    const user = await approveManager(req.params.id, {
      approved,
      reason,
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: approved
        ? 'Manager approved successfully'
        : 'Manager request rejected',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 * PATCH /api/users/:id/role
 */
export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.body;

    const user = await updateUserRole(req.params.id, { role });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: SUCCESS_MESSAGES.UPDATED,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate or deactivate user
 * PATCH /api/users/:id/status
 */
export const changeUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActive } = req.body;

    const user = await updateUserStatus(req.params.id, isActive);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: isActive
        ? 'User activated successfully'
        : 'User deactivated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
