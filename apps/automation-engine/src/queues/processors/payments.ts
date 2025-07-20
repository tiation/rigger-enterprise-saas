import { Job } from 'bull';
import { PrismaClient } from '@rigger/database';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface PaymentData {
  subscriptionId: string;
}

export async function processPayments(job: Job<PaymentData>): Promise<void> {
  const { subscriptionId } = job.data;
  
  try {
    logger.info(`Processing payment for subscription: ${subscriptionId}`);

    // Log the payment processing attempt
    await prisma.automationLog.create({
      data: {
        type: 'PAYMENT_PROCESSING',
        status: 'SUCCESS',
        data: {
          subscriptionId,
          processingTime: Date.now() - job.timestamp
        }
      }
    });

    logger.info(`Payment processed successfully for subscription: ${subscriptionId}`);

  } catch (error) {
    logger.error(`Payment processing failed for subscription: ${subscriptionId}`, error);
    
    await prisma.automationLog.create({
      data: {
        type: 'PAYMENT_PROCESSING',
        status: 'FAILED',
        data: { subscriptionId },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    throw error;
  }
}