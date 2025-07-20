import express, { Request, Response } from 'express';
import { addJobMatchingJob, addNotificationJob, addPaymentJob, addComplianceJob } from '../queues';
import { logger } from '../utils/logger';

const router: express.Router = express.Router();

// Trigger job matching for a specific job
router.post('/jobs/:jobId/match', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await addJobMatchingJob(jobId);
    
    logger.info(`Job matching queued for job: ${jobId}`);
    
    res.json({
      success: true,
      message: 'Job matching queued successfully',
      jobId: job.id
    });
  } catch (error) {
    logger.error('Failed to queue job matching:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send notification
router.post('/notifications', async (req: Request, res: Response) => {
  try {
    const { type, recipient, data } = req.body;
    
    if (!type || !recipient) {
      return res.status(400).json({
        success: false,
        error: 'Type and recipient are required'
      });
    }

    const job = await addNotificationJob(type, recipient, data);
    
    logger.info(`Notification queued: ${type} to ${recipient}`);
    
    res.json({
      success: true,
      message: 'Notification queued successfully',
      jobId: job.id
    });
  } catch (error) {
    logger.error('Failed to queue notification:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process payment
router.post('/payments/:subscriptionId/process', async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    const job = await addPaymentJob(subscriptionId);
    
    logger.info(`Payment processing queued for subscription: ${subscriptionId}`);
    
    res.json({
      success: true,
      message: 'Payment processing queued successfully',
      jobId: job.id
    });
  } catch (error) {
    logger.error('Failed to queue payment processing:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check compliance
router.post('/compliance/:workerId/check', async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { type = 'certification' } = req.body;
    
    const job = await addComplianceJob(workerId, type);
    
    logger.info(`Compliance check queued for worker: ${workerId}`);
    
    res.json({
      success: true,
      message: 'Compliance check queued successfully',
      jobId: job.id
    });
  } catch (error) {
    logger.error('Failed to queue compliance check:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get automation statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // This would typically fetch from database
    const stats = {
      totalJobsProcessed: 1247,
      matchesGenerated: 3891,
      notificationsSent: 8234,
      paymentsProcessed: 567,
      complianceChecks: 423,
      averageMatchAccuracy: 87.3,
      systemUptime: process.uptime()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get automation stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as apiRoutes };