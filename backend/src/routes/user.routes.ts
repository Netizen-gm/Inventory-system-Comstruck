import { Router } from 'express';
import Joi from 'joi';
import {
  getAllUsers,
  getPendingManagers,
  getUser,
  approveManagerRegistration,
  changeUserRole,
  changeUserStatus,
} from '../controllers/user.controller';
import { validate, commonSchemas } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { UserRole, ApprovalStatus } from '../models/User.model';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filters
 * @access  Admin only
 */
router.get(
  '/',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().optional(),
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .optional(),
      approvalStatus: Joi.string()
        .valid(...Object.values(ApprovalStatus))
        .optional(),
      isActive: Joi.boolean().optional(),
    }),
  }),
  getAllUsers
);

/**
 * @route   GET /api/users/pending-managers
 * @desc    Get all pending manager approvals
 * @access  Admin only
 */
router.get('/pending-managers', getPendingManagers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/:id', getUser);

/**
 * @route   PATCH /api/users/:id/approve-manager
 * @desc    Approve or reject manager registration
 * @access  Admin only
 */
router.patch(
  '/:id/approve-manager',
  validate({
    body: Joi.object({
      approved: Joi.boolean().required().messages({
        'boolean.base': 'Approved must be a boolean',
        'any.required': 'Approved is required',
      }),
      reason: Joi.string().optional(),
    }),
  }),
  approveManagerRegistration
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Admin only
 */
router.patch(
  '/:id/role',
  validate({
    body: Joi.object({
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .required()
        .messages({
          'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}`,
          'any.required': 'Role is required',
        }),
    }),
  }),
  changeUserRole
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate or deactivate user
 * @access  Admin only
 */
router.patch(
  '/:id/status',
  validate({
    body: Joi.object({
      isActive: Joi.boolean().required().messages({
        'boolean.base': 'isActive must be a boolean',
        'any.required': 'isActive is required',
      }),
    }),
  }),
  changeUserStatus
);

export default router;
