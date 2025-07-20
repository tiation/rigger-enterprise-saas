import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './index';
import { PrismaClient } from '@rigger/database';

const prisma = new PrismaClient();

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

// Initialize auth service
const authService = new AuthService(
  prisma,
  process.env.JWT_SECRET || 'fallback_secret',
  process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret'
);

export async function withAuth(request: NextRequest): Promise<NextResponse | { user: any }> {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = request.cookies.get('access-token')?.value || 
                 (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = authService.verifyAccessToken(token);
    
    // Validate session in database
    const isValidSession = await authService.validateSession(token);
    if (!isValidSession) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    return { user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export function requireAuth(handler: (request: AuthRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await withAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    // Attach user to request
    const authRequest = request as AuthRequest;
    authRequest.user = authResult.user;

    return handler(authRequest);
  };
}

export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (handler: (request: AuthRequest) => Promise<NextResponse>) => {
    return requireAuth(async (request: AuthRequest): Promise<NextResponse> => {
      if (!request.user || !allowedRoles.includes(request.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      
      return handler(request);
    });
  };
}

export function requireCompanyAccess(handler: (request: AuthRequest) => Promise<NextResponse>) {
  return requireAuth(async (request: AuthRequest): Promise<NextResponse> => {
    if (!request.user?.companyId) {
      return NextResponse.json({ error: 'Company access required' }, { status: 403 });
    }
    
    return handler(request);
  });
}

// Express.js middleware versions
export function expressAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies['access-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = authService.verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function expressRequireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: any, res: any, next: any) => {
    expressAuth(req, res, () => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    });
  };
}

export function expressRequireCompanyAccess(req: any, res: any, next: any) {
  expressAuth(req, res, () => {
    if (!req.user?.companyId) {
      return res.status(403).json({ error: 'Company access required' });
    }
    next();
  });
}