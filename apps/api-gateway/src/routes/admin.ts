import express from 'express';
import { expressRequireRole } from '@rigger/auth/middleware';

const router = express.Router();

// Admin dashboard stats
router.get('/stats', expressRequireRole('ADMIN'), (req: any, res) => {
  res.json({
    success: true,
    message: 'Admin stats endpoint - implementation in progress'
  });
});

// System health check
router.get('/system', expressRequireRole('ADMIN'), (req: any, res) => {
  res.json({
    success: true,
    message: 'Admin system status endpoint - implementation in progress'
  });
});

export { router as adminRoutes };