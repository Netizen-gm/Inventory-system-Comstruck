import { Router } from 'express';
import Joi from 'joi';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
} from '../controllers/staff.controller';
import { validate, commonSchemas } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrManager, requireAdmin } from '../middleware/role.middleware';

const router = Router();

// All staff routes require authentication and Admin/Manager role
router.use(authenticate);
router.use(requireAdminOrManager);

/**
 * @route   GET /api/staff
 * @desc    Get all staff with pagination, search, and filters
 * @access  Admin, Manager
 */
router.get(
  '/',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().trim().optional(),
      department: Joi.string().trim().optional(),
      position: Joi.string().trim().optional(),
      isActive: Joi.boolean().optional(),
    }),
  }),
  getAll
);

/**
 * @route   GET /api/staff/search
 * @desc    Search staff with pagination, search, and filters
 * @access  Admin, Manager
 */
router.get(
  '/search',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().trim().optional(),
      department: Joi.string().trim().optional(),
      position: Joi.string().trim().optional(),
      isActive: Joi.boolean().optional(),
    }),
  }),
  search
);

/**
 * @route   GET /api/staff/:id
 * @desc    Get staff by ID
 * @access  Admin, Manager
 */
router.get(
  '/:id',
  validate({
    params: Joi.object({
      id: commonSchemas.mongoId,
    }),
  }),
  getById
);

/**
 * @route   POST /api/staff
 * @desc    Create new staff (creates user account automatically if user details provided)
 * @access  Admin, Manager
 */
router.post(
  '/',
  validate({
    body: Joi.object({
      // Option 1: Use existing user by ID
      userId: commonSchemas.optionalMongoId,
      // Option 2: Create new user account (if userId not provided)
      email: Joi.string().email().lowercase().trim().optional(),
      password: commonSchemas.optionalPassword,
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      role: Joi.string().valid('user', 'admin', 'manager', 'warehouse').optional(),
      // Staff details
      employeeId: Joi.string().trim().required().messages({
        'string.empty': 'Employee ID is required',
        'any.required': 'Employee ID is required',
      }),
      department: Joi.string().trim().optional(),
      position: Joi.string().trim().optional(),
      hireDate: Joi.date().optional(),
      phoneNumber: Joi.string().trim().optional(),
      address: Joi.string().trim().optional(),
      salary: Joi.number().min(0).optional(),
    }).or('userId', 'email') // Either userId or email must be provided
      .and('email', 'password') // If email provided, password is required
      .messages({
        'object.missing': 'Either userId or email must be provided',
        'object.and': 'If email is provided, password is required',
      }),
  }),
  create
);

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff
 * @access  Admin, Manager
 */
router.put(
  '/:id',
  validate({
    params: Joi.object({
      id: commonSchemas.mongoId,
    }),
    body: Joi.object({
      employeeId: Joi.string().trim().optional(),
      department: Joi.string().trim().optional(),
      position: Joi.string().trim().optional(),
      hireDate: Joi.date().optional(),
      phoneNumber: Joi.string().trim().optional(),
      address: Joi.string().trim().optional(),
      salary: Joi.number().min(0).optional(),
      isActive: Joi.boolean().optional(),
    }),
  }),
  update
);

/**
 * @route   DELETE /api/staff/:id
 * @desc    Delete staff (Admin only)
 * @access  Admin
 */
router.delete(
  '/:id',
  requireAdmin, // Only Admin can delete
  validate({
    params: Joi.object({
      id: commonSchemas.mongoId,
    }),
  }),
  remove
);

export default router;
