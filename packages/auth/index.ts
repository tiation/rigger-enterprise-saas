import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@rigger/database';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  companyId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;
  private refreshSecret: string;

  constructor(prisma: PrismaClient, jwtSecret: string, refreshSecret: string) {
    this.prisma = prisma;
    this.jwtSecret = jwtSecret;
    this.refreshSecret = refreshSecret;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateTokens(user: AuthUser): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '15m',
      issuer: 'rigger-enterprise',
      audience: 'rigger-users'
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      this.refreshSecret,
      {
        expiresIn: '7d',
        issuer: 'rigger-enterprise',
        audience: 'rigger-users'
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 * 1000 // 15 minutes in milliseconds
    };
  }

  verifyAccessToken(token: string): AuthUser {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'rigger-enterprise',
        audience: 'rigger-users'
      }) as any;

      return {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        companyId: decoded.companyId
      };
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        issuer: 'rigger-enterprise',
        audience: 'rigger-users'
      }) as any;

      return { userId: decoded.userId };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async createSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.userSession.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
  }

  async validateSession(token: string): Promise<boolean> {
    const session = await this.prisma.userSession.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async revokeSession(token: string): Promise<void> {
    await this.prisma.userSession.delete({
      where: { token }
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: { userId }
    });
  }
}

export * from './guards';
export * from './middleware';