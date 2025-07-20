import express from 'express';
import { PrismaClient } from '@rigger/database';

const router = express.Router();
const prisma = new PrismaClient();

// Basic health check
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'api-gateway',
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'disconnected'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    // Database metrics
    const [userCount, companyCount, jobCount] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } })
    ]);

    // System metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
      metrics: {
        database: {
          status: 'connected',
          users: userCount,
          companies: companyCount,
          activeJobs: jobCount
        },
        system: {
          uptime: `${Math.floor(uptime / 60)} minutes`,
          memory: {
            used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
          },
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as healthRoutes };