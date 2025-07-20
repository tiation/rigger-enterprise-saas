import cron from 'node-cron';
import { PrismaClient } from '@rigger/database';
import { logger } from '../utils/logger';
import { addJobMatchingJob, addPaymentJob, addComplianceJob, addNotificationJob } from '../queues';

const prisma = new PrismaClient();

export async function initializeScheduledJobs() {
  logger.info('Initializing scheduled jobs...');

  // Job matching - runs every 15 minutes for new jobs
  cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('Running scheduled job matching...');
      
      const recentJobs = await prisma.job.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
          }
        },
        select: { id: true }
      });

      for (const job of recentJobs) {
        await addJobMatchingJob(job.id, { delay: Math.random() * 5 * 60 * 1000 }); // Random delay up to 5 minutes
      }

      logger.info(`Queued job matching for ${recentJobs.length} recent jobs`);
    } catch (error) {
      logger.error('Scheduled job matching failed:', error);
    }
  });

  // Payment processing - runs daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Running scheduled payment processing...');
      
      const dueSubscriptions = await prisma.companySubscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: {
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due in next 24 hours
          }
        },
        select: { id: true }
      });

      for (const subscription of dueSubscriptions) {
        await addPaymentJob(subscription.id);
      }

      logger.info(`Queued payment processing for ${dueSubscriptions.length} subscriptions`);
    } catch (error) {
      logger.error('Scheduled payment processing failed:', error);
    }
  });

  // Compliance checks - runs daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    try {
      logger.info('Running scheduled compliance checks...');
      
      // Check for expiring certifications (30 days notice)
      const workersWithExpiringCerts = await prisma.workerCertification.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
            gte: new Date() // Not already expired
          }
        },
        select: { workerProfileId: true },
        distinct: ['workerProfileId']
      });

      for (const worker of workersWithExpiringCerts) {
        await addComplianceJob(worker.workerProfileId, 'certification-expiry');
      }

      logger.info(`Queued compliance checks for ${workersWithExpiringCerts.length} workers`);
    } catch (error) {
      logger.error('Scheduled compliance checks failed:', error);
    }
  });

  // Weekly analytics and reporting - runs Sundays at 6 AM
  cron.schedule('0 6 * * 0', async () => {
    try {
      logger.info('Running weekly analytics and reporting...');
      
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Generate weekly metrics
      const metrics = {
        newJobs: await prisma.job.count({
          where: { createdAt: { gte: lastWeek } }
        }),
        newApplications: await prisma.jobApplication.count({
          where: { createdAt: { gte: lastWeek } }
        }),
        newUsers: await prisma.user.count({
          where: { createdAt: { gte: lastWeek } }
        }),
        matchesGenerated: await prisma.jobMatch.count({
          where: { createdAt: { gte: lastWeek } }
        })
      };

      // Send weekly report to admins
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true }
      });

      for (const admin of admins) {
        await addNotificationJob(
          'weekly-report',
          admin.email,
          {
            period: 'weekly',
            metrics,
            reportDate: new Date().toISOString()
          }
        );
      }

      logger.info('Weekly analytics and reporting completed');
    } catch (error) {
      logger.error('Weekly analytics and reporting failed:', error);
    }
  });

  // Database cleanup - runs daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Running database cleanup...');
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // Clean old audit logs (keep 90 days)
      const deletedAuditLogs = await prisma.auditLog.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } }
      });

      // Clean old automation logs (keep 30 days)
      const deletedAutomationLogs = await prisma.automationLog.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } }
      });

      // Clean old expired sessions
      const deletedSessions = await prisma.userSession.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      });

      logger.info(`Database cleanup completed: ${deletedAuditLogs.count} audit logs, ${deletedAutomationLogs.count} automation logs, ${deletedSessions.count} expired sessions`);
    } catch (error) {
      logger.error('Database cleanup failed:', error);
    }
  });

  // Health check and monitoring - runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Log system health metrics
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
        logger.warn('High memory usage detected', { memoryUsage, uptime });
      }

      // Check for stuck jobs (running for more than 30 minutes)
      const stuckJobs = await prisma.automationLog.findMany({
        where: {
          status: 'RUNNING',
          createdAt: {
            lt: new Date(Date.now() - 30 * 60 * 1000)
          }
        }
      });

      if (stuckJobs.length > 0) {
        logger.warn(`Found ${stuckJobs.length} potentially stuck jobs`);
      }

    } catch (error) {
      logger.error('Health check failed:', error);
    }
  });

  logger.info('All scheduled jobs initialized successfully');
}