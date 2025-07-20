import express from 'express';
import { expressAuth } from '@rigger/auth/middleware';

const router = express.Router();

// Get current user profile
router.get('/me', expressAuth, (req: any, res) => {
  res.json({
    success: true,
    data: req.user,
    message: 'User profile endpoint - implementation in progress'
  });
});

// Update user profile
router.put('/me', expressAuth, (req: any, res) => {
  res.json({
    success: true,
    message: 'Update user profile endpoint - implementation in progress'
  });
});

export { router as userRoutes };