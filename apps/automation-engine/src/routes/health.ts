import express from 'express';
import { PrismaClient } from '@rigger/database';
import { jobMatchingQueue, notificationQueue, paymentQueue, complianceQueue } from '../queues';

const router: express.Router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check queue health
    const queueStats = {
      jobMatching: await jobMatchingQueue.getJobCounts(),
      notifications: await notificationQueue.getJobCounts(),
      payments: await paymentQueue.getJobCounts(),
      compliance: await complianceQueue.getJobCounts()
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      queues: queueStats
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/detailed', async (req, res) => {
  try {
    // Database metrics
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    const activeJobs = await prisma.job.count({ where: { status: 'PUBLISHED' } });
    const recentMatches = await prisma.jobMatch.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    // Queue metrics
    const queueDetails = {
      jobMatching: {
        waiting: (await jobMatchingQueue.getWaiting()).length,
        active: (await jobMatchingQueue.getActive()).length,
        completed: (await jobMatchingQueue.getCompleted()).length,
        failed: (await jobMatchingQueue.getFailed()).length
      },
      notifications: {
        waiting: (await notificationQueue.getWaiting()).length,
        active: (await notificationQueue.getActive()).length,
        completed: (await notificationQueue.getCompleted()).length,
        failed: (await notificationQueue.getFailed()).length
      }
    };

    // System metrics
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        database: {
          users: userCount,
          companies: companyCount,
          activeJobs,
          recentMatches
        },
        queues: queueDetails,
        system: systemInfo
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as healthRoutes };