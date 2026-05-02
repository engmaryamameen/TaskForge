import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly repo: Repository<PasswordResetToken>,
  ) {}

  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const row = this.repo.create(data);
    return this.repo.save(row);
  }

  async invalidateUnusedForUser(userId: string): Promise<void> {
    await this.repo.delete({ userId, usedAt: IsNull() });
  }

  async findUnusedByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | null> {
    return this.repo.findOne({
      where: { tokenHash, usedAt: IsNull() },
    });
  }

  async findValidByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetToken | null> {
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
