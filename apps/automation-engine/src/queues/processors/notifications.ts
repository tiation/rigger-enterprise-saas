import { Job } from 'bull';
import { PrismaClient } from '@rigger/database';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface NotificationData {
  type: string;
  recipient: string;
  data: any;
}

export async function processNotifications(job: Job<NotificationData>): Promise<void> {
  const { type, recipient, data } = job.data;
  
  try {
    logger.info(`Processing notification: ${type} to ${recipient}`);

    // Log the notification attempt
    await prisma.automationLog.create({
      data: {
        type: 'NOTIFICATION_SENT',
        status: 'SUCCESS',
        data: {
          type,
          recipient,
          notificationData: data
        }
      }
    });

    logger.info(`Notification processed successfully: ${type} to ${recipient}`);

  } catch (error) {
    logger.error(`Notification processing failed: ${type} to ${recipient}`, error);
    
    await prisma.automationLog.create({
      data: {
        type: 'NOTIFICATION_SENT',
        status: 'FAILED',
        data: { type, recipient },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    throw error;
  }
}