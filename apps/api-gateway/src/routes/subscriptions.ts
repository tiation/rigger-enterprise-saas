import express from 'express';
import { expressRequireRole } from '@rigger/auth/middleware';

const router = express.Router();

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    message: 'Subscription plans endpoint - implementation in progress'
  });
});

// Get current subscription
router.get('/current', expressRequireRole(['COMPANY_OWNER']), (req: any, res) => {
  res.json({
    success: true,
    message: 'Current subscription endpoint - implementation in progress'
  });
});

export { router as subscriptionRoutes };