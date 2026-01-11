import { Router } from 'express';
import Joi from 'joi';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  getLowStock,
  getDashboard,
} from '../controllers/products.controller';
import { validate, commonSchemas } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrWarehouse } from '../middleware/role.middleware';
import { ProductStatus } from '../models/Product.model';

const router = Router();

// All product routes require authentication and Admin/Warehouse role
router.use(authenticate);
router.use(requireAdminOrWarehouse);

/**
 * @route   GET /api/products/dashboard-stats
 * @desc    Get dashboard statistics
 * @access  Admin, Warehouse
 */
router.get('/dashboard-stats', getDashboard);

/**
 * @route   GET /api/products/low-stock
 * @desc    Get low stock products
 * @access  Admin, Warehouse
 */
router.get('/low-stock', getLowStock);

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination, search, and filters
 * @access  Admin, Warehouse
 */
router.get(
  '/',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().trim().optional(),
      category: Joi.string().trim().optional(),
      status: Joi.string()
        .valid(...Object.values(ProductStatus))
        .optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
    }),
  }),
  getAll
);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Admin, Warehouse
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
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Admin, Warehouse
 */
router.post(
  '/',
  validate({
    body: Joi.object({
      name: Joi.string().trim().required().messages({
        'string.empty': 'Product name is required',
        'any.required': 'Product name is required',
      }),
      description: Joi.string().trim().optional(),
      category: Joi.string().trim().required().messages({
        'string.empty': 'Category is required',
        'any.required': 'Category is required',
      }),
      sku: Joi.string().trim().required().messages({
        'string.empty': 'SKU is required',
        'any.required': 'SKU is required',
      }),
      quantity: Joi.number().integer().min(0).optional(),
      minStock: Joi.number().integer().min(0).required().messages({
        'number.base': 'Minimum stock must be a number',
        'number.min': 'Minimum stock cannot be negative',
        'any.required': 'Minimum stock is required',
      }),
      maxStock: Joi.number().integer().min(0).optional(),
      unit: Joi.string().trim().optional(),
      pricePerUnit: Joi.number().min(0).required().messages({
        'number.base': 'Price per unit must be a number',
        'number.min': 'Price cannot be negative',
        'any.required': 'Price per unit is required',
      }),
      location: Joi.string().trim().optional(),
      supplier: Joi.string().trim().optional(),
    }),
  }),
  create
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Admin, Warehouse
 */
router.put(
  '/:id',
  validate({
    params: Joi.object({
      id: commonSchemas.mongoId,
    }),
    body: Joi.object({
      name: Joi.string().trim().optional(),
      description: Joi.string().trim().optional(),
      category: Joi.string().trim().optional(),
      sku: Joi.string().trim().optional(),
      quantity: Joi.number().integer().min(0).optional(),
      minStock: Joi.number().integer().min(0).optional(),
      maxStock: Joi.number().integer().min(0).optional(),
      unit: Joi.string().trim().optional(),
      pricePerUnit: Joi.number().min(0).optional(),
      status: Joi.string()
        .valid(...Object.values(ProductStatus))
        .optional(),
      location: Joi.string().trim().optional(),
      supplier: Joi.string().trim().optional(),
      lastRestocked: Joi.date().optional(),
    }),
  }),
  update
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Admin, Warehouse
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
