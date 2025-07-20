import express from 'express';
import { expressAuth } from '@rigger/auth/middleware';

const router = express.Router();

// Get worker profiles (for companies to browse)
router.get('/', expressAuth, (req: any, res) => {
  res.json({
    success: true,
    message: 'Worker profiles browse endpoint - implementation in progress'
  });
});

// Get specific worker profile
router.get('/:id', expressAuth, (req: any, res) => {
  res.json({
    success: true,
    message: 'Worker profile details endpoint - implementation in progress'
  });
});

export { router as workerRoutes };