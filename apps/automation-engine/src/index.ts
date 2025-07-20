import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@rigger/database';
import { logger } from './utils/logger';
import { initializeQueues } from './queues';
import { initializeScheduledJobs } from './scheduler';
import { apiRoutes } from './routes/api';
import { healthRoutes } from './routes/health';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Database connection
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/api', apiRoutes);

// Error handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Initialize automation systems
async function initialize() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Initialize job queues
    await initializeQueues();
    logger.info('Job queues initialized');

    // Initialize scheduled jobs
    await initializeScheduledJobs();
    logger.info('Scheduled jobs initialized');

    // Start server
    app.listen(port, () => {
      logger.info(`🤖 Automation Engine started on port ${port}`);
      logger.info('🔧 Background business operations running');
      logger.info('📊 AI-powered job matching active');
      logger.info('💳 Payment processing automated');
      logger.info('📧 Communication systems online');
    });

  } catch (error) {
    logger.error('Failed to initialize automation engine:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

initialize();