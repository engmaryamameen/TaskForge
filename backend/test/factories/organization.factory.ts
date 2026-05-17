import { DataSource } from 'typeorm';
import { randomUUID, randomBytes } from 'crypto';
import { Organization } from '../../src/modules/organizations/entities/organization.entity';
import { Membership } from '../../src/modules/organizations/entities/membership.entity';
import { User } from '../../src/modules/users/entities/user.entity';

export interface CreateOrgOptions {
  name?: string;
  slug?: string;
  createdBy: string;
}

export interface OrgWithMembership {
  organization: Organization;
  membership: Membership;
}

let orgCounter = 0;

/**
 * Creates an organization and makes the specified user an admin member.
 * Also sets the org as the user's currentOrganizationId.
 */
export async function createOrganization(
  dataSource: DataSource,
  options: CreateOrgOptions,
): Promise<OrgWithMembership> {
  orgCounter++;
  const suffix = randomBytes(3).toString('hex');

  const orgRepo = dataSource.getRepository(Organization);
  const membershipRepo = dataSource.getRepository(Membership);
  const userRepo = dataSource.getRepository(User);

  const org = orgRepo.create({
    name: options.name ?? `Test Org ${orgCounter}`,
    slug: options.slug ?? `test-org-${orgCounter}-${suffix}`,
    createdBy: options.createdBy,
  });
  const savedOrg = await orgRepo.save(org);

  const membership = membershipRepo.create({
    userId: options.createdBy,
    organizationId: savedOrg.id,
    role: 'admin',
  });
  const savedMembership = await membershipRepo.save(membership);

  // Set as current org for the user
  await userRepo.update(options.createdBy, {
    currentOrganizationId: savedOrg.id,
  });

  return { organization: savedOrg, membership: savedMembership };
}

/**
 * Adds a user as a member (not admin) to an existing organization.
 */
export async function addMember(
  dataSource: DataSource,
  userId: string,
  organizationId: string,
  role: 'admin' | 'member' = 'member',
): Promise<Membership> {
  const repo = dataSource.getRepository(Membership);
  const membership = repo.create({ userId, organizationId, role });
  return repo.save(membership);
}
