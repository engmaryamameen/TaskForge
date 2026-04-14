import { Injectable, Logger } from '@nestjs/common';
import { MembershipsRepository } from '../repositories/memberships.repository';
import { Membership } from '../entities/membership.entity';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);

  constructor(private readonly membershipsRepository: MembershipsRepository) {}

  async createMembership(
    userId: string,
    organizationId: string,
    role: string,
  ): Promise<Membership> {
    const existing = await this.membershipsRepository.findByUserAndOrg(
      userId,
      organizationId,
    );

    if (existing) {
      throw new AppError(
        ErrorCodes.ALREADY_MEMBER,
        'User is already a member of this organization',
        409,
      );
    }

    const membership = await this.membershipsRepository.create({
      userId,
      organizationId,
      role,
    });

    this.logger.log(
      `Membership created: user ${userId} → org ${organizationId} (${role})`,
    );

    return membership;
  }

  async getMembership(
    userId: string,
    organizationId: string,
  ): Promise<Membership | null> {
    return this.membershipsRepository.findByUserAndOrg(
      userId,
      organizationId,
    );
  }

  async listUserMemberships(userId: string): Promise<Membership[]> {
    return this.membershipsRepository.findByUserId(userId);
  }

  async listOrgMembers(organizationId: string): Promise<Membership[]> {
    return this.membershipsRepository.findByOrgId(organizationId);
  }
}
