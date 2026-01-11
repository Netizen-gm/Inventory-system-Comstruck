import { Router } from 'express';
import Joi from 'joi';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getDaily,
  getMonthly,
} from '../controllers/sales.controller';
import { validate, commonSchemas } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrManager } from '../middleware/role.middleware';
import { PaymentMethod } from '../models/Sale.model';

const router = Router();

// All sales routes require authentication and Admin/Manager role
router.use(authenticate);
router.use(requireAdminOrManager);

/**
 * @route   GET /api/sales/daily-report
 * @desc    Get daily sales report
 * @access  Admin, Manager
 */
router.get(
  '/daily-report',
  validate({
    query: Joi.object({
      date: Joi.date().optional(),
    }),
  }),
  getDaily
);

/**
 * @route   GET /api/sales/monthly-report
 * @desc    Get monthly sales report
 * @access  Admin, Manager
 */
router.get(
  '/monthly-report',
  validate({
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(3000).optional(),
      month: Joi.number().integer().min(1).max(12).optional(),
    }),
  }),
  getMonthly
);

/**
 * @route   GET /api/sales
 * @desc    Get all sales with pagination and filters
 * @access  Admin, Manager
 */
router.get(
  '/',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      staffId: commonSchemas.optionalMongoId,
      productId: commonSchemas.optionalMongoId,
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .optional(),
    }),
  }),
  getAll
);

/**
 * @route   GET /api/sales/:id
 * @desc    Get sale by ID
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
 * @route   POST /api/sales
 * @desc    Create new sale (auto-reduces stock)
 * @access  Admin, Manager
 */
router.post(
  '/',
  validate({
    body: Joi.object({
      saleDate: Joi.date().optional(),
      staffId: commonSchemas.mongoId,
      productId: commonSchemas.mongoId,
      quantity: Joi.number().positive().required().messages({
        'number.positive': 'Quantity must be greater than 0',
        'any.required': 'Quantity is required',
      }),
      unitPrice: Joi.number().min(0).required().messages({
        'number.min': 'Unit price cannot be negative',
        'any.required': 'Unit price is required',
      }),
      customerName: Joi.string().trim().optional(),
      customerPhone: Joi.string().trim().optional(),
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .required()
        .messages({
          'any.required': 'Payment method is required',
          'any.only': 'Invalid payment method',
        }),
      notes: Joi.string().trim().optional(),
    }),
  }),
  create
);

/**
 * @route   PUT /api/sales/:id
 * @desc    Update sale
 * @access  Admin, Manager
 */
router.put(
  '/:id',
  validate({
    params: Joi.object({
      id: commonSchemas.mongoId,
    }),
    body: Joi.object({
      saleDate: Joi.date().optional(),
      quantity: Joi.number().positive().optional().messages({
        'number.positive': 'Quantity must be greater than 0',
      }),
      unitPrice: Joi.number().min(0).optional().messages({
        'number.min': 'Unit price cannot be negative',
      }),
      customerName: Joi.string().trim().optional(),
      customerPhone: Joi.string().trim().optional(),
      paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .optional()
        .messages({
          'any.only': 'Invalid payment method',
        }),
      notes: Joi.string().trim().optional(),
    }),
  }),
  update
);

/**
 * @route   DELETE /api/sales/:id
 * @desc    Delete sale (restores stock)
 * @access  Admin, Manager
 */
router.delete(
  '/:id',
  validate({
    params: Joi.object({
      id: commonSchemas.mongoId,
    }),
  }),
  remove
);

export default router;
