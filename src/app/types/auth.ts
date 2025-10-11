// src/app/types/auth.ts

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  HIRING_MANAGER = 'hiring_manager',
  CLIENT = 'client',
  CANDIDATE = 'candidate'
}

export interface User {
  id: string;
  email: string;
  password?: string; // Hashed password
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;

  // Profile Information
  phone?: string;
  avatar?: string;
  title?: string;
  department?: string;

  // Company Association (for clients and hiring managers)
  companyId?: string;

  // Permissions
  permissions?: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  invitedBy?: string;
  inviteToken?: string;
  inviteAcceptedAt?: Date;

  // Security
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions?: string[];
    companyId?: string;
  };
  expires: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  inviteToken: string;
  expiresAt: Date;
  acceptedAt?: Date;
  companyId?: string;
  createdAt: Date;
}

// Permission definitions
export const PERMISSIONS = {
  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  // Candidate Management
  CANDIDATE_VIEW: 'candidate:view',
  CANDIDATE_CREATE: 'candidate:create',
  CANDIDATE_EDIT: 'candidate:edit',
  CANDIDATE_DELETE: 'candidate:delete',

  // Job Management
  JOB_VIEW: 'job:view',
  JOB_CREATE: 'job:create',
  JOB_EDIT: 'job:edit',
  JOB_DELETE: 'job:delete',
  JOB_PUBLISH: 'job:publish',

  // Application Management
  APPLICATION_VIEW: 'application:view',
  APPLICATION_PROCESS: 'application:process',
  APPLICATION_REJECT: 'application:reject',
  APPLICATION_APPROVE: 'application:approve',

  // Company Management
  COMPANY_VIEW: 'company:view',
  COMPANY_CREATE: 'company:create',
  COMPANY_EDIT: 'company:edit',
  COMPANY_DELETE: 'company:delete',

  // Reports & Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // System Administration
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
} as const;

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [UserRole.ADMIN]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.CANDIDATE_VIEW,
    PERMISSIONS.CANDIDATE_CREATE,
    PERMISSIONS.CANDIDATE_EDIT,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_EDIT,
    PERMISSIONS.JOB_PUBLISH,
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_PROCESS,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_CREATE,
    PERMISSIONS.COMPANY_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  [UserRole.RECRUITER]: [
    PERMISSIONS.CANDIDATE_VIEW,
    PERMISSIONS.CANDIDATE_CREATE,
    PERMISSIONS.CANDIDATE_EDIT,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_PROCESS,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],

  [UserRole.HIRING_MANAGER]: [
    PERMISSIONS.CANDIDATE_VIEW,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_PROCESS,
  ],

  [UserRole.CLIENT]: [
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_EDIT,
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.CANDIDATE_VIEW,
  ],

  [UserRole.CANDIDATE]: [
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.APPLICATION_VIEW,
  ],
};

// Helper function to check if user has permission
export function hasPermission(user: Session['user'], permission: string): boolean {
  if (user.role === UserRole.SUPER_ADMIN) return true;

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const userPermissions = user.permissions || [];

  return rolePermissions.includes(permission) || userPermissions.includes(permission);
}