import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@rigger/database';
import { logger } from './utils/logger';

// Import routes
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { companyRoutes } from './routes/companies';
import { jobRoutes } from './routes/jobs';
import { workerRoutes } from './routes/workers';
import { applicationRoutes } from './routes/applications';
import { subscriptionRoutes } from './routes/subscriptions';
import { adminRoutes } from './routes/admin';
import { healthRoutes } from './routes/health';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

// Database connection
const prisma = new PrismaClient();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://tiation.net',
    'https://rigger-connect-marketing-2u22e0tyd-tiations-projects.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { 
  stream: { write: (message) => logger.info(message.trim()) } 
}));

// Health check (before rate limiting)
app.use('/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'RiggerConnect API Gateway',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      companies: '/api/companies',
      jobs: '/api/jobs',
      workers: '/api/workers',
      applications: '/api/applications',
      subscriptions: '/api/subscriptions',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Initialize server
async function initialize() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start server
    app.listen(port, () => {
      logger.info(`🚀 API Gateway started on port ${port}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔒 CORS enabled for: ${process.env.CORS_ORIGINS || 'localhost'}`);
      logger.info(`⚡ Rate limit: ${process.env.RATE_LIMIT_MAX || 100} requests per ${parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000 / 60} minutes`);
      logger.info('🛡️  Security middleware active');
      logger.info('📊 Logging and monitoring enabled');
    });

  } catch (error) {
    logger.error('Failed to initialize API Gateway:', error);
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