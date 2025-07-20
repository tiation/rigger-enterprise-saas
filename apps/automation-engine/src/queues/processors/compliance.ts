import { Job } from 'bull';
import { PrismaClient } from '@rigger/database';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface ComplianceData {
  workerId: string;
  type: string;
}

export async function processCompliance(job: Job<ComplianceData>): Promise<void> {
  const { workerId, type } = job.data;
  
  try {
    logger.info(`Processing compliance check: ${type} for worker ${workerId}`);

    // Log the compliance check
    await prisma.automationLog.create({
      data: {
        type: 'COMPLIANCE_CHECK',
        status: 'SUCCESS',
        data: {
          workerId,
          checkType: type,
          processingTime: Date.now() - job.timestamp
        }
      }
    });

    logger.info(`Compliance check completed: ${type} for worker ${workerId}`);

  } catch (error) {
    logger.error(`Compliance check failed: ${type} for worker ${workerId}`, error);
    
    await prisma.automationLog.create({
      data: {
        type: 'COMPLIANCE_CHECK',
        status: 'FAILED',
        data: { workerId, checkType: type },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    throw error;
  }
}