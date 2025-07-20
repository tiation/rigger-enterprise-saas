import express, { Request, Response, NextFunction } from 'express';
import { AuthService } from './index';
import { PrismaClient } from '@rigger/database';

const prisma = new PrismaClient();

// Initialize auth service
const authService = new AuthService(
  prisma,
  process.env.JWT_SECRET || 'fallback_secret',
  process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret'
);

// Express.js middleware types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

export function expressAuth(req: any, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies['access-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = authService.verifyAccessToken(token);
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function expressRequireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: any, res: Response, next: NextFunction) => {
    return expressAuth(req, res, () => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      return next();
    });
  };
}

export function expressRequireCompanyAccess(req: any, res: Response, next: NextFunction) {
  return expressAuth(req, res, () => {
    if (!req.user?.companyId) {
      return res.status(403).json({ error: 'Company access required' });
    }
    return next();
  });
}