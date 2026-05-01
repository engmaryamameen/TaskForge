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
}
