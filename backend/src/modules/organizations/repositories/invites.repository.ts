import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { Invite } from '../entities/invite.entity';

@Injectable()
export class InvitesRepository {
  constructor(
    @InjectRepository(Invite)
    private readonly repo: Repository<Invite>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: {
    organizationId: string;
    email?: string;
    tokenHash: string;
    role: string;
    expiresAt: Date;
    createdBy: string;
  }): Promise<Invite> {
    const invite = this.repo.create(data);
    return this.repo.save(invite);
  }

  async findValidByTokenHash(tokenHash: string): Promise<Invite | null> {
    return this.repo.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['organization'],
    });
  }

  get queryRunner() {
    return this.dataSource;
  }

  async findActiveByEmailAndOrg(
    email: string,
    organizationId: string,
  ): Promise<Invite | null> {
    return this.repo.findOne({
      where: {
        email,
        organizationId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.repo.update(id, { usedAt: new Date() });
  }

  /** Pending = not used and not expired (same criteria as “active” duplicate check). */
  async findByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<Invite | null> {
    return this.repo.findOne({
      where: { id, organizationId },
    });
  }

  async updateInviteToken(
    id: string,
    data: { tokenHash: string; expiresAt: Date },
  ): Promise<void> {
    await this.repo.update(id, {
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    });
  }

  async findPendingByOrganization(organizationId: string): Promise<Invite[]> {
    return this.repo.find({
      where: {
        organizationId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
        createdBy: true,
      },
    });
  }
}
