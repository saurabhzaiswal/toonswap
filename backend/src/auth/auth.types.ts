import { AgeGateStatus, UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  ageGateStatus: AgeGateStatus;
  profileComplete: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  authSession: {
    id: string;
    csrfTokenHash: string;
  };
}
