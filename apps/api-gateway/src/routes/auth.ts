import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@rigger/database';
import { AuthService } from '@rigger/auth';
import { expressAuth } from '@rigger/auth/middleware';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

const authService = new AuthService(
  prisma,
  process.env.JWT_SECRET!,
  process.env.REFRESH_TOKEN_SECRET!
);

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').isIn(['COMPANY_OWNER', 'WORKER']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, role, phone, companyName, abn } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role,
        status: 'PENDING_VERIFICATION'
      }
    });

    // Create company if company owner
    if (role === 'COMPANY_OWNER' && companyName) {
      const company = await prisma.company.create({
        data: {
          name: companyName,
          abn: abn || '',
          status: 'PENDING_VERIFICATION'
        }
      });

      // Associate user with company
      await prisma.companyUser.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'OWNER'
        }
      });
    }

    // Create worker profile if worker
    if (role === 'WORKER') {
      await prisma.workerProfile.create({
        data: {
          userId: user.id,
          status: 'INACTIVE' // Will be active after verification
        }
      });
    }

    logger.info(`User registered: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        companies: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Account not active',
        status: user.status
      });
    }

    // Generate tokens
    const authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companies[0]?.companyId
    };

    const tokens = authService.generateTokens(authUser);

    // Create session
    await authService.createSession(user.id, tokens.refreshToken);

    // Set cookies
    res.cookie('access-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expiresIn,
      sameSite: 'lax'
    });

    res.cookie('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: authUser.companyId
        },
        tokens: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies['refresh-token'] || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = authService.verifyRefreshToken(refreshToken);

    // Validate session
    const isValidSession = await authService.validateSession(refreshToken);
    if (!isValidSession) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        companies: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companies[0]?.companyId
    };

    const tokens = authService.generateTokens(authUser);

    // Update session
    await authService.revokeSession(refreshToken);
    await authService.createSession(user.id, tokens.refreshToken);

    // Set new cookies
    res.cookie('access-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expiresIn,
      sameSite: 'lax'
    });

    res.cookie('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

// Logout
router.post('/logout', expressAuth, async (req: any, res) => {
  try {
    const refreshToken = req.cookies['refresh-token'];

    if (refreshToken) {
      await authService.revokeSession(refreshToken);
    }

    // Clear cookies
    res.clearCookie('access-token');
    res.clearCookie('refresh-token');

    logger.info(`User logged out: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Get current user
router.get('/me', expressAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        companies: {
          include: {
            company: true
          }
        },
        workerProfile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            },
            certifications: {
              where: { status: 'ACTIVE' },
              include: {
                certification: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
        companies: user.companies,
        workerProfile: user.workerProfile,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

export { router as authRoutes };