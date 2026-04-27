export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  status: 'active' | 'suspended';
  currentOrganizationId: string | null;
  createdAt: string;
}
