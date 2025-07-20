import express from 'express';
import { expressRequireRole } from '@rigger/auth/middleware';

const router = express.Router();

// Get company profile
router.get('/me', expressRequireRole(['COMPANY_OWNER', 'COMPANY_MANAGER']), (req: any, res) => {
  res.json({
    success: true,
    message: 'Company profile endpoint - implementation in progress'
  });
});

// Update company profile
router.put('/me', expressRequireRole(['COMPANY_OWNER']), (req: any, res) => {
  res.json({
    success: true,
    message: 'Update company profile endpoint - implementation in progress'
  });
});

export { router as companyRoutes };