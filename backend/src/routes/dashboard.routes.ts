import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdminOrManager } from '../middleware/role.middleware';

const router = Router();

// All dashboard routes require authentication and Admin/Manager role
router.use(authenticate);
router.use(requireAdminOrManager);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Admin, Manager
 */
router.get('/stats', getStats);

export default router;
