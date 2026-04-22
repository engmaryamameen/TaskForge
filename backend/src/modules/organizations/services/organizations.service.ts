import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes } from 'crypto';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { MembershipsService } from './memberships.service';
import { UsersService } from '../../users/services/users.service';
import { CreateOrganizationDto } from '../dto';
import { Organization } from '../entities/organization.entity';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { EventType, Role } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createOrganization(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<Organization> {
    const slug = await this.generateUniqueSlug(dto.name);

    const org = await this.organizationsRepository.create({
      name: dto.name,
      slug,
      createdBy: userId,
    });

    // Creator becomes admin
    await this.membershipsService.createMembership(
      userId,
      org.id,
      Role.ADMIN,
    );

    // Set as user's current organization
    await this.usersService.updateCurrentOrg(userId, org.id);

    // Fetch creator email for billing initialization
    const creator = await this.usersService.findById(userId);

    this.logger.log(`Organization created: ${org.id} (${slug}) by ${userId}`);

    this.eventEmitter.emit(EventType.ORGANIZATION_CREATED, {
      type: EventType.ORGANIZATION_CREATED,
      payload: {
        entityId: org.id,
        organizationId: org.id,
        slug,
        orgName: org.name,
        creatorEmail: creator?.email,
      },
      occurredAt: new Date(),
      organizationId: org.id,
      triggeredBy: userId,
    } satisfies DomainEvent);

    return org;
  }

  async findById(id: string): Promise<Organization | null> {
    return this.organizationsRepository.findById(id);
  }

  async listUserOrganizations(userId: string) {
    const memberships =
      await this.membershipsService.listUserMemberships(userId);
    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }));
  }

  async switchOrganization(userId: string, organizationId: string) {
    const membership = await this.membershipsService.getMembership(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new AppError(
        ErrorCodes.NOT_A_MEMBER,
        'Not a member of this organization',
        403,
      );
    }

    await this.usersService.updateCurrentOrg(userId, organizationId);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);

    if (!(await this.organizationsRepository.slugExists(base))) {
      return base;
    }

    // Append random suffix if taken, retry up to 3 times
    for (let i = 0; i < 3; i++) {
      const suffix = randomBytes(2).toString('hex');
      const candidate = `${base}-${suffix}`;
      if (!(await this.organizationsRepository.slugExists(candidate))) {
        return candidate;
      }
    }

    throw new AppError(
      ErrorCodes.ORG_SLUG_TAKEN,
      'Unable to generate a unique slug. Please choose a different name.',
      409,
    );
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
