// ==========================
// USER TYPES
// ==========================
export type UserRole = 'ADMIN' | 'COMPANY_OWNER' | 'COMPANY_MANAGER' | 'WORKER' | 'SYSTEM';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  passwordHash?: string;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==========================
// COMPANY TYPES
// ==========================
export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
export type CompanyUserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface Company {
  id: string;
  name: string;
  abn: string;
  status: CompanyStatus;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  website?: string;
  logo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyUserRole;
  createdAt: Date;
  updatedAt: Date;
  company: Company;
  user: User;
}

// ==========================
// WORKER TYPES
// ==========================
export type WorkerStatus = 'AVAILABLE' | 'BUSY' | 'INACTIVE' | 'SUSPENDED';
export type CertificationStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING';

export interface WorkerProfile {
  id: string;
  userId: string;
  status: WorkerStatus;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  yearsExp?: number;
  hourlyRate?: number;
  city?: string;
  state?: string;
  postcode?: string;
  travelRadius?: number;
  user: User;
  skills: WorkerSkill[];
  certifications: WorkerCertification[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: Date;
}

export interface WorkerSkill {
  id: string;
  workerProfileId: string;
  skillId: string;
  proficiency: number;
  yearsExp?: number;
  createdAt: Date;
  skill: Skill;
}

export interface Certification {
  id: string;
  name: string;
  category: string;
  authority: string;
  description?: string;
  validityPeriod?: number;
  createdAt: Date;
}

export interface WorkerCertification {
  id: string;
  workerProfileId: string;
  certificationId: string;
  status: CertificationStatus;
  issuedAt?: Date;
  expiresAt?: Date;
  certificationNumber?: string;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  certification: Certification;
}

// ==========================
// JOB TYPES
// ==========================
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY';
export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'INTERVIEWED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  status: JobStatus;
  type: JobType;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  payRate?: number;
  payType?: string;
  startDate?: Date;
  endDate?: Date;
  hoursPerWeek?: number;
  city: string;
  state: string;
  postcode: string;
  isRemote: boolean;
  maxApplicants?: number;
  applicationDeadline?: Date;
  company: Company;
  skills: JobSkill[];
  applications: JobApplication[];
}

export interface JobSkill {
  id: string;
  jobId: string;
  skillId: string;
  required: boolean;
  minExp?: number;
  createdAt: Date;
  skill: Skill;
}

export interface JobApplication {
  id: string;
  jobId: string;
  workerProfileId: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  coverLetter?: string;
  proposedRate?: number;
  availableFrom?: Date;
  job: Job;
  workerProfile: WorkerProfile;
}

// ==========================
// SUBSCRIPTION TYPES
// ==========================
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  interval: string;
  jobPostLimit?: number;
  features: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface CompanySubscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  stripeId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
  company: Company;
  plan: SubscriptionPlan;
}

// ==========================
// API RESPONSE TYPES
// ==========================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  q?: string;
  filters?: Record<string, any>;
}

// ==========================
// AUTOMATION TYPES
// ==========================
export interface JobMatch {
  id: string;
  jobId: string;
  workerProfileId: string;
  score: number;
  reasons: Record<string, any>;
  createdAt: Date;
}

export interface AutomationLog {
  id: string;
  type: string;
  status: string;
  data?: Record<string, any>;
  error?: string;
  createdAt: Date;
}

export interface NotificationData {
  type: string;
  recipient: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
  scheduledFor?: Date;
}

// ==========================
// DASHBOARD TYPES
// ==========================
export interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  workersHired: number;
  avgTimeToHire: string;
}

export interface WorkerDashboardStats {
  activeJobs: number;
  totalEarnings: number;
  hoursWorked: number;
  jobsCompleted: number;
}

export interface CompanyMetrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalApplications: number;
  hiredWorkers: number;
  averageTimeToHire: number;
  monthlySpend: number;
  topSkills: Array<{ skill: string; demand: number }>;
}

// ==========================
// FORM TYPES
// ==========================
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  companyName?: string;
  abn?: string;
}

export interface JobPostForm {
  title: string;
  description: string;
  type: JobType;
  payRate?: number;
  payType?: string;
  startDate?: Date;
  endDate?: Date;
  hoursPerWeek?: number;
  city: string;
  state: string;
  postcode: string;
  isRemote: boolean;
  maxApplicants?: number;
  applicationDeadline?: Date;
  skills: Array<{
    skillId: string;
    required: boolean;
    minExp?: number;
  }>;
}

export interface WorkerProfileForm {
  bio?: string;
  yearsExp?: number;
  hourlyRate?: number;
  city?: string;
  state?: string;
  postcode?: string;
  travelRadius?: number;
  skills: Array<{
    skillId: string;
    proficiency: number;
    yearsExp?: number;
  }>;
}