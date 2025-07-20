import { UserRole } from '@rigger/types';

export class AuthGuard {
  /**
   * Check if user has required role
   */
  static hasRole(userRole: UserRole, requiredRoles: UserRole | UserRole[]): boolean {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(userRole);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(userRole: UserRole): boolean {
    return userRole === 'ADMIN';
  }

  /**
   * Check if user is company owner or admin
   */
  static isCompanyOwnerOrAdmin(userRole: UserRole): boolean {
    return ['ADMIN', 'COMPANY_OWNER'].includes(userRole);
  }

  /**
   * Check if user can manage company
   */
  static canManageCompany(userRole: UserRole): boolean {
    return ['ADMIN', 'COMPANY_OWNER', 'COMPANY_MANAGER'].includes(userRole);
  }

  /**
   * Check if user is a worker
   */
  static isWorker(userRole: UserRole): boolean {
    return userRole === 'WORKER';
  }

  /**
   * Check if user can access business portal
   */
  static canAccessBusinessPortal(userRole: UserRole): boolean {
    return ['ADMIN', 'COMPANY_OWNER', 'COMPANY_MANAGER'].includes(userRole);
  }

  /**
   * Check if user can access worker portal
   */
  static canAccessWorkerPortal(userRole: UserRole): boolean {
    return userRole === 'WORKER';
  }

  /**
   * Check if user can post jobs
   */
  static canPostJobs(userRole: UserRole): boolean {
    return ['ADMIN', 'COMPANY_OWNER', 'COMPANY_MANAGER'].includes(userRole);
  }

  /**
   * Check if user can manage workers
   */
  static canManageWorkers(userRole: UserRole): boolean {
    return ['ADMIN', 'COMPANY_OWNER'].includes(userRole);
  }

  /**
   * Check if user can view analytics
   */
  static canViewAnalytics(userRole: UserRole): boolean {
    return ['ADMIN', 'COMPANY_OWNER', 'COMPANY_MANAGER'].includes(userRole);
  }

  /**
   * Check if user can manage subscriptions
   */
  static canManageSubscriptions(userRole: UserRole): boolean {
    return ['ADMIN', 'COMPANY_OWNER'].includes(userRole);
  }

  /**
   * Check if user belongs to company and has required role
   */
  static belongsToCompanyWithRole(
    userCompanyId: string | undefined,
    targetCompanyId: string,
    userRole: UserRole,
    requiredRoles: UserRole | UserRole[]
  ): boolean {
    // Admins can access any company
    if (userRole === 'ADMIN') {
      return true;
    }

    // Check if user belongs to the target company
    if (userCompanyId !== targetCompanyId) {
      return false;
    }

    // Check if user has required role
    return this.hasRole(userRole, requiredRoles);
  }

  /**
   * Check if user can access resource
   */
  static canAccessResource(
    userRole: UserRole,
    resource: 'jobs' | 'workers' | 'companies' | 'analytics' | 'subscriptions' | 'admin',
    action: 'read' | 'write' | 'delete' = 'read'
  ): boolean {
    const permissions = {
      ADMIN: {
        jobs: ['read', 'write', 'delete'],
        workers: ['read', 'write', 'delete'],
        companies: ['read', 'write', 'delete'],
        analytics: ['read', 'write', 'delete'],
        subscriptions: ['read', 'write', 'delete'],
        admin: ['read', 'write', 'delete']
      },
      COMPANY_OWNER: {
        jobs: ['read', 'write', 'delete'],
        workers: ['read', 'write'],
        companies: ['read', 'write'],
        analytics: ['read'],
        subscriptions: ['read', 'write'],
        admin: []
      },
      COMPANY_MANAGER: {
        jobs: ['read', 'write'],
        workers: ['read'],
        companies: ['read'],
        analytics: ['read'],
        subscriptions: ['read'],
        admin: []
      },
      WORKER: {
        jobs: ['read'],
        workers: ['read'], // Only own profile
        companies: [],
        analytics: [],
        subscriptions: [],
        admin: []
      },
      SYSTEM: {
        jobs: ['read', 'write', 'delete'],
        workers: ['read', 'write', 'delete'],
        companies: ['read', 'write', 'delete'],
        analytics: ['read', 'write', 'delete'],
        subscriptions: ['read', 'write', 'delete'],
        admin: ['read', 'write', 'delete']
      }
    };

    const userPermissions = permissions[userRole];
    if (!userPermissions || !userPermissions[resource]) {
      return false;
    }

    return userPermissions[resource].includes(action);
  }

  /**
   * Check if user can access specific job
   */
  static canAccessJob(
    userRole: UserRole,
    userCompanyId: string | undefined,
    jobCompanyId: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): boolean {
    // Admins and workers can read any job
    if (action === 'read' && ['ADMIN', 'WORKER'].includes(userRole)) {
      return true;
    }

    // For write/delete actions or company users, check company membership
    return this.belongsToCompanyWithRole(
      userCompanyId,
      jobCompanyId,
      userRole,
      action === 'delete' 
        ? ['ADMIN', 'COMPANY_OWNER']
        : ['ADMIN', 'COMPANY_OWNER', 'COMPANY_MANAGER']
    );
  }

  /**
   * Check if user can access specific worker profile
   */
  static canAccessWorkerProfile(
    userRole: UserRole,
    userCompanyId: string | undefined,
    userId: string,
    targetUserId: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): boolean {
    // Users can always access their own profile
    if (userId === targetUserId) {
      return true;
    }

    // Admins can access any profile
    if (userRole === 'ADMIN') {
      return true;
    }

    // Company owners and managers can read worker profiles
    if (action === 'read' && this.canManageCompany(userRole)) {
      return true;
    }

    // Only admins can write/delete other user profiles
    return false;
  }
}

export default AuthGuard;