import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { InvitesRepository } from '../repositories/invites.repository';
import { MembershipsRepository } from '../repositories/memberships.repository';
import { MembershipsService } from './memberships.service';
import { CreateInviteDto, AcceptInviteDto } from '../dto';
import { Membership } from '../entities/membership.entity';
import { Invite } from '../entities/invite.entity';
import { RequestContext } from '../../../shared/interfaces';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';
import { EventType, Role } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';
import { INVITE_TOKEN_TTL_HOURS } from '../../../shared/constants';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);

  constructor(
    private readonly invitesRepository: InvitesRepository,
    private readonly membershipsService: MembershipsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async createInvite(
    ctx: RequestContext,
    dto: CreateInviteDto,
  ): Promise<{ token: string }> {
    const email = dto.email?.trim().toLowerCase();
    const role = dto.role ?? Role.MEMBER;

    // Check for duplicate active invite
    if (email) {
      const existing = await this.invitesRepository.findActiveByEmailAndOrg(
        email,
        ctx.organizationId!,
      );
      if (existing) {
        throw new AppError(
          ErrorCodes.INVITE_ALREADY_USED,
          'An active invite already exists for this email in this organization',
          409,
        );
      }
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + INVITE_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    await this.invitesRepository.create({
      organizationId: ctx.organizationId!,
      email: email || undefined,
      tokenHash,
      role,
      expiresAt,
      createdBy: ctx.userId,
    });

    this.logger.log(
      `Invite created for org ${ctx.organizationId} by ${ctx.userId}`,
    );

    this.eventEmitter.emit(EventType.INVITE_CREATED, {
      type: EventType.INVITE_CREATED,
      payload: { email, role },
      occurredAt: new Date(),
      organizationId: ctx.organizationId!,
      triggeredBy: ctx.userId,
    } satisfies DomainEvent);

    // Raw token returned once — never stored server-side
    return { token: rawToken };
  }

  async validateInvite(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const invite = await this.invitesRepository.findValidByTokenHash(tokenHash);

    if (!invite) {
      throw new AppError(
        ErrorCodes.INVITE_NOT_FOUND,
        'Invalid, expired, or already used invite token',
        400,
      );
    }

    return {
      organizationName: invite.organization?.name ?? 'Unknown',
      email: invite.email ?? null,
      role: invite.role,
    };
  }

  async acceptInvite(
    userId: string,
    userEmail: string,
    dto: AcceptInviteDto,
  ): Promise<Membership> {
    const tokenHash = this.hashToken(dto.token);
    const invite = await this.invitesRepository.findValidByTokenHash(tokenHash);

    if (!invite) {
      throw new AppError(
        ErrorCodes.INVITE_NOT_FOUND,
        'Invalid, expired, or already used invite token',
        400,
      );
    }

    // If invite targets a specific email, enforce match
    if (invite.email && invite.email !== userEmail.toLowerCase()) {
      throw new AppError(
        ErrorCodes.INVITE_NOT_FOUND,
        'This invite was not issued to your email address',
        403,
      );
    }

    // Atomic: create membership + mark invite used in a single transaction
    // Prevents partial state (membership without invite consumed, or vice versa)
    const membership = await this.dataSource.transaction(async (manager) => {
      // Check for existing membership inside transaction to prevent race condition
      const existing = await manager.findOne(Membership, {
        where: { userId, organizationId: invite.organizationId },
      });

      if (existing) {
        throw new AppError(
          ErrorCodes.ALREADY_MEMBER,
          'User is already a member of this organization',
          409,
        );
      }

      const newMembership = manager.create(Membership, {
        userId,
        organizationId: invite.organizationId,
        role: invite.role,
      });

      const saved = await manager.save(newMembership);

      // Mark invite as used within the same transaction
      await manager.update(Invite, invite.id, { usedAt: new Date() });

      return saved;
    });

    this.logger.log(
      `Invite accepted: user ${userId} joined org ${invite.organizationId}`,
    );

    this.eventEmitter.emit(EventType.MEMBER_JOINED, {
      type: EventType.MEMBER_JOINED,
      payload: { userId, role: invite.role },
      occurredAt: new Date(),
      organizationId: invite.organizationId,
      triggeredBy: userId,
    } satisfies DomainEvent);

    return membership;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
