import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';

@Injectable()
export class EmailVerificationTokenRepository {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly repo: Repository<EmailVerificationToken>,
  ) {}

  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<EmailVerificationToken> {
    const row = this.repo.create(data);
    return this.repo.save(row);
  }

  async invalidateUnusedForUser(userId: string): Promise<void> {
    await this.repo.delete({ userId, usedAt: IsNull() });
  }

  /** Unused token row by hash (caller checks expiry vs invalid). */
  async findUnusedByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null> {
    return this.repo.findOne({
      where: { tokenHash, usedAt: IsNull() },
    });
  }

  async findValidByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null> {
    return this.repo.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.repo.update(id, { usedAt: new Date() });
  }
}
