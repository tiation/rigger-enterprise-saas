import Queue from 'bull';
import Redis from 'redis';
import { logger } from '../utils/logger';
import { processJobMatching } from '../processors/jobMatching';
import { processNotifications } from '../processors/notifications';
import { processPayments } from '../processors/payments';
import { processCompliance } from '../processors/compliance';

// Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
};

// Job Queues
export const jobMatchingQueue = new Queue('job-matching', { redis: redisConfig });
export const notificationQueue = new Queue('notifications', { redis: redisConfig });
export const paymentQueue = new Queue('payments', { redis: redisConfig });
export const complianceQueue = new Queue('compliance', { redis: redisConfig });

// Queue processors
jobMatchingQueue.process('match-workers-to-job', 5, processJobMatching);
notificationQueue.process('send-notification', 10, processNotifications);
paymentQueue.process('process-payment', 3, processPayments);
complianceQueue.process('check-compliance', 2, processCompliance);

// Queue event handlers
function setupQueueEvents(queue: Queue.Queue, name: string) {
  queue.on('completed', (job) => {
    logger.info(`${name} job completed:`, { jobId: job.id, data: job.data });
  });

  queue.on('failed', (job, err) => {
    logger.error(`${name} job failed:`, { jobId: job.id, error: err.message });
  });

  queue.on('stalled', (job) => {
    logger.warn(`${name} job stalled:`, { jobId: job.id });
  });
}

export async function initializeQueues() {
  try {
    // Test Redis connection
    const redis = Redis.createClient(redisConfig);
    await redis.connect();
    await redis.ping();
    await redis.disconnect();

    // Setup event handlers
    setupQueueEvents(jobMatchingQueue, 'Job Matching');
    setupQueueEvents(notificationQueue, 'Notifications');
    setupQueueEvents(paymentQueue, 'Payments');
    setupQueueEvents(complianceQueue, 'Compliance');

    // Clean old jobs
    await Promise.all([
      jobMatchingQueue.clean(24 * 60 * 60 * 1000, 'completed'),
      notificationQueue.clean(24 * 60 * 60 * 1000, 'completed'),
      paymentQueue.clean(7 * 24 * 60 * 60 * 1000, 'completed'),
      complianceQueue.clean(30 * 24 * 60 * 60 * 1000, 'completed')
    ]);

    logger.info('Job queues initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize job queues:', error);
    throw error;
  }
}

// Helper functions to add jobs
export async function addJobMatchingJob(jobId: string, options = {}) {
  return jobMatchingQueue.add('match-workers-to-job', { jobId }, {
    delay: 5 * 60 * 1000, // 5 minute delay
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 10,
    removeOnFail: 5,
    ...options
  });
}

export async function addNotificationJob(type: string, recipient: string, data: any, options = {}) {
  return notificationQueue.add('send-notification', { type, recipient, data }, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 50,
    removeOnFail: 10,
    ...options
  });
}

export async function addPaymentJob(subscriptionId: string, options = {}) {
  return paymentQueue.add('process-payment', { subscriptionId }, {
    attempts: 3,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: 20,
    removeOnFail: 10,
    ...options
  });
}

export async function addComplianceJob(workerId: string, type: string, options = {}) {
  return complianceQueue.add('check-compliance', { workerId, type }, {
    delay: 60 * 60 * 1000, // 1 hour delay
    attempts: 2,
    removeOnComplete: 5,
    removeOnFail: 5,
    ...options
  });
}