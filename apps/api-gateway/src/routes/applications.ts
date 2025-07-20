import express from 'express';
import { expressAuth } from '@rigger/auth/middleware';

const router = express.Router();

// Get applications (workers see their own, companies see applications to their jobs)
router.get('/', expressAuth, (req: any, res) => {
  res.json({
    success: true,
    message: 'Applications list endpoint - implementation in progress'
  });
});

// Update application status (companies only)
router.put('/:id/status', expressAuth, (req: any, res) => {
  res.json({
    success: true,
    message: 'Update application status endpoint - implementation in progress'
  });
});

export { router as applicationRoutes };