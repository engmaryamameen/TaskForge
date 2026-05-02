import { Role } from './enums';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationWithRole extends Organization {
  role: Role;
}

export interface MemberUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  user?: MemberUser;
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

/** Active (unused, unexpired) invite returned from GET /organizations/invites */
export interface PendingInvite {
  id: string;
  email: string | null;
  role: string;
  expiresAt: string;
  createdAt: string;
}
