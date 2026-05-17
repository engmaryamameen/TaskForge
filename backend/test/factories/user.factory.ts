import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { User } from '../../src/modules/users/entities/user.entity';

export interface CreateUserOptions {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  emailVerifiedAt?: Date | null;
  status?: 'active' | 'suspended';
  currentOrganizationId?: string | null;
}

export interface CreatedUser {
  user: User;
  /** The plaintext password — use this for login tests */
  password: string;
}

let counter = 0;

/**
 * Creates a user directly in the database, bypassing application logic.
 * Use for setting up test preconditions — NOT for testing registration flow.
 */
export async function createUser(
  dataSource: DataSource,
  options: CreateUserOptions = {},
): Promise<CreatedUser> {
  counter++;
  const password = options.password ?? 'TestPassword123!';
  const passwordHash = await argon2.hash(password);

  const repo = dataSource.getRepository(User);
  const user = repo.create({
    email: options.email ?? `testuser-${counter}-${randomUUID().slice(0, 8)}@test.local`,
    passwordHash,
    firstName: options.firstName ?? 'Test',
    lastName: options.lastName ?? `User${counter}`,
    emailVerifiedAt: options.emailVerifiedAt !== undefined ? options.emailVerifiedAt : new Date(),
    status: options.status ?? 'active',
    currentOrganizationId: options.currentOrganizationId ?? null,
  });

  const saved = await repo.save(user);
  return { user: saved, password };
}

/**
 * Creates a verified, active user ready for login.
 */
export async function createVerifiedUser(
  dataSource: DataSource,
  options: CreateUserOptions = {},
): Promise<CreatedUser> {
  return createUser(dataSource, {
    emailVerifiedAt: new Date(),
    status: 'active',
    ...options,
  });
}

/**
 * Creates a user pending email verification.
 */
export async function createUnverifiedUser(
  dataSource: DataSource,
  options: CreateUserOptions = {},
): Promise<CreatedUser> {
  return createUser(dataSource, {
    emailVerifiedAt: null,
    ...options,
  });
}
