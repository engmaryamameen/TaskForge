import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {}

  async create(data: {
    userId: string;
    tokenHash: string;
    familyId: string;
    device?: string;
    ip?: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const token = this.repo.create(data);
    return this.repo.save(token);
  }

  async findValidByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repo.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async revokeById(id: string): Promise<void> {
    await this.repo.update(id, { revokedAt: new Date() });
  }

  /**
   * Atomically revokes a token only if it hasn't already been revoked.
   * Returns the token if revocation succeeded (we won the race), or null
   * if someone else revoked it first (lost the race — possible token theft).
   */
  async atomicRevoke(id: string): Promise<RefreshToken | null> {
    const result = await this.repo
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('id = :id AND revoked_at IS NULL', { id })
      .returning('*')
      .execute();

    if (result.affected === 0) {
      return null; // Already revoked — concurrent use or theft
    }

    return result.raw[0] as RefreshToken;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async revokeByFamily(familyId: string): Promise<void> {
    await this.repo.update(
      { familyId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}
