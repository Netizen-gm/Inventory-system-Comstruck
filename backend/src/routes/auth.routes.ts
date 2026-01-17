import { Router } from 'express';
import Joi from 'joi';
import {
  register,
  login,
  refresh,
  logout,
} from '../controllers/auth.controller';
import { validate, commonSchemas } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { UserRole } from '../models/User.model';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validate({
    body: Joi.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      role: Joi.string()
        .valid(UserRole.USER, UserRole.MANAGER)
        .optional()
        .messages({
          'any.only': 'Role must be either "user" or "manager"',
        }),
    }),
  }),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate({
    body: Joi.object({
      email: commonSchemas.email,
      password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
      }),
    }),
  }),
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate({
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh token is required',
        'any.required': 'Refresh token is required',
      }),
    }),
  }),
  refresh
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (blacklist tokens)
 * @access  Public (but requires tokens in body)
 */
router.post(
  '/logout',
  validate({
    body: Joi.object({
      accessToken: Joi.string().required().messages({
        'string.empty': 'Access token is required',
        'any.required': 'Access token is required',
      }),
      refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh token is required',
        'any.required': 'Refresh token is required',
      }),
    }),
  }),
  logout
);

export default router;
