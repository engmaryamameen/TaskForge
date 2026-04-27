import { Role } from './enums';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  createdAt: string;
}

export interface Invite {
  id: string;
  organizationId: string;
  email: string | null;
  role: Role;
  expiresAt: string;
  usedAt: string | null;
  createdBy: string;
  createdAt: string;
}
